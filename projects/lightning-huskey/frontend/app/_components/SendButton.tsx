// Props type definition for SendButton
interface SendButtonProps {
  isDisabled: boolean; // Flag to disable/enable button
  onClick: () => void; // Click handler function
}

// Button component for sending transactions
const SendButton: React.FC<SendButtonProps> = ({ isDisabled, onClick }) => {
  return (
    <button
      type="button"
      className="flex w-full justify-center rounded bg-huskey-primary-400 p-4 text-xl disabled:bg-huskey-gray-600 disabled:text-huskey-gray-300"
      disabled={isDisabled}
      onClick={onClick}
    >
      Send
    </button>
  );
};

export default SendButton;
