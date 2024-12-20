"use server";

import { callApi } from "../_utils/callApi";

type CreateInvoiceProps = {
  amount: number;
  description?: string;
  descriptionHashOnly?: boolean;
  hashkeyAddress: string;
};

const createInvoice = async ({
  amount,
  description,
  descriptionHashOnly,
  hashkeyAddress,
}: CreateInvoiceProps) => {
  const res = await callApi({
    endpoint: "/createInvoice",
    method: "POST",
    body: {
      amount,
      description: description || "",
      descriptionHashOnly: descriptionHashOnly || true,
      hashkeyAddress,
    },
  });

  if (res.error) {
    throw new Error(res.error);
  }

  return res.data as { invoiceId: string };
};

export default createInvoice;
