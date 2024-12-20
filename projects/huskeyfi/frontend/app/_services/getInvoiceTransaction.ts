"use server";

import { callApi } from "../_utils/callApi";

type Invoice = {
  invoiceId: string;
  BOLT11: string;
  hashkeyAddress: string;
  amount: string;
  LNstatus: string;
  hashkeyStatus: string;
};

const getInvoiceTransaction = async ({ invoiceId }: { invoiceId: string }) => {
  const res = await callApi({
    endpoint: `/getTransaction/${invoiceId}`,
    method: "GET",
  });

  if (res.error) {
    throw new Error(res.error);
  }

  return res.data as Invoice;
};

export default getInvoiceTransaction;
