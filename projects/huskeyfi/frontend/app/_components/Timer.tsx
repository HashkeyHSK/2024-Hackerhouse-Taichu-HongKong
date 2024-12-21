import TimerIcon from "@/public/svgs/TimerIcon";
import { useEffect, useState } from "react";

type TimerProps = {
  className?: string;
  min: number;
  sec: number;
  handleFinish?: () => void;
};

const Timer = ({ className, min, sec, handleFinish }: TimerProps) => {
  const [minutes, setMinutes] = useState(min);
  const [seconds, setSeconds] = useState(sec);

  useEffect(() => {
    let myInterval = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(myInterval);
          handleFinish !== undefined && handleFinish();
        } else {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }
    }, 1000);
    return () => {
      clearInterval(myInterval);
    };
  });

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TimerIcon />
      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </div>
  );
};

export default Timer;
