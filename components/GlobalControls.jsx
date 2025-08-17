import React from "react";
import { Button } from "./ui/button";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const ControlButton = ({ onClick, isFullscreen, icon, label }) => (
  <Button
    variant="secondary"
    size={isFullscreen ? "lg" : "default"}
    onClick={onClick}
    className={`${
      isFullscreen ? "h-12 px-6 text-lg" : ""
    } flex items-center gap-2 border border-gray-500 dark:border-gray-400 rounded
       transition-all duration-200 ease-in-out
       hover:bg-gray-200 dark:hover:bg-gray-700
       active:scale-95`}
  >
    {icon}
    {label}
  </Button>
);

const GlobalControls = ({
  isAllMuted,
  isAllPlaying,
  onPlayPauseAll,
  onMuteUnmuteAll,
  isFullscreen = false,
  assignments = []
}) => {
  const hasVideos = assignments.some((video) => video);

  if (!hasVideos) return null;

  return (
    <div className={`flex gap-2 ${isFullscreen ? "flex-col sm:flex-row" : ""}`}>
      <ControlButton
        onClick={onPlayPauseAll}
        isFullscreen={isFullscreen}
        icon={
          isAllPlaying ? (
            <Pause className={isFullscreen ? "h-6 w-6" : "h-4 w-4"} />
          ) : (
            <Play className={isFullscreen ? "h-6 w-6" : "h-4 w-4"} />
          )
        }
        label={isAllPlaying ? "Pause All" : "Play All"}
      />

      <ControlButton
        onClick={onMuteUnmuteAll}
        isFullscreen={isFullscreen}
        icon={
          isAllMuted ? (
            <VolumeX className={isFullscreen ? "h-6 w-6" : "h-4 w-4"} />
          ) : (
            <Volume2 className={isFullscreen ? "h-6 w-6" : "h-4 w-4"} />
          )
        }
        label={isAllMuted ? "Unmute All" : "Mute All"}
      />
    </div>
  );
};

export default GlobalControls;
