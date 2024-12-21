"use server";

import { callApi } from "../_utils/callApi";

type hashkeyToLNProps = {
  lnAddress: string;
  hashkeyAddress: string;
  amount: string;
  hashkeyTxId: string;
};

const hashkeyToLN = async ({
  lnAddress,
  hashkeyAddress,
  amount,
  hashkeyTxId,
}: hashkeyToLNProps) => {
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

  if (res.error) {
    throw new Error(res.error);
  }

  console.log(res);

  return res as unknown as { id: string };
};

export default hashkeyToLN;
