import CopyIcon from "@/public/svgs/CopyIcon";
import CopyCompletedIcon from "@/public/svgs/CopyCompletedIcon";
import useCopyClipBoard from "../_hooks/useCopyClipBoard";

type CopyClipBoardButtonProps = {
  text: string;
  className?: string;
  disabled?: boolean;
};

const CopyClipBoardButton = ({
  text,
  className = "",
  disabled = false,
}: CopyClipBoardButtonProps) => {
  const [isCopy, onCopy] = useCopyClipBoard();
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
      {isCopy ? <CopyCompletedIcon /> : <CopyIcon />}
    </button>
  );
};

export default CopyClipBoardButton;
