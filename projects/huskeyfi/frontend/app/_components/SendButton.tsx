interface SendButtonProps {
  isDisabled: boolean;
}

const SendButton: React.FC<SendButtonProps> = ({ isDisabled }) => {
  return (
    <button
      type="button"
      className="flex w-full justify-center rounded bg-huskey-primary-400 p-4 text-xl disabled:bg-huskey-gray-600 disabled:text-huskey-gray-300"
      disabled={isDisabled}
    >
      Send
    </button>
  );
};

export default SendButton;
