import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import VideoPlayer from "./VideoPlayer";
import { useWebSocket } from "@/hooks/useWebSocket";
import ClassCountdownModal from "./ClassCountdownModal";
import React, { useEffect, useState, useRef, useCallback } from "react";

const TIMER_COLORS = {
  delay: "#3B82F6",
  normal: "#10B981",
  warning: "#EF4444"
};

const CURSOR_HIDE_DELAY = 3000;
const LOADING_PROGRESS_INTERVAL = 150;

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

const VideoLoadingCard = ({ assignment, index, isLoaded, hasError }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState("Connecting...");
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    if (isLoaded || hasError) {
      clearInterval(progressIntervalRef.current);
      setLoadingProgress(100);
      setLoadingStage(hasError ? "Error" : "Ready");
      return;
    }

    const stages = [
      { progress: 20, stage: "Connecting..." },
      { progress: 40, stage: "Buffering..." },
      { progress: 70, stage: "Loading metadata..." },
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

const LoadingOverlay = ({ assignments, videosReady, videoErrors }) => {
  const readyCount = videosReady.filter(Boolean).length + videoErrors.filter(Boolean).length;
  const totalCount = assignments.filter(Boolean).length;
  const progressPercentage = (readyCount / totalCount) * 100;

  return (
    <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 text-center py-8">
          <div className="text-white text-4xl mb-4 font-bold">🚀 Preparing Your Videos</div>
          <div className="text-gray-300 text-xl">Each video is loading independently...</div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <div
            className="grid gap-6 max-w-7xl mx-auto"
            style={{
              gridTemplateColumns: `repeat(${Math.min(3, assignments.length)}, 1fr)`,
              gridAutoRows: "min-content"
            }}
          >
            {assignments.map(
              (assignment, index) =>
                assignment && (
                  <VideoLoadingCard
                    key={index}
                    assignment={assignment}
                    index={index}
                    isLoaded={videosReady[index]}
                    hasError={videoErrors[index]}
                  />
                )
            )}
          </div>
        </div>

        <div className="flex-shrink-0 bg-gray-900/80 border-t border-gray-700 px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-3">
              <span className="text-white text-lg font-semibold">Overall Progress</span>
              <span className="text-gray-300">
                {readyCount} of {totalCount} ready
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const useTimerManagement = (assignments, globalTimer3, globalTimers, isAllPlaying, videoRefs) => {
  const [timerStates, setTimerStates] = useState({
    global: { timeLeft: globalTimer3 || 2700, active: false },
    timer1: {
      timeLeft: 60,
      active: false,
      inDelay: false,
      delayTimeLeft: 30,
      shouldRestart: false
    },
    timer2: { timeLeft: 60, active: false, shouldRestart: false }
  });

  const timerRefs = useRef({ global: null, timer1: null, timer1Delay: null, timer2: null });

  const getTimerValues = useCallback(() => {
    const timer1Assignment = assignments.find(
      (assignment, index) => index !== 1 && assignment && assignment.timerDuration
    );
    const timer2Assignment = assignments[1];

    return {
      timer1: {
        duration: timer1Assignment?.timerDuration || globalTimers?.timer1 || 60,
        delay: timer1Assignment?.delayDuration || globalTimers?.delay1 || 30,
        delayText:
          timer1Assignment?.delayText || globalTimers?.delayText1 || "Move to the next station"
      },
      timer2: {
        duration: timer2Assignment?.timerDuration || globalTimers?.timer2 || 60,
        delay: 0,
        delayText: "Restarting Video"
      }
    };
  }, [assignments, globalTimers]);

  const timerValues = getTimerValues();

  const startAllTimers = useCallback(() => {
    console.log("🕐 Starting all timers");
    setTimerStates((prev) => ({
      ...prev,
      global: { ...prev.global, active: true },
      timer1: { ...prev.timer1, active: true, inDelay: false },
      timer2: { ...prev.timer2, active: true }
    }));
  }, []);

  const stopAllTimers = useCallback(() => {
    console.log("⏹️ Stopping all timers");
    Object.keys(timerRefs.current).forEach((key) => {
      if (timerRefs.current[key]) {
        clearInterval(timerRefs.current[key]);
        timerRefs.current[key] = null;
      }
    });

    setTimerStates((prev) => ({
      ...prev,
      global: { ...prev.global, active: false },
      timer1: { ...prev.timer1, active: false, inDelay: false },
      timer2: { ...prev.timer2, active: false }
    }));
  }, []);

  useEffect(() => {
    if (!timerStates.global.active || !isAllPlaying) {
      if (timerRefs.current.global) {
        clearInterval(timerRefs.current.global);
        timerRefs.current.global = null;
      }
      return;
    }

    timerRefs.current.global = setInterval(() => {
      setTimerStates((prev) => {
        if (prev.global.timeLeft <= 1) {
          videoRefs.current.forEach((ref) => ref?.pause?.());
          clearInterval(timerRefs.current.global);
          timerRefs.current.global = null;
          console.log("⏰ Global Timer expired");

          return {
            ...prev,
            global: { timeLeft: 0, active: false },
            timer1: { ...prev.timer1, active: false },
            timer2: { ...prev.timer2, active: false }
          };
        }
        return {
          ...prev,
          global: { ...prev.global, timeLeft: prev.global.timeLeft - 1 }
        };
      });
    }, 1000);

    return () => {
      if (timerRefs.current.global) {
        clearInterval(timerRefs.current.global);
        timerRefs.current.global = null;
      }
    };
  }, [timerStates.global.active, isAllPlaying, videoRefs]);

  useEffect(() => {
    if (!timerStates.timer1.active || !isAllPlaying || timerStates.timer1.inDelay) {
      if (timerRefs.current.timer1) {
        clearInterval(timerRefs.current.timer1);
        timerRefs.current.timer1 = null;
      }
      return;
    }

    timerRefs.current.timer1 = setInterval(() => {
      setTimerStates((prev) => {
        if (prev.timer1.timeLeft <= 1) {
          clearInterval(timerRefs.current.timer1);
          timerRefs.current.timer1 = null;
          console.log("⏰ Timer 1 expired, starting delay");

          return {
            ...prev,
            timer1: {
              ...prev.timer1,
              timeLeft: 0,
              inDelay: true,
              delayTimeLeft: timerValues.timer1.delay
            }
          };
        }
        return {
          ...prev,
          timer1: { ...prev.timer1, timeLeft: prev.timer1.timeLeft - 1 }
        };
      });
    }, 1000);

    return () => {
      if (timerRefs.current.timer1) {
        clearInterval(timerRefs.current.timer1);
        timerRefs.current.timer1 = null;
      }
    };
  }, [
    timerStates.timer1.active,
    isAllPlaying,
    timerStates.timer1.inDelay,
    timerValues.timer1.delay
  ]);

  useEffect(() => {
    if (!timerStates.timer1.inDelay || !isAllPlaying) {
      if (timerRefs.current.timer1Delay) {
        clearInterval(timerRefs.current.timer1Delay);
        timerRefs.current.timer1Delay = null;
      }
      return;
    }

    timerRefs.current.timer1Delay = setInterval(() => {
      setTimerStates((prev) => {
        if (prev.timer1.delayTimeLeft <= 1) {
          clearInterval(timerRefs.current.timer1Delay);
          timerRefs.current.timer1Delay = null;
          console.log("🔄 Timer 1 delay finished, restarting videos");

          videoRefs.current.forEach((ref, index) => {
            if (ref && assignments[index] && index !== 1 && ref.restart) {
              ref.restart();
            }
          });

          return {
            ...prev,
            timer1: {
              timeLeft: timerValues.timer1.duration,
              active: true,
              inDelay: false,
              delayTimeLeft: timerValues.timer1.delay,
              shouldRestart: true
            }
          };
        }
        return {
          ...prev,
          timer1: { ...prev.timer1, delayTimeLeft: prev.timer1.delayTimeLeft - 1 }
        };
      });
    }, 1000);

    return () => {
      if (timerRefs.current.timer1Delay) {
        clearInterval(timerRefs.current.timer1Delay);
        timerRefs.current.timer1Delay = null;
      }
    };
  }, [timerStates.timer1.inDelay, isAllPlaying, timerValues, assignments, videoRefs]);

  useEffect(() => {
    if (!timerStates.timer2.active || !isAllPlaying) {
      if (timerRefs.current.timer2) {
        clearInterval(timerRefs.current.timer2);
        timerRefs.current.timer2 = null;
      }
      return;
    }

    timerRefs.current.timer2 = setInterval(() => {
      setTimerStates((prev) => {
        if (prev.timer2.timeLeft <= 1) {
          console.log("🔄 Timer 2 expired, restarting middle top video");

          if (videoRefs.current[1] && assignments[1] && videoRefs.current[1].restart) {
            videoRefs.current[1].restart();
          }

          return {
            ...prev,
            timer2: {
              timeLeft: timerValues.timer2.duration,
              active: true,
              shouldRestart: true
            }
          };
        }
        return {
          ...prev,
          timer2: { ...prev.timer2, timeLeft: prev.timer2.timeLeft - 1 }
        };
      });
    }, 1000);

    return () => {
      if (timerRefs.current.timer2) {
        clearInterval(timerRefs.current.timer2);
        timerRefs.current.timer2 = null;
      }
    };
  }, [
    timerStates.timer2.active,
    isAllPlaying,
    timerValues.timer2.duration,
    assignments,
    videoRefs
  ]);

  useEffect(() => {
    if (timerStates.timer1.shouldRestart) {
      setTimeout(() => {
        setTimerStates((prev) => ({
          ...prev,
          timer1: { ...prev.timer1, shouldRestart: false }
        }));
      }, 100);
    }
  }, [timerStates.timer1.shouldRestart]);

  useEffect(() => {
    if (timerStates.timer2.shouldRestart) {
      setTimeout(() => {
        setTimerStates((prev) => ({
          ...prev,
          timer2: { ...prev.timer2, shouldRestart: false }
        }));
      }, 100);
    }
  }, [timerStates.timer2.shouldRestart]);

  useEffect(() => {
    return () => stopAllTimers();
  }, [stopAllTimers]);

  return {
    timerStates,
    timerValues,
    startAllTimers,
    stopAllTimers,
    setTimerStates
  };
};

const FullscreenView = ({ assignments, onClose, globalTimer3, globalTimers, screenId }) => {
  const [isAllMuted, setIsAllMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isAllPlaying, setIsAllPlaying] = useState(false);
  const [isCountdownOpen, setIsCountdownOpen] = useState(false);
  const [videosReady, setVideosReady] = useState(Array(assignments.length).fill(false));
  const [videoErrors, setVideoErrors] = useState(Array(assignments.length).fill(false));

  const videoRefs = useRef([]);
  const cursorTimeoutRef = useRef();

  const { socket, isConnected, emit } = useWebSocket(screenId);

  const { timerStates, timerValues, startAllTimers, stopAllTimers, setTimerStates } =
    useTimerManagement(assignments, globalTimer3, globalTimers, isAllPlaying, videoRefs);

  const allVideosReady = assignments.every(
    (video, i) => !video || videosReady[i] || videoErrors[i]
  );

  const handleVideoReady = useCallback((index) => {
    setVideosReady((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  }, []);

  const handleVideoError = useCallback((index) => {
    setVideoErrors((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  }, []);

  const handlePlayPauseAll = useCallback(() => {
    const newPlayingState = !isAllPlaying;

    if (newPlayingState && !isCountdownOpen) {
      // If trying to play and countdown is not already open, show countdown modal
      setIsCountdownOpen(true);
    } else if (!newPlayingState) {
      // If pausing, allow immediate pause
      videoRefs.current.forEach((ref, index) => {
        if (ref && assignments[index]) {
          ref.pause?.();
        }
      });

      setIsAllPlaying(false);
      stopAllTimers();
    }
  }, [isAllPlaying, isCountdownOpen, assignments, stopAllTimers]);

  const handleCountdownComplete = useCallback(() => {
    // Start playing after countdown completes
    videoRefs.current.forEach((ref, index) => {
      if (ref && assignments[index]) {
        ref.play?.();
      }
    });

    setIsAllPlaying(true);
    setIsCountdownOpen(false);
    startAllTimers();
  }, [assignments, startAllTimers]);

  const handleCountdownCancel = useCallback(() => {
    setIsCountdownOpen(false);
  }, []);

  const handleMuteUnmuteAll = useCallback(() => {
    videoRefs.current.forEach((ref) => {
      if (ref) {
        if (isAllMuted) {
          ref.unmute?.();
        } else {
          ref.mute?.();
        }
      }
    });
    setIsAllMuted(!isAllMuted);
  }, [isAllMuted]);

  useEffect(() => {
    const handleSyncPlay = (event) => {
      const { targetScreens } = event.detail;
      if (targetScreens.includes(screenId)) {
        console.log("🎬 FullscreenView responding to sync play");

        videoRefs.current.forEach((ref, index) => {
          if (ref && assignments[index] && ref.syncPlay) {
            ref.syncPlay();
          }
        });

        setTimerStates({
          global: { timeLeft: globalTimer3 || 2700, active: true },
          timer1: {
            timeLeft: timerValues.timer1.duration,
            active: true,
            inDelay: false,
            delayTimeLeft: timerValues.timer1.delay,
            shouldRestart: false
          },
          timer2: { timeLeft: timerValues.timer2.duration, active: true, shouldRestart: false }
        });

        setIsAllPlaying(true);
      }
    };

    const handleSyncPause = (event) => {
      const { targetScreens } = event.detail;
      if (targetScreens.includes(screenId)) {
        console.log("⏸️ FullscreenView responding to sync pause");

        videoRefs.current.forEach((ref, index) => {
          if (ref && assignments[index] && ref.syncPause) {
            ref.syncPause();
          }
        });

        setIsAllPlaying(false);
        stopAllTimers();
      }
    };

    window.addEventListener("websocket-sync-play", handleSyncPlay);
    window.addEventListener("websocket-sync-pause", handleSyncPause);

    return () => {
      window.removeEventListener("websocket-sync-play", handleSyncPlay);
      window.removeEventListener("websocket-sync-pause", handleSyncPause);
    };
  }, [screenId, assignments, globalTimer3, timerValues, setTimerStates, stopAllTimers]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") onClose();
    };

    const handleMouseMove = () => {
      setShowControls(true);
      document.body.style.cursor = "default";

      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }

      cursorTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        document.body.style.cursor = "none";
      }, CURSOR_HIDE_DELAY);
    };

    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("mousemove", handleMouseMove);

    cursorTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
      document.body.style.cursor = "none";
    }, CURSOR_HIDE_DELAY);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("mousemove", handleMouseMove);
      document.body.style.cursor = "default";
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }
    };
  }, [onClose]);

  useEffect(() => {
    setTimerStates((prev) => ({
      ...prev,
      global: { ...prev.global, timeLeft: globalTimer3 || 2700 }
    }));
  }, [globalTimer3, setTimerStates]);

  const gridCols = Math.ceil(Math.sqrt(assignments.length));
  const gridRows = Math.ceil(assignments.length / gridCols);

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden flex flex-col">
      {/* Loading Overlay */}
      {!allVideosReady && (
        <LoadingOverlay
          assignments={assignments}
          videosReady={videosReady}
          videoErrors={videoErrors}
        />
      )}

      {/* Header with timers */}
      <div className="relative h-36 bg-black border-b-2 border-gray-600 shadow-2xl">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        <div className="relative flex items-center justify-between h-full px-6 pr-28">
          <div className="flex items-center justify-between w-full gap-6">
            {/* Timer 1 */}
            <div className="transform hover:scale-105 transition-transform duration-200">
              <RectangularTimer
                timeLeft={
                  timerStates.timer1.inDelay
                    ? timerStates.timer1.delayTimeLeft
                    : timerStates.timer1.timeLeft
                }
                totalTime={
                  timerStates.timer1.inDelay
                    ? timerValues.timer1.delay
                    : timerValues.timer1.duration
                }
                label="Station Time"
                inDelay={timerStates.timer1.inDelay}
              />
            </div>

            {/* Logo */}
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

            {/* Global Timer */}
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

        {/* Top Right Controls */}
        <div className="absolute top-2 right-2 flex flex-col gap-4 mt-2 z-10">
          {/* Close Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="h-12 w-12 p-0 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 hover:border-red-400/80 transition-all duration-300 rounded-lg shadow-lg hover:shadow-red-500/25 backdrop-blur-sm"
          >
            <X className="h-5 w-5 text-red-300 hover:text-red-100 transition-colors duration-200" />
          </Button>

          {/* Reset Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              // This button does nothing for now
              console.log("Reset button clicked - no action");
            }}
            className="h-12 w-12 p-0 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 hover:border-purple-400/80 transition-all duration-300 rounded-lg shadow-lg hover:shadow-purple-500/25 backdrop-blur-sm"
          >
            <div className="text-purple-300 hover:text-purple-100 transition-colors duration-200 text-lg">
              ↻
            </div>
          </Button>
        </div>
      </div>

      {/* Video Grid */}
      <div
        className="flex-1 p-3 grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gridTemplateRows: `repeat(${gridRows}, 1fr)`,
          height: "calc(100% - 8rem)",
          minHeight: 0
        }}
      >
        {assignments.map((assignment, index) => (
          <div key={index} className="w-full h-full overflow-hidden">
            <VideoPlayer
              ref={(el) => (videoRefs.current[index] = el)}
              src={assignment}
              index={index}
              isFullscreen={true}
              globalTimer3={timerStates.global.timeLeft}
              timer2TimeLeft={timerStates.timer2.timeLeft}
              timer2Active={timerStates.timer2.active}
              externalTimer={
                index !== 1
                  ? {
                      timeLeft: timerStates.timer1.timeLeft,
                      inDelay: timerStates.timer1.inDelay,
                      delayTimeLeft: timerStates.timer1.delayTimeLeft,
                      delayDuration: timerValues.timer1.delay,
                      delayText: timerValues.timer1.delayText,
                      shouldRestart: timerStates.timer1.shouldRestart
                    }
                  : null
              }
              onReadyToPlay={() => handleVideoReady(index)}
              onVideoError={() => handleVideoError(index)}
            />
          </div>
        ))}
      </div>

      {/* Global Controls */}
      <div
        className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-4 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-600/50">
          <Button
            variant="secondary"
            size="lg"
            onClick={handlePlayPauseAll}
            className="h-12 w-12 p-0 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200"
          >
            {isAllPlaying ? (
              <div className="w-4 h-4 bg-white rounded-sm" />
            ) : (
              <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1" />
            )}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={handleMuteUnmuteAll}
            className="h-12 w-12 p-0 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200"
          >
            {isAllMuted ? (
              <div className="text-white text-lg">🔇</div>
            ) : (
              <div className="text-white text-lg">🔊</div>
            )}
          </Button>
        </div>
      </div>

      <ClassCountdownModal
        isOpen={isCountdownOpen}
        onClose={handleCountdownCancel}
        onComplete={handleCountdownComplete}
        countdownSeconds={globalTimers?.timer4 || 120}
      />
    </div>
  );
};

export default FullscreenView;
export { RectangularTimer };
