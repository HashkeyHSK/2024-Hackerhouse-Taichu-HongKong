"use client";

import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";

const ConnectButton = () => {
  const { address } = useAccount();

  const { open } = useAppKit();

  const handleConnectWallet = async () => {
    open();
  };

  return (
    <button
      className="rounded bg-huskey-primary-100 px-5 py-2 text-black transition-all duration-300 hover:bg-huskey-primary-200"
      onClick={handleConnectWallet}
      type="button"
    >
      {address
        ? `${address.slice(0, 4)}...${address.slice(-4)}`
        : "Connect Wallet"}
    </button>
  );
};

export default ConnectButton;
