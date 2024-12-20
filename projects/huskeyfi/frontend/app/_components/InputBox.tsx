const InputBox = () => {
  return (
    <div className="w-full border border-huskey-gray-600 p-5">
      <p>Amount</p>
      <input type="text" className="w-full" />
      <div className="flex items-center justify-between">
        <p>
          Recipient Address <span className="text-sm">(HashKey Chain)</span>
        </p>
        <p className="text-sm text-huskey-gray-300">
          Balance: 0.000000000000000000
        </p>
      </div>
      <input type="text" className="w-full" />
    </div>
  );
};

export default InputBox;
