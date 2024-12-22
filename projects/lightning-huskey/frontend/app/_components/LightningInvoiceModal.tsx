"use client";

import Image from "next/image";
import { QRCodeCanvas } from "qrcode.react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSetAtom } from "jotai";
import Modal from "./Modal";
import getInvoiceTransaction from "../_services/getInvoiceTransaction";
import { successToast } from "../_utils/notifications";
import Timer from "./Timer";
import CopyClipBoardButton from "./CopyClipBoardButton";
import { TransactionHashAtom } from "../_store";

// Props type definition for LightningInvoiceModal
type LightningInvoiceModalProps = {
  invoiceId: string; // ID of the lightning invoice
  onClose: () => void; // Function to close modal
};

// Modal component that displays Lightning Network invoice QR code and status
const LightningInvoiceModal = ({
  invoiceId,
  onClose,
}: LightningInvoiceModalProps) => {
  const router = useRouter();
  // State for QR code value and payment status
  const [QRValue, setQRValue] = useState("");
  const [LNstatus, setLNstatus] = useState<"Y" | "N" | "P">("N");

  const setTransactionHash = useSetAtom(TransactionHashAtom);

  // Function to fetch invoice and poll for status updates
  const handleGetInvoice = async () => {
    // Get initial invoice data
    const res = await getInvoiceTransaction({ invoiceId });
    setQRValue(res.BOLT11);

    // Set up polling interval to check payment status
    const timer = setInterval(async () => {
      const updatedInvoice = await getInvoiceTransaction({ invoiceId });
      // Update status when payment is received
      if (updatedInvoice.LNstatus === "Y") {
        setLNstatus("Y");
      }

      // Handle successful bridge transaction
      if (updatedInvoice.hashkeyStatus === "Y") {
        setTransactionHash(updatedInvoice.hashkeyTx);
        successToast("Bridge completed successfully");
        router.refresh();
        clearInterval(timer);
        onClose();
      }
    }, 1000);

    // Clear interval after 10 minutes
    setTimeout(() => {
      clearInterval(timer);
    }, 600000);
  };

  // Start polling when component mounts
  useMemo(() => {
    handleGetInvoice();
  }, []);

  return (
    <Modal title="Lightning Network Invoice" onClose={onClose}>
      <div className="min-w-80">
        {QRValue && (
          <div className="mb-2 mt-2 flex flex-col">
            {LNstatus === "Y" ? (
              // Show loading state when payment is received
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
              // Show QR code and invoice details when waiting for payment
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
