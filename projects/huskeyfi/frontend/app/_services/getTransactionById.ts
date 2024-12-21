"use server";

import { callApi } from "../_utils/callApi";

// Type definition for transaction data
type Invoice = {
  id: string; // Unique identifier
  invoiceId: string; // Lightning invoice ID
  BOLT11: string; // BOLT11 invoice string
  hashkeyAddress: string; // HashKey Chain address
  amount: string; // Transaction amount
  LNstatus: "Y" | "N" | "P" | "E"; // Lightning Network status (Yes/No/Pending/Error)
  hashkeyStatus: "Y" | "N" | "P"; // HashKey Chain status (Yes/No/Pending)
  hashkeyTx: string | null; // HashKey Chain transaction hash
  fromNetwork: "L" | "H"; // Source network (Lightning/HashKey)
  toNetwork: "L" | "H"; // Destination network (Lightning/HashKey)
};

// Function to fetch transaction details by ID
const getTransactionById = async ({ id }: { id: string }) => {
  // Call API to get transaction data
  const res = await callApi({
    endpoint: `/getTransactionById/${id}`,
    method: "GET",
  });

  // Handle API error response
  if (res.error) {
    throw new Error(res.error);
  }

  // Return typed transaction data
  return res as unknown as Invoice;
};

export default getTransactionById;
