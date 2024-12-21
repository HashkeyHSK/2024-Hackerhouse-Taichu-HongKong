"use server";

import { callApi } from "../_utils/callApi";

type CreateInvoiceProps = {
  amount: string;
  description?: string;
  descriptionHashOnly?: boolean;
  hashkeyAddress: string;
};

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

const createInvoice = async ({
  amount,
  description,
  descriptionHashOnly,
  hashkeyAddress,
}: CreateInvoiceProps) => {
  const res = await callApi({
    endpoint: "/LNToHashkey",
    method: "POST",
    body: {
      amount: `${amount}000`,
      description: description || "",
      descriptionHashOnly: descriptionHashOnly || true,
      hashkeyAddress,
    },
  });

  if (res.error) {
    throw new Error(res.error);
  }

  return res as unknown as Invoice;
};

export default createInvoice;
