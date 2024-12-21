"use client";

import Modal from "./Modal";
import Image from "next/image";

type ContinueInWalletModalProps = {
  onClose: () => void;
};

const ContinueInWalletModal = ({ onClose }: ContinueInWalletModalProps) => {
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
            <div className="text-sm">Continue In Wallet</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ContinueInWalletModal;
