
import { useEffect, useState } from "react";

interface TimerProps {
  isRunning: boolean;
  shouldReset?: boolean;
  onTimeUpdate?: (time: number) => void;
}

export const Timer = ({ isRunning, shouldReset, onTimeUpdate }: TimerProps) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 1;
          onTimeUpdate?.(newTime);
          return newTime;
        });
      }, 1000);
    }

    if (shouldReset) {
      setTime(0);
    }

    return () => clearInterval(timer);
  }, [isRunning, shouldReset, onTimeUpdate]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <div className="bg-white shadow-sm rounded-lg px-4 py-2 text-lg font-semibold">
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
};
