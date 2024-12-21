"use server";

import { callApi } from "../_utils/callApi";

type Invoice = {
  id: string;
  invoiceId: string;
  BOLT11: string;
  hashkeyAddress: string;
  amount: string;
  LNstatus: "Y" | "N" | "P" | "E";
  hashkeyStatus: "Y" | "N" | "P";
  hashkeyTx: string | null;
  fromNetwork: "L" | "H";
  toNetwork: "L" | "H";
};

const getTransactionById = async ({ id }: { id: string }) => {
  const res = await callApi({
    endpoint: `/getTransactionById/${id}`,
    method: "GET",
  });

  if (res.error) {
    throw new Error(res.error);
  }

  return res as unknown as Invoice;
};

export default getTransactionById;
