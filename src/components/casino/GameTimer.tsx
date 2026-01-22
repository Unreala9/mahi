import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GameTimerProps {
  duration: number; // in seconds
  onComplete?: () => void;
  className?: string;
}

export function GameTimer({ duration, onComplete, className }: GameTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const percentage = (timeLeft / duration) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on time remaining
  const getColor = () => {
    if (percentage > 50) return "text-green-500";
    if (percentage > 25) return "text-yellow-500";
    return "text-red-500";
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("relative w-24 h-24", className)}>
      {/* SVG Circle */}
      <svg className="w-full h-full transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="48"
          cy="48"
          r="45"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx="48"
          cy="48"
          r="45"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn("transition-all duration-1000", getColor())}
          strokeLinecap="round"
        />
      </svg>

      {/* Time text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl font-bold font-mono", getColor())}>
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
}

interface CountdownTimerProps {
  targetTime: Date | string;
  onExpire?: () => void;
  label?: string;
}

export function CountdownTimer({
  targetTime,
  onExpire,
  label = "Time Left",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const target = new Date(targetTime).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = Math.floor((target - now) / 1000);

      if (difference <= 0) {
        setTimeLeft(0);
        onExpire?.();
      } else {
        setTimeLeft(difference);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [targetTime, onExpire]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getColorClass = () => {
    if (timeLeft > 300) return "text-green-500";
    if (timeLeft > 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg">
      <div className="relative w-3 h-3">
        <div
          className={cn(
            "absolute inset-0 rounded-full animate-pulse",
            getColorClass(),
          )}
        />
      </div>
      <div className="text-sm text-gray-400">{label}:</div>
      <div className={cn("text-lg font-mono font-bold", getColorClass())}>
        {formatTime(timeLeft)}
      </div>
    </div>
  );
}
