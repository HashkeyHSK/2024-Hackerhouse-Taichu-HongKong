"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";

// Interface defining the shape of context data for the switch functionality
interface SwitchContextType {
  isToLN: boolean; // Flag indicating if switch is in Lightning Network mode
  toggleSwitch: () => void; // Function to toggle the switch state
}

// Create context with undefined default value
const SwitchContext = createContext<SwitchContextType | undefined>(undefined);

// Provider component that wraps the app to provide switch context
export const SwitchProvider = ({ children }: { children: ReactNode }) => {
  // State to track if switch is in Lightning Network mode
  const [isToLN, setIsToLN] = useState(false);

  // Handler to toggle the switch state
  const toggleSwitch = () => {
    setIsToLN((prev) => !prev);
  };

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ isToLN, toggleSwitch }), [isToLN]);

  return (
    <SwitchContext.Provider value={value}>{children}</SwitchContext.Provider>
  );
};

// Custom hook to consume the switch context
export const useSwitch = () => {
  const context = useContext(SwitchContext);
  if (!context) {
    throw new Error("useSwitch must be used within a SwitchProvider");
  }
  return context;
};
