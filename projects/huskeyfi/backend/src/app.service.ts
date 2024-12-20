import { Injectable } from '@nestjs/common';
import { LNToHashkeyTransaction } from './entities/LNToHashkeyTransaction.entity';
import { Invoice, InvoiceResponse } from './types';
import axios from 'axios';
import { LNToHashkeyTransactionService } from './LNToHashkeyTransaction.repository';
import ethers, { Wallet, parseUnits } from 'ethers';
import ERC20ABI from './abis/ERC20';

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
  private BTCPAY_URL = process.env.BTCPAY_URL;
  private BRIDGE_CENTER_ID = process.env.BRIDGE_CENTER_ID;
  private API_KEY = process.env.API_KEY;

  constructor(
    private LNToHashkeyTransactionService: LNToHashkeyTransactionService,
  ) {}

  private getAuthHeaders() {
    return {
      Authorization: `token ${this.API_KEY}`,
    };
  }

  getHello(): string {
    return 'Hello Hashkey!!! 😄';
  }

  getTransaction(invoiceId: string): Promise<LNToHashkeyTransaction> {
    return this.LNToHashkeyTransactionService.findOne(invoiceId);
  }

  getTransactions(): Promise<LNToHashkeyTransaction[]> {
    return this.LNToHashkeyTransactionService.findAll({
      LNstatus: 'N',
    });
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
    console.log('creating invoice', invoice);

    // 인보이스 생성
    try {
      const response = await axios.post(
        `${this.BTCPAY_URL}api/v1/stores/${this.BRIDGE_CENTER_ID}/lightning/BTC/invoices`,
        invoice,
        {
          headers: this.getAuthHeaders(),
        },
      );

      console.log('response', response.data);

      if (response.data.status === 'expired') {
        return {
          status: 'expired',
        };
      }

      // 정상적으로 생성된 경우 sqlite 저장
      const invoiceId = response.data.id;
      const BOLT11 = response.data.BOLT11;

      await this.LNToHashkeyTransactionService.create(
        invoiceId,
        BOLT11,
        hashkeyAddress,
        amount,
      );

      return response.data;
    } catch (error) {
      console.error('Error creating invoice', error);
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
    const wallet = new Wallet(privateKey);
    // get hashkey btc address
    const hashkeyBtcAddress = process.env.HASHKEY_BTC_ADDRESS;
    console.log('hashkeyBtcAddress', hashkeyBtcAddress);
    console.log('hashkeyAddress', hashkeyAddress);
    console.log('amount', amount);

    try {
      // Call hBTC contract to mint hBTC tokens
      const hBTCContract = new ethers.Contract(
        hashkeyBtcAddress,
        ERC20ABI,
        wallet,
      );
      const tx = await hBTCContract.mint(
        hashkeyAddress,
        parseUnits(amount, 18),
      );
      return tx.hash;
    } catch (error) {
      console.error('Error minting hBTC to hashkey address', error);
      throw error;
    }
  }

  async webhook(body: any): Promise<string> {
    console.log('received webhook', body);
    const webhookType = body.type;
    if (webhookType === WebhookType.InvoiceCreated) {
      console.log('InvoiceCreated');
    } else if (webhookType === WebhookType.InvoiceExpired) {
      console.log('InvoiceExpired');
    } else if (webhookType === WebhookType.InvoiceReceivedPayment) {
      console.log('InvoiceReceivedPayment');
    } else if (webhookType === WebhookType.InvoicePaymentSettled) {
      console.log('InvoicePaymentSettled');
    } else if (webhookType === WebhookType.InvoiceProcessing) {
      console.log('InvoiceProcessing');
    } else if (webhookType === WebhookType.InvoiceInvalid) {
      console.log('InvoiceInvalid');
    } else if (webhookType === WebhookType.InvoiceSettled) {
      console.log('InvoiceSettled');
    }
    return 'test';
  }
}
