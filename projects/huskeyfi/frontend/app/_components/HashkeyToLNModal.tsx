"use client";

import Modal from "./Modal";
import { useMemo } from "react";
import { errorToast, successToast } from "../_utils/notifications";
import { useRouter } from "next/navigation";
import Image from "next/image";
import getTransactionById from "../_services/getTransactionById";

type HashkeyToLNModalProps = {
  id: string;
  onClose: () => void;
};

const HashkeyToLNModal = ({ id, onClose }: HashkeyToLNModalProps) => {
  const router = useRouter();

  const handleGetTransactionById = async () => {
    const timer = setInterval(async () => {
      const updatedInvoice = await getTransactionById({ id });
      if (updatedInvoice.LNstatus === "E") {
        errorToast("Bridge failed");
        router.refresh();
        clearInterval(timer);
        onClose();
      }

      if (updatedInvoice.LNstatus === "Y") {
        successToast("Bridge completed successfully");
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
    handleGetTransactionById();
  }, []);

  return (
    <Modal title="" onClose={onClose}>
      <div className="min-w-80">
        <div className="mb-2 mt-2 flex flex-col">
          <div className="mx-auto flex items-center gap-1">
            <Image
              src="/images/loading.gif"
              width={24}
              height={24}
              alt="loading"
            />
            <div className="text-sm">Waiting for transaction confirmation</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default HashkeyToLNModal;
