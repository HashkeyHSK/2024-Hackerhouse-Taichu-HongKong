"use server";

import { callApi } from "../_utils/callApi";

// Props type definition for HashKey Chain to Lightning Network bridge
type hashkeyToLNProps = {
  lnAddress: string; // Lightning Network address
  hashkeyAddress: string; // HashKey Chain address
  amount: string; // Transaction amount
  hashkeyTxId: string; // HashKey Chain transaction ID
};

// Function to initiate bridge from HashKey Chain to Lightning Network
const hashkeyToLN = async ({
  lnAddress,
  hashkeyAddress,
  amount,
  hashkeyTxId,
}: hashkeyToLNProps) => {
  // Call API to create bridge transaction
  const res = await callApi({
    endpoint: "/hashkeyToLN",
    method: "POST",
    body: {
      lnAddress,
      hashkeyAddress,
      amount,
      hashkeyTxId,
    },
  });

  // Handle API error response
  if (res.error) {
    throw new Error(res.error);
  }

  console.log(res);

  // Return typed response with transaction ID
  return res as unknown as { id: string };
};

export default hashkeyToLN;
