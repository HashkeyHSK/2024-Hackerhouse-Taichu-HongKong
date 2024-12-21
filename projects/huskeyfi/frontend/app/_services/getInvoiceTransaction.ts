"use server";

import { callApi } from "../_utils/callApi";

type Invoice = {
  id: string;
  invoiceId: string;
  BOLT11: string;
  hashkeyAddress: string;
  amount: string;
  LNstatus: "Y" | "N" | "P";
  hashkeyStatus: "Y" | "N" | "P";
  hashkeyTx: string | null;
  fromNetwork: "L" | "H";
  toNetwork: "L" | "H";
};

const getInvoiceTransaction = async ({ invoiceId }: { invoiceId: string }) => {
  const res = await callApi({
    endpoint: `/getTransaction/${invoiceId}`,
    method: "GET",
  });

  if (res.error) {
    throw new Error(res.error);
  }

  return res as unknown as Invoice;
};

export default getInvoiceTransaction;
