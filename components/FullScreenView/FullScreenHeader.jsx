import Image from "next/image";
import { Button } from "../ui/button";
import { X, Dumbbell, Repeat } from "lucide-react";
import RectangularTimer from "./RectangularTimer";

const FullscreenHeader = ({
  timerStates,
  timerValues,
  globalTimer3,
  onClose,
  onReset,
  onWorkoutScreenToggle
}) => {
  return (
    <div className="relative h-36 bg-black border-b-2 border-gray-600 shadow-2xl">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div className="relative flex items-center justify-between h-full px-6 pr-16">
        <div className="flex items-center justify-between w-full gap-6">
          <div className="transform hover:scale-105 transition-transform duration-200">
            <RectangularTimer
              timeLeft={
                timerStates.timer1.inDelay
                  ? timerStates.timer1.delayTimeLeft
                  : timerStates.timer1.timeLeft
              }
              totalTime={
                timerStates.timer1.inDelay ? timerValues.timer1.delay : timerValues.timer1.duration
              }
              label="Station Time"
              inDelay={timerStates.timer1.inDelay}
            />
          </div>

          <div className="flex items-center justify-center">
            <Image
              src="/logo.jpeg"
              alt="Logo"
              width={300}
              height={150}
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>

          <div className="transform hover:scale-105 transition-transform duration-200">
            <RectangularTimer
              timeLeft={timerStates.global.timeLeft}
              totalTime={globalTimer3 || 2700}
              label="Class Time"
              invert={true}
            />
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-2 flex flex-col gap-2 mt-2 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 hover:border-red-400/80 transition-all duration-300 rounded-lg shadow-lg hover:shadow-red-500/25 backdrop-blur-sm"
        >
          <X className="h-5 w-5 text-red-300 hover:text-red-100 transition-colors duration-200" />
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onReset}
          className="h-8 w-8 p-0 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 hover:border-purple-400/80 transition-all duration-300 rounded-lg shadow-lg hover:shadow-purple-500/25 backdrop-blur-sm"
        >
          <Repeat className="h-5 w-5 text-purple-300 hover:text-purple-100 transition-colors duration-200" />
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onWorkoutScreenToggle}
          className="h-8 w-8 p-0 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 hover:border-blue-400/80 transition-all duration-300 rounded-lg shadow-lg hover:shadow-blue-500/25 backdrop-blur-sm"
        >
          <Dumbbell className="h-5 w-5 text-blue-300 hover:text-blue-100 transition-colors duration-200" />
        </Button>
      </div>
    </div>
  );
};

export default FullscreenHeader;
