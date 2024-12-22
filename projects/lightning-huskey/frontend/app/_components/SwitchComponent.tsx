"use client";

// Import necessary icons and hooks
import SwitchIcon from "@/public/svgs/SwitchIcon";
import ArrowRightIcon from "@/public/svgs/ArrowRightIcon";
import { useSetAtom } from "jotai";
import { TransactionHashAtom } from "../_store";
import { useSwitch } from "../context/SwitchContext";

// Component that handles switching between HashKey Chain and Lightning Network
const SwitchComponent = () => {
  // Get switch state and toggle function from context
  const { isToLN, toggleSwitch } = useSwitch();

  // Get function to update transaction hash state
  const setTransactionHash = useSetAtom(TransactionHashAtom);

  return (
    <div className="flex w-full items-center gap-2 text-2xl">
      {/* Source network text */}
      <span className="text-huskey-gray-400">
        {isToLN ? "HashKey Chain" : "Lightning Network"}
      </span>
      <ArrowRightIcon />
      {/* Destination network text */}
      <span className="text-huskey-primary-400">
        {isToLN ? "Lightning Network" : "HashKey Chain"}
      </span>
      {/* Switch button */}
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
