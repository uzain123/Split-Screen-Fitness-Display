const TIMER_COLORS = {
  delay: "#3B82F6",
  normal: "#10B981",
  warning: "#EF4444"
};

const formatTime = (seconds) => {
  const secs = seconds % 60;
  const mins = Math.floor(seconds / 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const getTimerColor = (timeLeft, inDelay) => {
  if (inDelay) return TIMER_COLORS.delay;
  if (timeLeft <= 20) return TIMER_COLORS.warning;
  return TIMER_COLORS.normal;
};

const RectangularTimer = ({ timeLeft, totalTime, label, inDelay = false, invert = false }) => {
  const percentage = (timeLeft / totalTime) * 100;
  const timerColor = getTimerColor(timeLeft, inDelay);

  return (
    <div className={`flex items-center gap-6 ${invert ? "flex-row-reverse" : ""}`}>
      <div
        className={`text-white text-2xl font-black drop-shadow-lg ${
          invert ? "order-1" : "order-2"
        }`}
        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
      >
        {label}
      </div>

      <div
        className="relative w-60 h-28 rounded-2xl border-4 flex flex-col items-center justify-center bg-gradient-to-br from-black/70 via-gray-900/70 to-black/70 backdrop-blur-lg shadow-2xl"
        style={{
          borderColor: timerColor,
          boxShadow: `0 0 15px ${timerColor}40, 0 6px 24px rgba(0,0,0,0.6)`
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl opacity-20 blur-sm"
          style={{ backgroundColor: timerColor }}
        />

        <div className="absolute bottom-0 left-0 right-0 h-3 bg-white/10 rounded-b-2xl overflow-hidden">
          <div
            className="h-full transition-all duration-500 rounded-b-2xl shadow-lg"
            style={{
              width: `${percentage}%`,
              backgroundColor: timerColor,
              boxShadow: `0 0 8px ${timerColor}`
            }}
          />
        </div>

        <div
          className="text-white text-6xl font-mono font-black mb-1 drop-shadow-lg z-10"
          style={{ textShadow: `0 0 8px ${timerColor}80` }}
        >
          {formatTime(timeLeft)}
        </div>
      </div>
    </div>
  );
};

export default RectangularTimer;
export { formatTime, getTimerColor, TIMER_COLORS };
