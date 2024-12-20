"use client";

import { useAppKit } from "@reown/appkit/react";
import { useAccount, useBalance } from "wagmi";
import { useEffect, useState } from "react";
import { getBalance, GetBalanceReturnType } from "@wagmi/core";
import { config } from "../config";
import { HBTC } from "../constants/constants";
import useInput from "../_hooks/useInput";

const InputBox = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const [tokenBalance, setTokenBalance] = useState<GetBalanceReturnType | null>(
    null,
  );
  const { value, onChange, isValid } = useInput({
    input: "",
    regex: /^\d*\.?\d*$/,
  });

  useEffect(() => {
    if (isConnected && address) {
      getBalance(config, {
        address,
        token: HBTC,
      }).then((balance) => setTokenBalance(balance));
    }
  }, [isConnected, address]);

  return (
    <div className="flex w-full flex-col gap-5 rounded border border-huskey-gray-600 p-5">
      <div className="flex flex-col gap-4">
        <p className="text-xl">Amount</p>
        <div className="flex w-full rounded border border-huskey-gray-600 p-4">
          <input
            name="amount"
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            className="w-full bg-transparent text-end outline-none"
            value={value}
            onChange={onChange}
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
            Recipient Address <span className="text-sm">(HashKey Chain)</span>
          </p>
          <p className="text-sm font-normal text-huskey-gray-300">
            Balance:{" "}
            {!tokenBalance || tokenBalance.value === BigInt(0)
              ? "0"
              : tokenBalance.value.toString()}{" "}
            SAT
          </p>
        </div>
        {isConnected ? (
          <>
            <div className="flex w-full justify-center rounded border border-huskey-gray-600 p-4">
              <p className="text-center">{address}</p>
            </div>
            <button
              type="button"
              className="flex w-full justify-center rounded bg-huskey-primary-400 p-4 text-xl"
            >
              Send
            </button>
          </>
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
