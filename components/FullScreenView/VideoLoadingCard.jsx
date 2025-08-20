import React, { useEffect, useState, useRef } from "react";

const LOADING_PROGRESS_INTERVAL = 150;

const VideoLoadingCard = ({ assignment, index, isLoaded, hasError }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState("Connecting...");
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    if (isLoaded || hasError) {
      setLoadingProgress(100);
      clearInterval(progressIntervalRef.current);
      setLoadingStage(hasError ? "Error" : "Ready");
      return;
    }

    const stages = [
      { progress: 25, stage: "Connecting..." },
      { progress: 50, stage: "Buffering..." },
      { progress: 75, stage: "Loading..." },
      { progress: 90, stage: "Preparing..." }
    ];

    let progress = 0;
    let currentStageIndex = 0;

    progressIntervalRef.current = setInterval(() => {
      progress += Math.random() * 8 + 2;

      const currentStage = stages.find(
        (s) => progress >= s.progress - 10 && progress < s.progress + 10
      );

      if (currentStage && currentStageIndex < stages.length - 1) {
        setLoadingStage(currentStage.stage);
        currentStageIndex++;
      }

      if (progress >= 95) {
        progress = 95;
        setLoadingStage("Almost ready...");
      }

      setLoadingProgress(progress);
    }, LOADING_PROGRESS_INTERVAL);

    return () => clearInterval(progressIntervalRef.current);
  }, [isLoaded, hasError]);

  const getStatusColor = () => {
    if (hasError) return "bg-red-500";
    if (isLoaded) return "bg-green-500";
    return "bg-blue-500";
  };

  const getStatusText = () => {
    if (hasError) return "Failed to load";
    if (isLoaded) return "Ready to play";
    return loadingStage;
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 border border-gray-600/50 min-h-[200px] flex flex-col justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">📺</div>
          <div>
            <h3 className="text-white text-xl font-bold">
              {assignment?.name || `Player ${index + 1}`}
            </h3>
            <p className="text-gray-300 text-sm">Position {index + 1}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div
            className={`w-3 h-3 rounded-full ${getStatusColor()} ${
              !isLoaded && !hasError ? "animate-pulse" : ""
            }`}
          />
          <span className="text-gray-300 text-sm">{getStatusText()}</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-400">Loading Progress</span>
          <span className="text-xs text-gray-400">{Math.round(loadingProgress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              hasError ? "bg-red-500" : isLoaded ? "bg-green-500" : "bg-blue-500"
            }`}
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoLoadingCard;
