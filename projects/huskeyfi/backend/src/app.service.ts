import { Injectable, Logger } from '@nestjs/common';
import { LNToHashkeyTransaction } from './entities/LNToHashkeyTransaction.entity';
import { Invoice, InvoiceResponse } from './types';
import axios from 'axios';
import { LNToHashkeyTransactionService } from './LNToHashkeyTransaction.service';
import { ethers, Wallet, parseUnits } from 'ethers';
import ERC20ABI from './abis/ERC20';
import {
  HashkeyToLNInput,
  HashkeyToLNResponse,
  LNReceivedPaymentInput,
} from 'dtos/dto';

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

  async getTransaction(invoiceId: string): Promise<LNToHashkeyTransaction> {
    try {
      return await this.LNToHashkeyTransactionService.findOneInvoiceId(
        invoiceId,
      );
    } catch (error) {
      this.logger.error('Error getting transaction', error);
      throw error;
    }
  }

  async getTransactionById(id: string): Promise<LNToHashkeyTransaction> {
    try {
      return await this.LNToHashkeyTransactionService.findOneById(id);
    } catch (error) {
      this.logger.error('Error getting transaction by id', error);
      throw error;
    }
  }

  async getTransactions(): Promise<LNToHashkeyTransaction[]> {
    try {
      return await this.LNToHashkeyTransactionService.findAll();
    } catch (error) {
      this.logger.error('Error getting transactions', error);
      throw error;
    }
  }

  makeInvoice(amount: string): Invoice {
    try {
      return {
        amount: amount.toString(),
        description: 'Bridge between Hashkey and Lightning Network',
        descriptionHashOnly: false,
        expiry: 600,
        privateRouteHints: false,
      };
    } catch (error) {
      this.logger.error('Error making invoice', error);
      throw error;
    }
  }

  // https://btcpay.stackstake.io/api/v1/stores/{storeId}/lightning/BTC/invoices
  async LNToHashkey(
    amount: string,
    hashkeyAddress: string,
  ): Promise<InvoiceResponse> {
    const invoice = this.makeInvoice(amount);
    this.logger.log('creating invoice', invoice);

    // Create invoice
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

      // If invoice is created successfully, save to sqlite
      const invoiceId = response.data.id;
      const BOLT11 = response.data.BOLT11;

      await this.LNToHashkeyTransactionService.create({
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
    try {
      const response = await axios.get(
        `${this.BTCPAY_URL}api/v1/stores/${this.BRIDGE_CENTER_ID}/lightning/BTC/invoices/${invoiceId}`,
        {
          headers: this.getAuthHeaders(),
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error getting invoice', error);
      throw error;
    }
  }

  async sendToHashkeyAddress(
    amount: string,
    hashkeyAddress: string,
  ): Promise<string> {
    try {
      // send to hashkey address using hashkey private key
      const privateKey = process.env.HASHKEY_PRIVATE_KEY;
      const provider = new ethers.JsonRpcProvider(this.HASHKEY_RPC_URL);
      const wallet = new Wallet(privateKey, provider);
      // get hashkey btc address
      const hashkeyBtcAddress = process.env.HASHKEY_BTC_ADDRESS;
      this.logger.log('hashkeyBtcAddress', hashkeyBtcAddress);
      this.logger.log('hashkeyAddress', hashkeyAddress);
      this.logger.log('amount', amount);

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

  // Query emitted events for hBTC transactions sent to HASHKEY_BRIDGE_ADDRESS
  async getHashkeyBridgeTransactions(): Promise<any> {
    try {
      // Query hBTC token events for transfers to HASHKEY_BRIDGE_ADDRESS
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
    } catch (error) {
      this.logger.error('Error getting hashkey bridge transactions', error);
      throw error;
    }
  }

  async hashkeyToLN(body: HashkeyToLNInput): Promise<HashkeyToLNResponse> {
    try {
      this.logger.log('received hashkeyToLN', body);
      const { lnAddress, hashkeyAddress, amount, hashkeyTxId } = body;

      // Query hBTC transactions deposited on Hashkey chain
      const events = await this.getHashkeyBridgeTransactions();

      // Find transaction where deposited address matches input address
      const event = events.find(
        (event) => event.args[0].toLowerCase() === hashkeyAddress.toLowerCase(),
      );

      if (!event) {
        this.logger.error('No event found');
        return;
      }

      // Save the found transaction to sqlite
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

      this.logger.log('hashkeyToLN id', { id });

      return { id };
    } catch (error) {
      this.logger.error('Error in hashkeyToLN', error);
      throw error;
    }
  }

  // Handle payment received to LN BOLT11 address
  async LNReceivedPayment(body: LNReceivedPaymentInput): Promise<any> {
    try {
      this.logger.log('received LNReceivedPayment', body);

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
      await this.LNToHashkeyTransactionService.update(body.id, {
        LNstatus: 'Y',
      });

      return response.data;
    } catch (error) {
      this.logger.error('Error in LNReceivedPayment', error);
      throw error;
    }
  }
}
