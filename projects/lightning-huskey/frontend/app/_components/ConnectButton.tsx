"use client";

import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";

// Component for wallet connection button
const ConnectButton = () => {
  // Get wallet address from wagmi hook
  const { address } = useAccount();

  // Get wallet connection modal opener from AppKit
  const { open } = useAppKit();

  // Handler for wallet connection button click
  const handleConnectWallet = async () => {
    open();
  };

  return (
    <button
      className="rounded bg-huskey-primary-100 px-5 py-2 text-black transition-all duration-300 hover:bg-huskey-primary-200"
      onClick={handleConnectWallet}
      type="button"
    >
      {/* Display truncated address if connected, otherwise show connect button */}
      {address
        ? `${address.slice(0, 4)}...${address.slice(-4)}`
        : "Connect Wallet"}
    </button>
  );
};

export default ConnectButton;
