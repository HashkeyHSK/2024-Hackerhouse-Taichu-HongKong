"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";

interface SwitchContextType {
  isToLN: boolean;
  toggleSwitch: () => void;
}

const SwitchContext = createContext<SwitchContextType | undefined>(undefined);

export const SwitchProvider = ({ children }: { children: ReactNode }) => {
  const [isToLN, setIsToLN] = useState(true);

  const toggleSwitch = () => {
    setIsToLN((prev) => !prev);
  };

  const value = useMemo(() => ({ isToLN, toggleSwitch }), [isToLN]);

  return (
    <SwitchContext.Provider value={value}>{children}</SwitchContext.Provider>
  );
};

export const useSwitch = () => {
  const context = useContext(SwitchContext);
  if (!context) {
    throw new Error("useSwitch must be used within a SwitchProvider");
  }
  return context;
};
