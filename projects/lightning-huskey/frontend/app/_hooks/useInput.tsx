// Import necessary hooks from React
import { useState } from "react";

// Props type definition for useInput hook
type useInputProps = {
  input: string; // Initial input value
  regex?: RegExp; // Optional regex pattern for validation
};

// Custom hook for handling input state and validation
const useInput = ({ input, regex }: useInputProps) => {
  // State for input value and validation status
  const [value, setValue] = useState(input);
  const [isValid, setIsValid] = useState(true);

  // Handler for input changes that validates against regex if provided
  const onChange = ({
    target: { value: inputValue },
  }: React.ChangeEvent<HTMLInputElement>) => {
    const isValidInput = regex ? regex.test(inputValue) : true;
    setIsValid(isValidInput);
    if (isValidInput) {
      setValue(inputValue);
    }
  };

  // Return input state and handlers
  return { value, onChange, setValue, isValid, setIsValid };
};

export default useInput;
