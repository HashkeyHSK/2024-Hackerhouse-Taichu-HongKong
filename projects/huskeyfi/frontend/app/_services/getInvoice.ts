"use server";

import { callApi } from "../_utils/callApi";

type Invoice = {
  id: string;
  BOLT11: string;
  LNstatus: string;
  hashkeyStatus: string;
};

const getInvoice = async ({ invoiceId }: { invoiceId: string }) => {
  const res = await callApi({
    endpoint: `/getInvoice/${invoiceId}`,
    method: "GET",
  });

  if (res.error) {
    throw new Error(res.error);
  }

  return res.data as Invoice;
};

export default getInvoice;
