import { Injectable } from '@nestjs/common';
import { Invoice, InvoiceResponse } from './types';
import axios from 'axios';

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

  private getAuthHeaders() {
    return {
      Authorization: `token ${this.API_KEY}`,
    };
  }

  getHello(): string {
    return 'Hello Hashkey!!! 😄';
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
  async createInvoice(amount: string): Promise<InvoiceResponse> {
    const invoice = this.makeInvoice(amount);
    console.log('creating invoice', invoice);

    const response = await axios.post(
      `${this.BTCPAY_URL}api/v1/stores/${this.BRIDGE_CENTER_ID}/lightning/BTC/invoices`,
      invoice,
      {
        headers: this.getAuthHeaders(),
      },
    );
    return response.data;
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

  async webhook(body: any): Promise<string> {
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
