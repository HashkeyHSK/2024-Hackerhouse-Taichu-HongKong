// Import necessary icons and hooks
import TimerIcon from "@/public/svgs/TimerIcon";
import { useEffect, useState } from "react";

// Props type definition for Timer component
type TimerProps = {
  className?: string; // Optional CSS class name
  min: number; // Initial minutes value
  sec: number; // Initial seconds value
  handleFinish?: () => void; // Optional callback when timer finishes
};

// Timer component that displays countdown with minutes and seconds
const Timer = ({ className, min, sec, handleFinish }: TimerProps) => {
  // State for tracking minutes and seconds
  const [minutes, setMinutes] = useState(min);
  const [seconds, setSeconds] = useState(sec);

  // Effect hook to handle countdown logic
  useEffect(() => {
    // Set up interval to decrement timer every second
    let myInterval = setInterval(() => {
      // Decrement seconds if greater than 0
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      // Handle when seconds reach 0
      if (seconds === 0) {
        if (minutes === 0) {
          // Clear interval and call finish handler when timer ends
          clearInterval(myInterval);
          handleFinish !== undefined && handleFinish();
        } else {
          // Decrement minutes and reset seconds when minute changes
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }
    }, 1000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(myInterval);
    };
  });

  // Render timer display with icon
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TimerIcon />
      {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </div>
  );
};

export default Timer;
