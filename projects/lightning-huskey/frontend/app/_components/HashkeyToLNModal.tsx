"use client";

// Import necessary components and hooks
import Modal from "./Modal";
import { useMemo } from "react";
import { errorToast, successToast } from "../_utils/notifications";
import { useRouter } from "next/navigation";
import Image from "next/image";
import getTransactionById from "../_services/getTransactionById";

// Props type definition for HashkeyToLNModal
type HashkeyToLNModalProps = {
  id: string; // Transaction ID
  onClose: () => void; // Function to close modal
};

// Modal component that shows transaction confirmation status
const HashkeyToLNModal = ({ id, onClose }: HashkeyToLNModalProps) => {
  const router = useRouter();

  // Function to poll transaction status
  const handleGetTransactionById = async () => {
    // Set up polling interval
    const timer = setInterval(async () => {
      const updatedInvoice = await getTransactionById({ id });
      // Handle failed transaction
      if (updatedInvoice.LNstatus === "E") {
        errorToast("Bridge failed");
        router.refresh();
        clearInterval(timer);
        onClose();
      }

      // Handle successful transaction
      if (updatedInvoice.LNstatus === "Y") {
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
    handleGetTransactionById();
  }, []);

  return (
    <Modal title="" onClose={onClose}>
      <div className="min-w-80">
        {/* Container for loading animation and status text */}
        <div className="mb-2 mt-2 flex flex-col">
          <div className="mx-auto flex items-center gap-1">
            {/* Loading spinner animation */}
            <Image
              src="/images/loading.gif"
              width={24}
              height={24}
              alt="loading"
            />
            {/* Status text */}
            <div className="text-sm">Waiting for transaction confirmation</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default HashkeyToLNModal;
