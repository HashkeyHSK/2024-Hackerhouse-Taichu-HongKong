"use server";

import { callApi } from "../_utils/callApi";

// Props type definition for creating a Lightning Network invoice
type CreateInvoiceProps = {
  amount: string;
  description?: string;
  descriptionHashOnly?: boolean;
  hashkeyAddress: string;
};

// Type definition for Lightning Network invoice response
type Invoice = {
  id: string;
  status: string;
  BOLT11: string;
  paymentHash: string;
  paidAt: any;
  expiresAt: number;
  amount: string;
  amountReceived: any;
};

// Function to create a Lightning Network invoice that pays to a Hashkey address
const createInvoice = async ({
  amount,
  description,
  descriptionHashOnly,
  hashkeyAddress,
}: CreateInvoiceProps) => {
  // Call API to create invoice
  const res = await callApi({
    endpoint: "/LNToHashkey",
    method: "POST",
    body: {
      amount: `${amount}000`, // Convert to millisatoshis
      description: description || "",
      descriptionHashOnly: descriptionHashOnly || true,
      hashkeyAddress,
    },
  });

  // Handle API error response
  if (res.error) {
    throw new Error(res.error);
  }

  // Return typed invoice response
  return res as unknown as Invoice;
};

export default createInvoice;
