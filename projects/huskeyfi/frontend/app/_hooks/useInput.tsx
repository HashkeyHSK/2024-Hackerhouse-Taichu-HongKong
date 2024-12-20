import { useState } from "react";

type useInputProps = {
  input: string;
  regex?: RegExp;
};

const useInput = ({ input, regex }: useInputProps) => {
  const [value, setValue] = useState(input);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (regex) {
      if (regex.test(e.target.value) || e.target.value === "") {
        setValue(e.target.value);
      }
    } else {
      setValue(e.target.value);
    }
  };
  return { value, onChange, setValue };
};

export default useInput;
