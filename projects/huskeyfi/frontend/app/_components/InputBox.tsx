const InputBox = () => {
  return (
    <div className="flex w-full flex-col gap-5 rounded border border-huskey-gray-600 p-5">
      <div className="flex flex-col gap-4">
        <p className="text-xl">Amount</p>
        <div className="flex w-full rounded border border-huskey-gray-600 p-4">
          <input
            name="amount"
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            className="w-full bg-transparent text-end outline-none"
          />
          <p className="ml-7">SAT</p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <p className="text-xl">
            Recipient Address <span className="text-sm">(HashKey Chain)</span>
          </p>
          <p className="text-sm font-normal text-huskey-gray-300">
            Balance: 12345 SAT
          </p>
        </div>
        <div className="flex w-full justify-center rounded border border-huskey-gray-600 p-4">
          <p className="text-center">0xasdfj123h</p>
        </div>
        <button
          type="button"
          className="flex w-full justify-center rounded bg-huskey-primary-400 p-4 text-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default InputBox;
