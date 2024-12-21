"use client";

import { QRCodeCanvas } from "qrcode.react";
import Modal from "./Modal";
import getInvoiceTransaction from "../_services/getInvoiceTransaction";
import { useMemo, useState } from "react";
import { successToast } from "../_utils/notifications";
import Timer from "./Timer";
import CopyClipBoardButton from "./CopyClipBoardButton";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSetAtom } from "jotai";
import { TransactionHashAtom } from "../_store";

type LightningInvoiceModalProps = {
  invoiceId: string;
  onClose: () => void;
};

const LightningInvoiceModal = ({
  invoiceId,
  onClose,
}: LightningInvoiceModalProps) => {
  const router = useRouter();
  const [QRValue, setQRValue] = useState("");
  const [LNstatus, setLNstatus] = useState<"Y" | "N" | "P">("N");

  const setTransactionHash = useSetAtom(TransactionHashAtom);

  const handleGetInvoice = async () => {
    const res = await getInvoiceTransaction({ invoiceId });
    setQRValue(res.BOLT11);

    const timer = setInterval(async () => {
      const updatedInvoice = await getInvoiceTransaction({ invoiceId });
      if (updatedInvoice.LNstatus === "Y") {
        setLNstatus("Y");
      }

      if (updatedInvoice.hashkeyStatus === "Y") {
        setTransactionHash(updatedInvoice.hashkeyTx);
        successToast("Bridge successful");
        router.refresh();
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
    <Modal title="Lightning Network Invoice" onClose={onClose}>
      <div className="min-w-80">
        {QRValue && (
          <div className="mb-2 mt-2 flex flex-col">
            {LNstatus === "Y" ? (
              <div className="mx-auto flex items-center gap-1">
                <Image
                  src="/images/loading.gif"
                  width={24}
                  height={24}
                  alt="loading"
                />
                <div className="text-sm">
                  Waiting for transaction confirmation
                </div>
              </div>
            ) : (
              <>
                <div className="ml-auto mr-auto rounded bg-white p-3">
                  <QRCodeCanvas value={`lightning:${QRValue}`} size={176} />
                </div>
                <div className="mx-auto mt-4 flex items-center gap-2 text-xs">
                  <div className="max-w-[182px] overflow-hidden text-ellipsis">
                    {QRValue}
                  </div>
                  <CopyClipBoardButton text={QRValue} />
                </div>
                <div className="mx-auto mt-5">
                  <Timer
                    className="text-xs font-semibold text-huskey-primary-400"
                    min={10}
                    sec={0}
                    handleFinish={onClose}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LightningInvoiceModal;
