"use client";

import Image from "next/image";
import Modal from "./Modal";

// Props type definition for ContinueInWalletModal
type ContinueInWalletModalProps = {
  onClose: () => void;
};

// Modal component that shows "Continue in Wallet" message with loading animation
const ContinueInWalletModal = ({ onClose }: ContinueInWalletModalProps) => {
  return (
    <Modal title="" onClose={onClose}>
      <div className="min-w-80">
        {/* Container for loading animation and text */}
        <div className="mb-2 mt-2 flex flex-col">
          <div className="mx-auto flex items-center gap-1">
            {/* Loading spinner animation */}
            <Image
              src="/images/loading.gif"
              width={24}
              height={24}
              alt="loading"
            />
            {/* Continue in wallet text */}
            <div className="text-sm">Continue In Wallet</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ContinueInWalletModal;
