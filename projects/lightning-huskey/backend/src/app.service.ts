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

/**
 * Service handling Lightning Network and Hashkey Chain bridge operations
 * Manages cross-chain transactions between Lightning Network and Hashkey Chain
 */
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

  /**
   * Returns authorization headers with API key for BTCPay Server requests
   * @returns {Object} Headers object containing API key
   */
  private getAuthHeaders() {
    return {
      Authorization: `token ${this.API_KEY}`,
    };
  }

  /**
   * Basic health check endpoint
   * @returns {string} Welcome message
   */
  getHello(): string {
    return 'Hello Hashkey Chain!!! 😄 Congratulations on Mainnet Launch!!! 🎉';
  }

  /**
   * Retrieves a transaction by invoice ID from the database
   * @param {string} invoiceId - The invoice ID to search for
   * @returns {Promise<LNToHashkeyTransaction>} Transaction record
   */
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

  /**
   * Retrieves a transaction by ID from the database
   * @param {string} id - The transaction ID to search for
   * @returns {Promise<LNToHashkeyTransaction>} Transaction record
   */
  async getTransactionById(id: string): Promise<LNToHashkeyTransaction> {
    try {
      return await this.LNToHashkeyTransactionService.findOneById(id);
    } catch (error) {
      this.logger.error('Error getting transaction by id', error);
      throw error;
    }
  }

  /**
   * Retrieves all transactions from the database
   * @returns {Promise<LNToHashkeyTransaction[]>} Array of transaction records
   */
  async getTransactions(): Promise<LNToHashkeyTransaction[]> {
    try {
      return await this.LNToHashkeyTransactionService.findAll();
    } catch (error) {
      this.logger.error('Error getting transactions', error);
      throw error;
    }
  }

  /**
   * Creates a Lightning Network invoice with specified parameters
   * @param {string} amount - Amount in satoshis
   * @returns {Invoice} Invoice object
   */
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

  /**
   * Initiates a transfer from Lightning Network to Hashkey Chain
   * Creates invoice and stores transaction details
   * @param {string} amount - Amount in satoshis
   * @param {string} hashkeyAddress - Destination Hashkey Chain address
   * @returns {Promise<InvoiceResponse>} Invoice creation response
   */
  async LNToHashkey(
    amount: string,
    hashkeyAddress: string,
  ): Promise<InvoiceResponse> {
    const invoice = this.makeInvoice(amount);
    this.logger.log('creating invoice', invoice);

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

      // Save successful invoice to database
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

  /**
   * Retrieves invoice details from BTCPay Server
   * @param {string} invoiceId - ID of invoice to retrieve
   * @returns {Promise<InvoiceResponse>} Invoice details
   */
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

  /**
   * Mints hBTC tokens to a specified Hashkey Chain address
   * @param {string} amount - Amount to mint in BTC
   * @param {string} hashkeyAddress - Destination address for minted tokens
   * @returns {Promise<string>} Transaction hash
   */
  async sendToHashkeyAddress(
    amount: string,
    hashkeyAddress: string,
  ): Promise<string> {
    try {
      const privateKey = process.env.HASHKEY_PRIVATE_KEY;
      const provider = new ethers.JsonRpcProvider(this.HASHKEY_RPC_URL);
      const wallet = new Wallet(privateKey, provider);
      const hashkeyBtcAddress = process.env.HASHKEY_BTC_ADDRESS;
      this.logger.log('hashkeyBtcAddress', hashkeyBtcAddress);
      this.logger.log('hashkeyAddress', hashkeyAddress);
      this.logger.log('amount', amount);

      const hBTCContract = new ethers.Contract(
        hashkeyBtcAddress,
        ERC20ABI,
        wallet,
      );
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

  /**
   * Retrieves hBTC transfer events to bridge address
   * @returns {Promise<any>} Array of transfer events
   */
  async getHashkeyBridgeTransactions(): Promise<any> {
    try {
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

  /**
   * Processes transfer from Hashkey Chain to Lightning Network
   * Verifies transfer event and creates transaction record
   * @param {HashkeyToLNInput} body - Transfer details including addresses and amount
   * @returns {Promise<HashkeyToLNResponse>} Transaction ID
   */
  async hashkeyToLN(body: HashkeyToLNInput): Promise<HashkeyToLNResponse> {
    try {
      this.logger.log('received hashkeyToLN', body);
      const { lnAddress, hashkeyAddress, amount, hashkeyTxId } = body;

      const events = await this.getHashkeyBridgeTransactions();

      const event = events.find(
        (event) => event.args[0].toLowerCase() === hashkeyAddress.toLowerCase(),
      );

      if (!event) {
        this.logger.error('No event found');
        return;
      }

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

  /**
   * Processes Lightning Network payment receipt
   * Updates transaction status after successful payment
   * @param {LNReceivedPaymentInput} body - Payment details including amount and BOLT11
   * @returns {Promise<any>} Payment processing response
   */
  async LNReceivedPayment(body: LNReceivedPaymentInput): Promise<any> {
    try {
      this.logger.log('received LNReceivedPayment', body);

      const response = await axios.post(
        `${this.BTCPAY_URL}api/v1/stores/${this.BRIDGE_CENTER_ID}/lightning/BTC/invoices/pay`,
        body,
        {
          headers: this.getAuthHeaders(),
        },
      );

      this.logger.log('response', response.data);

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
