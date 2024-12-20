"use client";

import { QRCodeCanvas } from "qrcode.react";
import Modal from "./Modal";
import getInvoice from "../_services/getInvoice";
import { useMemo, useState } from "react";
import { successToast } from "../_utils/notifications";
import Timer from "./Timer";

type LightningInvoiceModalProps = {
  invoiceId: string;
  onClose: () => void;
};

const LightningInvoiceModal = ({
  invoiceId,
  onClose,
}: LightningInvoiceModalProps) => {
  const [QRValue, setQRValue] = useState("");

  const handleGetInvoice = async () => {
    const res = await getInvoice({ invoiceId });
    setQRValue(res.BOLT11);

    const timer = setInterval(async () => {
      const updatedInvoice = await getInvoice({ invoiceId });
      if (updatedInvoice.hashkeyStatus === "Y") {
        successToast("Payment successful");
        clearInterval(timer);
        onClose();
      }
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
    }, 600000);
  };

  useMemo(() => {
    handleGetInvoice();
  }, []);

  return (
    <Modal title="LN invoice" onClose={onClose}>
      <div className="min-w-80">
        {QRValue && (
          <div className="mb-2 mt-2 flex">
            <div className="ml-auto mr-auto rounded bg-white p-3">
              <QRCodeCanvas value={`lightning:${QRValue}`} size={188} />
            </div>
            <Timer
              className="mb-2 text-center text-sm text-[#F58307]"
              min={10}
              sec={0}
              handleFinish={onClose}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LightningInvoiceModal;
