import { useState } from "react";

type useInputProps = {
  input: string;
  regex?: RegExp;
};

const useInput = ({ input, regex }: useInputProps) => {
  const [value, setValue] = useState(input);
  const [isValid, setIsValid] = useState(true);

  const onChange = ({
    target: { value: inputValue },
  }: React.ChangeEvent<HTMLInputElement>) => {
    const isValidInput = regex ? regex.test(inputValue) : true;
    setIsValid(isValidInput);
    if (isValidInput) {
      setValue(inputValue);
    }
  };

  return { value, onChange, setValue, isValid };
};

export default useInput;
