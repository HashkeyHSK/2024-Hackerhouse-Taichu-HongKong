// Import necessary hooks from React
import { useState } from "react";

// Type definition for copy function that returns a promise of boolean
type OnCopyFn = (text: string) => Promise<boolean>;

// Custom hook for copying text to clipboard
// Returns tuple with copy state and copy function
const useCopyClipBoard = (): [boolean, OnCopyFn] => {
  // State to track if text was successfully copied
  const [isCopy, setIsCopy] = useState<boolean>(false);

  // Function to copy text to clipboard
  const onCopy: OnCopyFn = async (text: string) => {
    try {
      // Attempt to write text to clipboard
      await navigator.clipboard.writeText(text);
      setIsCopy(true);

      return true;
    } catch (error) {
      // Log error and set copy state to false if failed
      console.error(error);
      setIsCopy(false);

      return false;
    }
  };

  return [isCopy, onCopy];
};

export default useCopyClipBoard;
