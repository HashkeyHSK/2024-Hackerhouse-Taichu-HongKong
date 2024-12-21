import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import {
  HashkeyToLNInput,
  HashkeyToLNResponse,
  Invoice,
  InvoiceResponse,
} from 'dtos/dto';
import { LNToHashkeyTransaction } from './entities/LNToHashkeyTransaction.entity';

/**
 * Main controller for handling Lightning Network and Hashkey Chain bridge operations
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Basic health check endpoint
   * @returns {string} Welcome message
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Retrieves a transaction record from SQLite database by invoice ID
   * @param {string} invoiceId - The invoice ID to search for
   * @returns {Promise<LNToHashkeyTransaction>} Transaction record
   */
  @Get('getTransaction/:invoiceId')
  getTransaction(
    @Param('invoiceId') invoiceId: string,
  ): Promise<LNToHashkeyTransaction> {
    return this.appService.getTransaction(invoiceId);
  }

  /**
   * Retrieves a transaction record from SQLite database by transaction ID
   * @param {string} id - The transaction ID to search for
   * @returns {Promise<LNToHashkeyTransaction>} Transaction record
   */
  @Get('getTransactionById/:id')
  getTransactionById(@Param('id') id: string): Promise<LNToHashkeyTransaction> {
    return this.appService.getTransactionById(id);
  }

  /**
   * Retrieves all transaction records from SQLite database
   * @returns {Promise<LNToHashkeyTransaction[]>} Array of transaction records
   */
  @Get('getTransactions')
  getTransactions(): Promise<LNToHashkeyTransaction[]> {
    return this.appService.getTransactions();
  }

  /**
   * Retrieves invoice details from BTCPay Server by invoice ID
   * @param {string} invoiceId - The invoice ID to fetch details for
   * @returns {Promise<InvoiceResponse>} Invoice details
   */
  @Get('getInvoice/:invoiceId')
  getInvoice(@Param('invoiceId') invoiceId: string): Promise<InvoiceResponse> {
    return this.appService.getInvoice(invoiceId);
  }

  /**
   * Initiates a transfer from Lightning Network to Hashkey Chain
   * @param {Invoice} body - Contains amount and destination Hashkey address
   * @returns {Promise<InvoiceResponse>} Created invoice details
   */
  @Post('LNToHashkey')
  postInvoice(@Body() body: Invoice): Promise<InvoiceResponse> {
    return this.appService.LNToHashkey(body.amount, body.hashkeyAddress);
  }

  /**
   * Initiates a transfer from Hashkey Chain to Lightning Network
   * @param {HashkeyToLNInput} body - Contains transfer details including addresses and amount
   * @returns {Promise<HashkeyToLNResponse>} Transfer response details
   */
  @Post('hashkeyToLN')
  postHashkeyToLN(
    @Body() body: HashkeyToLNInput,
  ): Promise<HashkeyToLNResponse> {
    return this.appService.hashkeyToLN(body);
  }
}
