import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import {
  HashkeyToLNInput,
  HashkeyToLNResponse,
  Invoice,
  InvoiceResponse,
} from 'dtos/dto';
import { LNToHashkeyTransaction } from './entities/LNToHashkeyTransaction.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // get transaction from sqlite
  @Get('getTransaction/:invoiceId')
  getTransaction(
    @Param('invoiceId') invoiceId: string,
  ): Promise<LNToHashkeyTransaction> {
    return this.appService.getTransaction(invoiceId);
  }

  @Get('getTransactionById/:id')
  getTransactionById(@Param('id') id: string): Promise<LNToHashkeyTransaction> {
    return this.appService.getTransactionById(id);
  }

  // get transaction from sqlite
  @Get('getTransactions')
  getTransactions(): Promise<LNToHashkeyTransaction[]> {
    return this.appService.getTransactions();
  }

  @Get('getInvoice/:invoiceId')
  getInvoice(@Param('invoiceId') invoiceId: string): Promise<InvoiceResponse> {
    return this.appService.getInvoice(invoiceId);
  }

  @Post('LNToHashkey')
  postInvoice(@Body() body: Invoice): Promise<InvoiceResponse> {
    return this.appService.LNToHashkey(body.amount, body.hashkeyAddress);
  }

  @Post('hashkeyToLN')
  postHashkeyToLN(
    @Body() body: HashkeyToLNInput,
  ): Promise<HashkeyToLNResponse> {
    return this.appService.hashkeyToLN(body);
  }
}
