import React from "react";
import { Button } from "./ui/button";
import { Play, Pause, Volume2, VolumeX, Shuffle } from "lucide-react";

const GlobalControls = ({
  isAllPlaying,
  isAllMuted,
  onPlayPauseAll,
  onMuteUnmuteAll,
  onRandomAssign,
  isFullscreen = false,
  assignments = []
}) => {
  const hasVideos = assignments.some((video) => video);

  return (
    <div className={`flex gap-2 ${isFullscreen ? "flex-col sm:flex-row" : ""}`}>
      {!isFullscreen && (
        <Button
          variant="secondary"
          size="default"
          onClick={onRandomAssign}
          className="flex items-center gap-2 border border-gray-500 dark:border-gray-400 rounded"
        >
          <Shuffle className="h-4 w-4" />
          Random Assign
        </Button>
      )}

      {hasVideos && (
        <Button
          variant="secondary"
          size={isFullscreen ? "lg" : "default"}
          onClick={onPlayPauseAll}
          className={`${
            isFullscreen ? "h-12 px-6" : ""
          } flex items-center gap-2 border border-gray-500 dark:border-gray-400 rounded`}
        >
          {isAllPlaying ? (
            <Pause className={isFullscreen ? "h-6 w-6" : "h-4 w-4"} />
          ) : (
            <Play className={isFullscreen ? "h-6 w-6" : "h-4 w-4"} />
          )}
          {isAllPlaying ? "Pause All" : "Play All"}
        </Button>
      )}

      {hasVideos && (
        <Button
          variant="secondary"
          size={isFullscreen ? "lg" : "default"}
          onClick={onMuteUnmuteAll}
          className={`${
            isFullscreen ? "h-12 px-6" : ""
          } flex items-center gap-2 border border-gray-500 dark:border-gray-400 rounded`}
        >
          {isAllMuted ? (
            <VolumeX className={isFullscreen ? "h-6 w-6" : "h-4 w-4"} />
          ) : (
            <Volume2 className={isFullscreen ? "h-6 w-6" : "h-4 w-4"} />
          )}
          {isAllMuted ? "Unmute All" : "Mute All"}
        </Button>
      )}
    </div>
  );
};

export default GlobalControls;
