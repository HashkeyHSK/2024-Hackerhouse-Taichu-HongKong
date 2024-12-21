import { Injectable, Logger } from '@nestjs/common';
import { LNToHashkeyTransaction } from './entities/LNToHashkeyTransaction.entity';
import { Invoice, InvoiceResponse } from './types';
import axios from 'axios';
import { LNToHashkeyTransactionService } from './LNToHashkeyTransaction.service';
import { ethers, Wallet, parseUnits } from 'ethers';
import ERC20ABI from './abis/ERC20';
import { HashkeyToLNInput, LNReceivedPaymentInput } from 'dtos/dto';

enum WebhookType {
  InvoiceCreated = 'InvoiceCreated',
  InvoiceExpired = 'InvoiceExpired',
  InvoiceReceivedPayment = 'InvoiceReceivedPayment',
  InvoicePaymentSettled = 'InvoicePaymentSettled',
  InvoiceProcessing = 'InvoiceProcessing',
  InvoiceInvalid = 'InvoiceInvalid',
  InvoiceSettled = 'InvoiceSettled',
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private BTCPAY_URL = process.env.BTCPAY_URL;
  private BRIDGE_CENTER_ID = process.env.BRIDGE_CENTER_ID;
  private API_KEY = process.env.API_KEY;
  private HASHKEY_RPC_URL = process.env.HASHKEY_RPC_URL;

  constructor(
    private LNToHashkeyTransactionService: LNToHashkeyTransactionService,
  ) {}

  private getAuthHeaders() {
    return {
      Authorization: `token ${this.API_KEY}`,
    };
  }

  getHello(): string {
    return 'Hello Hashkey Chain!!! 😄 Congratulations on Mainnet Launch!!! 🎉';
  }

  getTransaction(invoiceId: string): Promise<LNToHashkeyTransaction> {
    return this.LNToHashkeyTransactionService.findOneInvoiceId(invoiceId);
  }

  getTransactionById(id: string): Promise<LNToHashkeyTransaction> {
    return this.LNToHashkeyTransactionService.findOneById(id);
  }

  getTransactions(): Promise<LNToHashkeyTransaction[]> {
    return this.LNToHashkeyTransactionService.findAll();
  }

  makeInvoice(amount: string): Invoice {
    return {
      amount: amount.toString(),
      description: 'Bridge between Hashkey and Lightning Network',
      descriptionHashOnly: false,
      expiry: 600,
      privateRouteHints: false,
    };
  }

  // https://btcpay.stackstake.io/api/v1/stores/{storeId}/lightning/BTC/invoices
  async createInvoice(
    amount: string,
    hashkeyAddress: string,
  ): Promise<InvoiceResponse> {
    const invoice = this.makeInvoice(amount);
    this.logger.log('creating invoice', invoice);

    // 인보이스 생성
    try {
      const response = await axios.post(
        `${this.BTCPAY_URL}api/v1/stores/${this.BRIDGE_CENTER_ID}/lightning/BTC/invoices`,
        invoice,
        {
          headers: this.getAuthHeaders(),
        },
      );

      this.logger.log('response', response.data);

      if (response.data.status === 'expired') {
        return {
          status: 'expired',
        };
      }

      // 정상적으로 생성된 경우 sqlite 저장
      const invoiceId = response.data.id;
      const BOLT11 = response.data.BOLT11;

      const id = await this.LNToHashkeyTransactionService.create({
        invoiceId,
        BOLT11,
        hashkeyAddress,
        amount,
        fromNetwork: 'L',
        toNetwork: 'H',
      });

      return response.data;
    } catch (error) {
      this.logger.error('Error creating invoice', error);
      return {
        status: 'error',
      };
    }
  }

  async getInvoice(invoiceId: string): Promise<InvoiceResponse> {
    const response = await axios.get(
      `${this.BTCPAY_URL}api/v1/stores/${this.BRIDGE_CENTER_ID}/lightning/BTC/invoices/${invoiceId}`,
      {
        headers: this.getAuthHeaders(),
      },
    );
    return response.data;
  }

  async sendToHashkeyAddress(
    amount: string,
    hashkeyAddress: string,
  ): Promise<string> {
    // send to hashkey address using hashkey private key
    const privateKey = process.env.HASHKEY_PRIVATE_KEY;
    const provider = new ethers.JsonRpcProvider(this.HASHKEY_RPC_URL);
    const wallet = new Wallet(privateKey, provider);
    // get hashkey btc address
    const hashkeyBtcAddress = process.env.HASHKEY_BTC_ADDRESS;
    this.logger.log('hashkeyBtcAddress', hashkeyBtcAddress);
    this.logger.log('hashkeyAddress', hashkeyAddress);
    this.logger.log('amount', amount);

    try {
      // Call hBTC contract to mint hBTC tokens
      const hBTCContract = new ethers.Contract(
        hashkeyBtcAddress,
        ERC20ABI,
        wallet,
      );
      // Convert mSAT to BTC (1 BTC = 100,000,000,000 mSAT)
      const btcAmount = (Number(amount) / 100000000000).toFixed(8);
      const tx = await hBTCContract.mint(
        hashkeyAddress,
        parseUnits(btcAmount, 18),
      );

      this.logger.log('tx', tx.hash);
      return tx.hash;
    } catch (error) {
      this.logger.error('Error minting hBTC to hashkey address', error);
      throw error;
    }
  }

  // 해시키체인에서 HASHKEY_BRIDGE_ADDRESS 주소로 입금된 hBTC 트랜잭션 emitted 이벤트를 조회한다.
  async getHashkeyBridgeTransactions(): Promise<any> {
    // 해시키체인에서 HASHKEY_BRIDGE_ADDRESS 주소로 입금된 hBTC 토큰 이벤트를 조회한다.
    const provider = new ethers.JsonRpcProvider(this.HASHKEY_RPC_URL);
    const wallet = new Wallet(process.env.HASHKEY_PRIVATE_KEY, provider);
    const hashkeyBridgeAddress = process.env.HASHKEY_BRIDGE_ADDRESS;
    const hashkeyBtcAddress = process.env.HASHKEY_BTC_ADDRESS;

    const hBTCContract = new ethers.Contract(
      hashkeyBtcAddress,
      ERC20ABI,
      wallet,
    );

    const events = await hBTCContract.queryFilter(
      hBTCContract.filters.Transfer(null, hashkeyBridgeAddress),
    );

    this.logger.log('events', events);

    return events;
  }

  async hashkeyToLN(body: HashkeyToLNInput): Promise<string> {
    this.logger.log('received hashkeyToLN', body);
    const { lnAddress, hashkeyAddress, amount, hashkeyTxId } = body;

    // 해시키체인에서 입금된 hBTC 트랜잭션을 조회한다.
    const events = await this.getHashkeyBridgeTransactions();

    // events에 조회된 address와 입력된 address가 일치하는 트랜잭션을 조회한다.
    const event = events.find(
      (event) => event.args[0].toLowerCase() === hashkeyAddress.toLowerCase(),
    );

    if (!event) {
      this.logger.error('No event found');
      return;
    }

    // 조회된 트랜잭션을 sqlite에 저장한다.
    const id = await this.LNToHashkeyTransactionService.create({
      BOLT11: lnAddress,
      hashkeyAddress,
      amount,
      hashkeyTx: hashkeyTxId,
      fromNetwork: 'H',
      toNetwork: 'L',
      LNstatus: 'N',
      hashkeyStatus: 'Y',
    });

    return id;
  }

  // LN BOLT11 주소로 payment 받은 경우
  async LNReceivedPayment(body: LNReceivedPaymentInput): Promise<any> {
    this.logger.log('received LNReceivedPayment', body);

    try {
      // https://btcpay.stackstake.io/api/v1/stores/{storeId}/lightning/{cryptoCode}/invoices/pay
      const response = await axios.post(
        `${this.BTCPAY_URL}api/v1/stores/${this.BRIDGE_CENTER_ID}/lightning/BTC/invoices/pay`,
        body,
        {
          headers: this.getAuthHeaders(),
        },
      );

      this.logger.log('response', response.data);

      // Update LN status to Y on success
      await this.LNToHashkeyTransactionService.updateLNStatus(body.id, 'Y');

      return response.data;
    } catch (error) {
      this.logger.error('Error in LNReceivedPayment', error);
      throw error;
    }
  }

  async webhook(body: any): Promise<string> {
    this.logger.log('received webhook', body);
    const webhookType = body.type;
    if (webhookType === WebhookType.InvoiceCreated) {
      this.logger.log('InvoiceCreated');
    } else if (webhookType === WebhookType.InvoiceExpired) {
      this.logger.log('InvoiceExpired');
    } else if (webhookType === WebhookType.InvoiceReceivedPayment) {
      this.logger.log('InvoiceReceivedPayment');
    } else if (webhookType === WebhookType.InvoicePaymentSettled) {
      this.logger.log('InvoicePaymentSettled');
    } else if (webhookType === WebhookType.InvoiceProcessing) {
      this.logger.log('InvoiceProcessing');
    } else if (webhookType === WebhookType.InvoiceInvalid) {
      this.logger.log('InvoiceInvalid');
    } else if (webhookType === WebhookType.InvoiceSettled) {
      this.logger.log('InvoiceSettled');
    }
    return 'test';
  }
}
