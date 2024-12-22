"use client";

// Import Jotai Provider component
import { Provider } from "jotai";

// Component that provides Jotai state management context to children
const JotaiProvider = ({ children }: { children: React.ReactNode }) => {
  return <Provider>{children}</Provider>;
};

export default JotaiProvider;
