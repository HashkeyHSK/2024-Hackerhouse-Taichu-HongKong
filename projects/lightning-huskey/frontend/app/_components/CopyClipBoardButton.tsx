// Import necessary icons and custom hook
import CopyIcon from "@/public/svgs/CopyIcon";
import CopyCompletedIcon from "@/public/svgs/CopyCompletedIcon";
import useCopyClipBoard from "../_hooks/useCopyClipBoard";

// Props type definition for CopyClipBoardButton
type CopyClipBoardButtonProps = {
  text: string; // Text to be copied
  className?: string; // Optional CSS class name
  disabled?: boolean; // Optional disabled state
};

// Button component that copies text to clipboard
const CopyClipBoardButton = ({
  text,
  className = "",
  disabled = false,
}: CopyClipBoardButtonProps) => {
  // Get copy state and copy function from custom hook
  const [isCopy, onCopy] = useCopyClipBoard();

  // Handler for copy button click
  const handleCopyClipBoard = () => {
    onCopy(text);
  };

  return (
    <button
      className={`transition-all duration-300 ${className}`}
      onClick={() => handleCopyClipBoard()}
      type="button"
      disabled={disabled}
    >
      {/* Show different icon based on copy state */}
      {isCopy ? <CopyCompletedIcon /> : <CopyIcon />}
    </button>
  );
};

export default CopyClipBoardButton;
