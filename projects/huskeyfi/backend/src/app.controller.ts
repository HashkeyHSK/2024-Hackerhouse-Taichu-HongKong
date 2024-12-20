import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Invoice, InvoiceResponse } from 'dtos/dto';

// TODO:
// 1. Make invoice with Amount
// 2. Post webhook

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('getInvoice')
  getInvoice(@Body() body: any): Promise<InvoiceResponse> {
    return this.appService.getInvoice(body.invoiceId);
  }

  @Post('createInvoice')
  postInvoice(@Body() body: Invoice): Promise<InvoiceResponse> {
    return this.appService.createInvoice(body.amount); // TODO: 숫자로 받고 있음
  }

  @Post('webhook')
  postWebhook(@Body() body: any): Promise<string> {
    return this.appService.webhook(body);
  }
}
