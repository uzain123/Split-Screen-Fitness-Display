import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X, Timer } from "lucide-react";

const ClassCountdownModal = ({
  isOpen,
  onClose,
  onComplete,
  countdownSeconds = 120,
  className = ""
}) => {
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(countdownSeconds);
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [isOpen, countdownSeconds]);

  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsActive(false);
            onComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    return ((countdownSeconds - timeLeft) / countdownSeconds) * 100;
  };

  const getTimerColor = () => {
    if (timeLeft <= 10) return "#EF4444"; // Red for last 10 seconds
    if (timeLeft <= 30) return "#F59E0B"; // Orange for last 30 seconds
    return "#10B981"; // Green for normal countdown
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-600 shadow-2xl max-w-md w-full ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Timer className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Class Starting Soon</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-8 text-center space-y-6">
          {/* Main Timer Display */}
          <div className="relative">
            <div
              className="w-32 h-32 mx-auto rounded-full border-8 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 shadow-inner"
              style={{
                borderColor: getTimerColor(),
                boxShadow: `0 0 20px ${getTimerColor()}40, inset 0 2px 8px rgba(0,0,0,0.3)`
              }}
            >
              <div className="text-3xl font-bold" style={{ color: getTimerColor() }}>
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Progress Ring */}
            <svg
              className="absolute inset-0 w-32 h-32 mx-auto transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(148, 163, 184, 0.2)"
                strokeWidth="4"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={getTimerColor()}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-white">Class is starting in</p>
            <p className="text-slate-300">
              Get ready! The fitness session will begin automatically when the timer reaches zero.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center pt-4">
            <Button
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700 text-white px-6"
            >
              Start Now
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-500 text-slate-300 hover:bg-slate-700 px-6"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassCountdownModal;
