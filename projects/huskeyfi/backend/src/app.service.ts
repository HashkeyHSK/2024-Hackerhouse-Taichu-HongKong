import { Injectable } from '@nestjs/common';
import { Invoice, InvoiceResponse } from './types';
import axios from 'axios';

@Injectable()
export class AppService {
  private BTCPAY_URL = process.env.BTCPAY_URL;
  private BRIDGE_CENTER_ID = process.env.BRIDGE_CENTER_ID;

  getHello(): string {
    return 'Hello Hashkey!!! 😄';
  }

  makeInvoice(amount: number): Invoice {
    return {
      amount: amount.toString(),
      description: 'Bridge between Hashkey and Lightning Network',
      descriptionHashOnly: false,
      expiry: 600,
      privateRouteHints: false,
    };
  }

  // https://btcpay.stackstake.io/api/v1/stores/{storeId}/lightning/BTC/invoices
  async createInvoice(amount: number): Promise<InvoiceResponse> {
    const invoice = this.makeInvoice(amount);
    console.log('creating invoice', invoice);
    //   {
    //     "id": "ecdf1c16f8ce8fe643fc9c6c76bfbef61d86a5afe5840ffbbc6cc939cbf7e542",
    //     "status": "Unpaid",
    //     "BOLT11": "lnbc8880n1pnk2n65pp5an03c9hce687vslun3k8d0a77cwcdfd0ukzql7audnynnjlhu4pqdqvdpshx6rtv4uscqzzsxqzz6sp509le7thnljsh0mkay4q3l6hxentwzs2v27nkpfscmmpqyxw7nf8s9qyyssqkx09jvv04a9jzwhyawt8xzkadh8qaj6dfk9863h4c3yx79m0y8zs9f65usutwyyv95tkkyvl78jj5r35qhzn4qkpthklyje76x9w9gsphm4mvt",
    //     "paymentHash": "ecdf1c16f8ce8fe643fc9c6c76bfbef61d86a5afe5840ffbbc6cc939cbf7e542",
    //     "paidAt": null,
    //     "expiresAt": 1734692782,
    //     "amount": "888000",
    //     "amountReceived": null
    // }

    const response: InvoiceResponse = await axios.post(
      `${this.BTCPAY_URL}/api/v1/stores/${this.BRIDGE_CENTER_ID}/lightning/BTC/invoices`,
      invoice,
    );
    return response;
  }
}
