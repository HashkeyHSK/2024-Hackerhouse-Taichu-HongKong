export interface Invoice {
  amount: string;
  description: string;
  descriptionHashOnly: boolean;
  expiry: number;
  privateRouteHints: boolean;
}

export interface InvoiceResponse {
  id?: string;
  status: string;
  BOLT11?: string;
  paymentHash?: string;
  paidAt?: string | null;
  expiresAt?: number;
  amount?: string;
  amountReceived?: string | null;
}
