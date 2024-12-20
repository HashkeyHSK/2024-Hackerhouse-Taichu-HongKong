"use client";

import { useAppKit } from "@reown/appkit/react";
import { useAccount, useBalance } from "wagmi";
import { useEffect, useState } from "react";
import { getBalance, GetBalanceReturnType } from "@wagmi/core";
import { config } from "../config";
import { HBTC } from "../constants/constants";
import useInput from "../_hooks/useInput";
import { useSwitch } from "../context/SwitchContext";

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
    regex: /^\d*\.?\d*$/,
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
    if (isToLN) {
      setIsSendEnabled(invoiceValue.trim() !== "");
    } else {
      setIsSendEnabled(isValid && amountValue.trim() !== "");
    }
  }, [isToLN, invoiceValue, isValid, amountValue]);

  const balanceText =
    !tokenBalance || tokenBalance.value === BigInt(0)
      ? "0"
      : tokenBalance.value.toString();

  const formatNumberWithCommas = (value: string) => {
    const parts = value.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(/,/g, "");
    const isValidNumber = /^\d*\.?\d*$/.test(rawValue);
    if (isValidNumber) {
      setAmountValue(rawValue);
      event.target.value = formatNumberWithCommas(rawValue);
    }
    setIsValid(isValidNumber);
  };

  const renderInputField = () => {
    if (isToLN) {
      return (
        <>
          <div className="flex w-full rounded border border-huskey-gray-600 p-4">
            <input
              name="invoice"
              type="text"
              placeholder="lnbc..."
              className="w-full bg-transparent text-center outline-none"
              value={invoiceValue}
              onChange={onInvoiceChange}
            />
          </div>
          <button
            type="button"
            className="flex w-full justify-center rounded bg-huskey-primary-400 p-4 text-xl disabled:bg-huskey-gray-600 disabled:text-huskey-gray-300"
            disabled={!isSendEnabled}
          >
            Send
          </button>
        </>
      );
    }
    return (
      <>
        <div className="flex w-full justify-center rounded border border-huskey-gray-600 p-4">
          <p className="text-center">{address}</p>
        </div>
        <button
          type="button"
          className="flex w-full justify-center rounded bg-huskey-primary-400 p-4 text-xl disabled:bg-huskey-gray-600 disabled:text-huskey-gray-300"
          disabled={!isSendEnabled}
        >
          Send
        </button>
      </>
    );
  };

  return (
    <div className="flex w-full flex-col gap-5 rounded border border-huskey-gray-600 p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <p className="text-xl">Amount</p>
          {isToLN && (
            <p className="text-sm font-normal text-huskey-gray-300">
              Balance: {balanceText} SAT
            </p>
          )}
        </div>

        <div className="flex w-full rounded border border-huskey-gray-600 p-4">
          <input
            name="amount"
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            className="w-full bg-transparent text-end outline-none"
            value={formatNumberWithCommas(amountValue)}
            onChange={handleAmountChange}
          />
          <p className="ml-7">SAT</p>
        </div>
        {!isValid && (
          <p className="text-sm text-red-500">Please enter a valid number.</p>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <p className="text-xl">
            {isToLN ? "LN Invoice" : "Recipient Address"}
            {!isToLN && <span className="text-sm"> (HashKey Chain)</span>}
          </p>
          {!isToLN && (
            <p className="text-sm font-normal text-huskey-gray-300">
              Balance: {balanceText} SAT
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
    </div>
  );
};

export default InputBox;
