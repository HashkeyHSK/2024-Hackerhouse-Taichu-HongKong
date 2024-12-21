"use client";

import SwitchIcon from "@/public/svgs/SwitchIcon";
import ArrowRightIcon from "@/public/svgs/ArrowRightIcon";
import { useSwitch } from "../context/SwitchContext";
import { useSetAtom } from "jotai";
import { TransactionHashAtom } from "../_store";

const SwitchComponent = () => {
  const { isToLN, toggleSwitch } = useSwitch();

  const setTransactionHash = useSetAtom(TransactionHashAtom);

  return (
    <div className="flex w-full items-center gap-2 text-2xl">
      <span className="text-huskey-gray-400">
        {isToLN ? "HashKey Chain" : "Lightning Network"}
      </span>
      <ArrowRightIcon />
      <span className="text-huskey-primary-400">
        {isToLN ? "Lightning Network" : "HashKey Chain"}
      </span>
      <div
        className="flex cursor-pointer items-center justify-center rounded border border-huskey-primary-400 p-1"
        onClick={() => {
          toggleSwitch();
          setTransactionHash(undefined);
        }}
      >
        <SwitchIcon />
      </div>
    </div>
  );
};

export default SwitchComponent;
