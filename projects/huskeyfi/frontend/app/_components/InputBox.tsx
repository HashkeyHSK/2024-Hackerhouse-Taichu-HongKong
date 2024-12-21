"use client";

import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { getBalance, GetBalanceReturnType, writeContract } from "@wagmi/core";
import { config } from "../config";
import { HBTC, LN_BRIDGE } from "../constants/constants";
import useInput from "../_hooks/useInput";
import { useSwitch } from "../context/SwitchContext";
import SendButton from "./SendButton";
import LightningInvoiceModal from "./LightningInvoiceModal";
import createInvoice from "../_services/createInvoice";
import { formatEther, parseUnits } from "viem";
import ERC20Abi from "../_abis/ERC20Abi";
import { errorToast } from "../_utils/notifications";
import hashkeyToLN from "../_services/hashkeyToLN";
import ContinueInWalletModal from "./ContinueInWalletModal";
import HashkeyToLNModal from "./HashkeyToLNModal";

const InputBox = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { isToLN } = useSwitch();
  const [tokenBalance, setTokenBalance] = useState<GetBalanceReturnType | null>(
    null,
  );
  const [isSendEnabled, setIsSendEnabled] = useState(false);

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

  useEffect(() => {
    if (isConnected && address) {
      getBalance(config, {
        address,
        token: HBTC,
      }).then((balance) => setTokenBalance(balance));
    }
  }, [isConnected, address]);

  useEffect(() => {
    const isAmountValid =
      isValid && amountValue.trim() !== "" && parseFloat(amountValue) > 0;
    if (isToLN) {
      setIsSendEnabled(invoiceValue.trim() !== "" && isAmountValid);
    } else {
      setIsSendEnabled(isAmountValid);
    }
  }, [isToLN, invoiceValue, isValid, amountValue]);

  const formatNumberWithCommas = (value: string) => {
    const parts = value.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

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

  const [isLightningInvoiceModalOpen, setIsLightningInvoiceModalOpen] =
    useState(false);
  const [invoiceId, setInvoiceId] = useState("");

  const handleOpenLightningInvoiceModal = async () => {
    const res = await createInvoice({
      amount: amountValue,
      hashkeyAddress: address as string,
    });

    setInvoiceId(res.id);

    setIsLightningInvoiceModalOpen(true);
  };

  const [isInsufficient, setIsInsufficient] = useState(false);

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

  const [isContinueInWalletModalOpen, setIsContinueInWalletModalOpen] =
    useState(false);
  const [isHashkeyToLNModalOpen, setIsHashkeyToLNModalOpen] = useState(false);
  const [txId, setTxId] = useState("");

  const handleHashkeyToLN = async () => {
    try {
      setIsContinueInWalletModalOpen(true);

      const hashkeyTxId = await writeContract(config, {
        abi: ERC20Abi,
        address: HBTC,
        functionName: "transfer",
        args: [LN_BRIDGE, parseUnits(amountValue, 10).toString()],
      });

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

  return (
    <div className="flex w-full flex-col gap-5 rounded border border-huskey-primary-400 bg-huskey-box p-5">
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
