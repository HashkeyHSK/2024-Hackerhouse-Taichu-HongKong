"use client";

import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { formatEther, parseUnits } from "viem";
import { useAtom } from "jotai";
import Link from "next/link";
import { getBalance, GetBalanceReturnType, writeContract } from "@wagmi/core";
import { config } from "../config";
import { HBTC, LN_BRIDGE } from "../constants/constants";
import useInput from "../_hooks/useInput";
import { useSwitch } from "../context/SwitchContext";
import SendButton from "./SendButton";
import LightningInvoiceModal from "./LightningInvoiceModal";
import createInvoice from "../_services/createInvoice";
import ERC20Abi from "../_abis/ERC20Abi";
import { errorToast } from "../_utils/notifications";
import hashkeyToLN from "../_services/hashkeyToLN";
import ContinueInWalletModal from "./ContinueInWalletModal";
import HashkeyToLNModal from "./HashkeyToLNModal";
import { TransactionHashAtom } from "../_store";

// Main input component for handling token transfers
const InputBox = () => {
  // Hooks for wallet connection and account state
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { isToLN } = useSwitch();

  // State for token balance and transaction control
  const [tokenBalance, setTokenBalance] = useState<GetBalanceReturnType | null>(
    null,
  );
  const [isSendEnabled, setIsSendEnabled] = useState(false);
  const [transactionHash, setTransactionHash] = useAtom(TransactionHashAtom);

  // Custom hooks for input handling
  const {
    value: amountValue,
    setValue: setAmountValue,
    isValid,
    setIsValid,
  } = useInput({
    input: "",
    regex: /^\d*$/,
  });
  const { value: invoiceValue, onChange: onInvoiceChange } = useInput({
    input: "",
    regex: /^.*$/,
  });

  // Fetch token balance when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      getBalance(config, {
        address,
        token: HBTC,
      }).then((balance) => setTokenBalance(balance));
    }
  }, [isConnected, address]);

  // Enable/disable send button based on input validation
  useEffect(() => {
    const isAmountValid =
      isValid && amountValue.trim() !== "" && parseFloat(amountValue) > 0;
    if (isToLN) {
      setIsSendEnabled(invoiceValue.trim() !== "" && isAmountValid);
    } else {
      setIsSendEnabled(isAmountValid);
    }
  }, [isToLN, invoiceValue, isValid, amountValue]);

  // Format number with commas for better readability
  const formatNumberWithCommas = (value: string) => {
    const parts = value.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  // Handle amount input changes with formatting
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = event.target.value.replace(/,/g, "");
    rawValue = rawValue.replace(/^0+(?=\d)/, "");
    const isValidNumber = /^\d*$/.test(rawValue);

    if (isValidNumber) {
      setAmountValue(rawValue);
      event.target.value = formatNumberWithCommas(rawValue);
    }
    setIsValid(isValidNumber);
  };

  // State for Lightning Invoice modal
  const [isLightningInvoiceModalOpen, setIsLightningInvoiceModalOpen] =
    useState(false);
  const [invoiceId, setInvoiceId] = useState("");

  // Handle opening Lightning Invoice modal
  const handleOpenLightningInvoiceModal = async () => {
    setTransactionHash(undefined);

    const res = await createInvoice({
      amount: amountValue,
      hashkeyAddress: address as string,
    });

    setInvoiceId(res.id);

    setIsLightningInvoiceModalOpen(true);
  };

  // State for insufficient balance check
  const [isInsufficient, setIsInsufficient] = useState(false);

  // Check for insufficient balance
  useEffect(() => {
    if (
      isToLN &&
      tokenBalance &&
      parseUnits(amountValue, 10) > tokenBalance.value
    ) {
      setIsInsufficient(true);
      setIsSendEnabled(false);
    } else {
      setIsInsufficient(false);
    }
  }, [isToLN, amountValue, tokenBalance]);

  // State for transaction modals
  const [isContinueInWalletModalOpen, setIsContinueInWalletModalOpen] =
    useState(false);
  const [isHashkeyToLNModalOpen, setIsHashkeyToLNModalOpen] = useState(false);
  const [txId, setTxId] = useState("");

  // Handle Hashkey to Lightning Network transfer
  const handleHashkeyToLN = async () => {
    try {
      setTransactionHash(undefined);

      setIsContinueInWalletModalOpen(true);

      const hashkeyTxId = await writeContract(config, {
        abi: ERC20Abi,
        address: HBTC,
        functionName: "transfer",
        args: [LN_BRIDGE, parseUnits(amountValue, 10).toString()],
      });

      setTransactionHash(hashkeyTxId);

      const res = await hashkeyToLN({
        lnAddress: invoiceValue,
        hashkeyAddress: address as string,
        amount: formatEther(parseUnits(amountValue, 10)),
        hashkeyTxId,
      });
      setTxId(res.id);

      setIsContinueInWalletModalOpen(false);
      setIsHashkeyToLNModalOpen(true);
    } catch (error: any) {
      console.log(error.message);
      errorToast(error.message);
      setIsContinueInWalletModalOpen(false);
      setIsHashkeyToLNModalOpen(false);
    }
  };

  // Update token balance after transaction
  const handleUpdateTokenBalance = () => {
    if (isConnected && address) {
      setTimeout(() => {
        getBalance(config, {
          address,
          token: HBTC,
        }).then((balance) => setTokenBalance(balance));
      }, 5000); // Wait for update
    }
  };

  // Modal close handlers
  const handleCloseLightningInvoiceModal = () => {
    setIsLightningInvoiceModalOpen(false);
    handleUpdateTokenBalance();
  };

  const handleCloseContinueInWalletModal = () => {
    setIsContinueInWalletModalOpen(false);
    handleUpdateTokenBalance();
  };

  const handleCloseHashkeyToLNModal = () => {
    setIsHashkeyToLNModalOpen(false);
    handleUpdateTokenBalance();
  };

  // Render input field based on transfer direction
  const renderInputField = () => {
    if (isToLN) {
      return (
        <>
          <div className="flex w-full rounded border border-huskey-gray-600 bg-huskey-background p-4">
            <input
              name="invoice"
              type="text"
              placeholder="lnbc..."
              className="w-full bg-transparent text-center outline-none"
              value={invoiceValue}
              onChange={onInvoiceChange}
            />
          </div>
          <SendButton isDisabled={!isSendEnabled} onClick={handleHashkeyToLN} />
        </>
      );
    }
    return (
      <>
        <div className="flex w-full justify-center rounded border border-huskey-gray-600 bg-huskey-background p-4">
          <p className="text-center">{address}</p>
        </div>
        <SendButton
          isDisabled={!isSendEnabled}
          onClick={handleOpenLightningInvoiceModal}
        />
      </>
    );
  };

  // Main component render
  return (
    <div className="mt-10 flex w-full flex-col gap-5 rounded border border-huskey-primary-400 bg-huskey-box p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <p className="text-xl">Amount</p>
          {isToLN && (
            <p className="text-sm font-normal text-huskey-gray-300">
              Balance: {tokenBalance ? formatEther(tokenBalance?.value) : "0"}{" "}
              hBTC
            </p>
          )}
        </div>

        <div className="flex w-full rounded border border-huskey-gray-600 bg-huskey-background p-4">
          <input
            name="amount"
            type="text"
            inputMode="numeric"
            placeholder="0"
            className="w-full bg-transparent text-end outline-none"
            value={formatNumberWithCommas(amountValue)}
            onChange={handleAmountChange}
          />
          <p className="ml-7">SAT</p>
        </div>
        {isInsufficient ? (
          <p className="text-sm text-red-500">Insufficient balance.</p>
        ) : (
          !isValid && (
            <p className="text-sm text-red-500">Please enter a valid number.</p>
          )
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <p className="text-xl">
            {isToLN ? "Lightning Network Invoice" : "Recipient Address"}
            {!isToLN && <span className="text-sm"> (HashKey Chain)</span>}
          </p>
          {!isToLN && (
            <p className="text-sm font-normal text-huskey-gray-300">
              Balance: {tokenBalance ? formatEther(tokenBalance?.value) : "0"}{" "}
              hBTC
            </p>
          )}
        </div>

        {isConnected ? (
          renderInputField()
        ) : (
          <button
            type="button"
            className="flex w-full justify-center rounded bg-huskey-primary-400 p-4 text-xl"
            onClick={() => open()}
          >
            Connect Wallet
          </button>
        )}
      </div>
      {transactionHash && (
        <div className="flex items-center justify-between gap-1">
          <div className="max-w-[350px] overflow-hidden text-ellipsis text-nowrap">
            {`Tx Hash: ${transactionHash}`}
          </div>
          <Link
            className="text-huskey-primary-400 underline"
            href={`https://hashkeychain-testnet-explorer.alt.technology/tx/${transactionHash}`}
            target="_blank"
          >
            View on Block Explorer
          </Link>
        </div>
      )}
      {isLightningInvoiceModalOpen && (
        <LightningInvoiceModal
          invoiceId={invoiceId}
          onClose={handleCloseLightningInvoiceModal}
        />
      )}
      {isContinueInWalletModalOpen && (
        <ContinueInWalletModal onClose={handleCloseContinueInWalletModal} />
      )}
      {isHashkeyToLNModalOpen && (
        <HashkeyToLNModal id={txId} onClose={handleCloseHashkeyToLNModal} />
      )}
    </div>
  );
};

export default InputBox;
