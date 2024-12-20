import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { InvoiceResponse } from './types';

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
  postInvoice(@Body() body: any): Promise<InvoiceResponse> {
    return this.appService.createInvoice(body.amount);
  }

  @Post('webhook')
  postWebhook(@Body() body: any): Promise<string> {
    return this.appService.webhook(body);
  }
}
