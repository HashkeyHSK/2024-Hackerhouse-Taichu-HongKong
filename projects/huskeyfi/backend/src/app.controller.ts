import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Invoice, InvoiceResponse } from './types';

enum WebhookType {
  InvoiceCreated = 'InvoiceCreated',
  InvoiceExpired = 'InvoiceExpired',
  InvoiceReceivedPayment = 'InvoiceReceivedPayment',
  InvoicePaymentSettled = 'InvoicePaymentSettled',
  InvoiceProcessing = 'InvoiceProcessing',
  InvoiceInvalid = 'InvoiceInvalid',
  InvoiceSettled = 'InvoiceSettled',
}

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

  @Post('createInvoice')
  postInvoice(@Body() body: any): Promise<InvoiceResponse> {
    return this.appService.createInvoice(body.amount);
  }

  @Post('webhook')
  postWebhook(@Body() body: any): string {
    console.log('received webhook', body);
    const webhookType = body.type;
    if (webhookType === WebhookType.InvoiceCreated) {
      // {
      //   deliveryId: '5dGs78VTu8nmrj6rDKZXxf',
      //   webhookId: '6mGzWTC2pYw6kg1W9GiKEe',
      //   originalDeliveryId: '5dGs78VTu8nmrj6rDKZXxf',
      //   isRedelivery: false,
      //   type: 'InvoiceCreated',
      //   timestamp: 1734685708,
      //   storeId: 'DWZm5wfPFY2JCpf2fK6e8P7z7cr7mV1V6DQEGvC9r9EH',
      //   invoiceId: 'YYpysWafJPwDWQtwoDBwav',
      //   metadata: {}
      // }
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
