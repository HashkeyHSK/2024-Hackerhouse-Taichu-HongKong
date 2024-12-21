"use client";

import SwitchIcon from "@/public/svgs/SwitchIcon";
import ArrowRightIcon from "@/public/svgs/ArrowRightIcon";
import { useSwitch } from "../context/SwitchContext";

const SwitchComponent = () => {
  const { isToLN, toggleSwitch } = useSwitch();

  return (
    <div className="flex w-full items-center gap-2 text-2xl">
      <span className="text-huskey-gray-400">
        {isToLN ? "HashKey" : "Lightning Network"}
      </span>
      <ArrowRightIcon />
      <span className="text-huskey-primary-400">
        {isToLN ? "Lightning Network" : "HashKey"}
      </span>
      <div
        className="flex cursor-pointer items-center justify-center rounded border border-huskey-primary-400 p-1"
        onClick={toggleSwitch}
      >
        <SwitchIcon />
      </div>
    </div>
  );
};

export default SwitchComponent;
