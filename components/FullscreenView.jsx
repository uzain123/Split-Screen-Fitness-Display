import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import VideoPlayer from "./VideoPlayer";
import { useWebSocket } from "@/hooks/useWebSocket";
import React, { useEffect, useState, useRef } from "react";

// Timer utilities
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
const getColor = (timeLeft, inDelay) => {
  if (inDelay) return "#3B82F6";
  if (timeLeft <= 20) return "#EF4444";
  return "#10B981";
};

// TV-Optimized Rectangular Timer Component
export const RectangularTimer = ({ timeLeft, totalTime, label, inDelay = false }) => {
  const percentage = (timeLeft / totalTime) * 100;
  return (
    <div className="flex items-center gap-6">
      <div
        className="relative w-60 h-28 rounded-2xl border-4 flex flex-col items-center justify-center bg-gradient-to-br from-black/70 via-gray-900/70 to-black/70 backdrop-blur-lg shadow-2xl"
        style={{
          borderColor: getColor(timeLeft, inDelay),
          boxShadow: `0 0 15px ${getColor(timeLeft, inDelay)}40, 0 6px 24px rgba(0,0,0,0.6)`
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl opacity-20 blur-sm"
          style={{ backgroundColor: getColor(timeLeft, inDelay) }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-white/10 rounded-b-2xl overflow-hidden">
          <div
            className="h-full transition-all duration-500 rounded-b-2xl shadow-lg"
            style={{
              width: `${percentage}%`,
              backgroundColor: getColor(timeLeft, inDelay),
              boxShadow: `0 0 8px ${getColor(timeLeft, inDelay)}`
            }}
          />
        </div>
        <div
          className="text-white text-6xl font-mono font-black mb-1 drop-shadow-lg z-10"
          style={{ textShadow: `0 0 8px ${getColor(timeLeft, inDelay)}80` }}
        >
          {formatTime(timeLeft)}
        </div>
      </div>
      <div
        className="text-white text-2xl font-black drop-shadow-lg"
        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
      >
        {label}
      </div>
    </div>
  );
};

// Individual Video Loading Component
const VideoLoadingCard = ({ assignment, index, isLoaded, hasError }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState("Connecting...");
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    if (isLoaded || hasError) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setLoadingProgress(100);
      setLoadingStage(hasError ? "Error" : "Ready");
      return;
    }

    let progress = 0;
    const stages = [
      { progress: 20, stage: "Connecting..." },
      { progress: 40, stage: "Buffering..." },
      { progress: 70, stage: "Loading metadata..." },
      { progress: 90, stage: "Preparing..." }
    ];

    let currentStageIndex = 0;
    setLoadingProgress(0);
    setLoadingStage("Connecting...");

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
    }, 150);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
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
          ></div>
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

const FullscreenView = ({ assignments, onClose, globalTimer3, globalTimers, screenId }) => {
  const [showControls, setShowControls] = useState(true);
  const [isAllPlaying, setIsAllPlaying] = useState(false);
  const [isAllMuted, setIsAllMuted] = useState(false);
  const [videosReady, setVideosReady] = useState(Array(assignments.length).fill(false));
  const [videoErrors, setVideoErrors] = useState(Array(assignments.length).fill(false));
  const videoRefs = useRef([]);
  const cursorTimeoutRef = useRef();

  // WebSocket integration
  const { socket, isConnected, emit } = useWebSocket(screenId);

  // 🔥 OPTIMIZED: Centralized timer management
  const [globalTimeLeft, setGlobalTimeLeft] = useState(globalTimer3 || 2700);
  const [globalTimerActive, setGlobalTimerActive] = useState(false);

  // Timer values calculation
  const getTimer1Values = () => {
    const timer1Assignment = assignments.find(
      (assignment, index) => index !== 1 && assignment && assignment.timerDuration
    );
    return {
      duration: timer1Assignment?.timerDuration || globalTimers?.timer1 || 60,
      delay: timer1Assignment?.delayDuration || globalTimers?.delay1 || 30,
      delayText:
        timer1Assignment?.delayText || globalTimers?.delayText1 || "Move to the next station"
    };
  };

  const getTimer2Values = () => {
    const timer2Assignment = assignments[1];
    return {
      duration: timer2Assignment?.timerDuration || globalTimers?.timer2 || 60,
      delay: 0,
      delayText: "Restarting Video"
    };
  };

  const timer1Values = getTimer1Values();
  const timer2Values = getTimer2Values();

  // 🔥 OPTIMIZED: Single timer state management
  const [timerStates, setTimerStates] = useState({
    global: { timeLeft: globalTimer3 || 2700, active: false },
    timer1: {
      timeLeft: timer1Values.duration,
      active: false,
      inDelay: false,
      delayTimeLeft: timer1Values.delay,
      shouldRestart: false
    },
    timer2: { timeLeft: timer2Values.duration, active: false, shouldRestart: false }
  });

  // Timer refs for cleanup
  const timerRefs = useRef({
    global: null,
    timer1: null,
    timer1Delay: null,
    timer2: null
  });

  const allVideosReady = assignments.every(
    (video, i) => !video || videosReady[i] || videoErrors[i]
  );

  // 🔥 OPTIMIZED: Centralized timer control
  const startAllTimers = () => {
    console.log("🕐 Starting all timers in FullscreenView");
    setTimerStates((prev) => ({
      ...prev,
      global: { ...prev.global, active: true },
      timer1: { ...prev.timer1, active: true, inDelay: false },
      timer2: { ...prev.timer2, active: true }
    }));
  };

  const stopAllTimers = () => {
    console.log("⏹️ Stopping all timers in FullscreenView");
    // Clear all intervals
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
  };

  // 🔥 OPTIMIZED: WebSocket sync event listeners
  useEffect(() => {
    const handleSyncPlay = (event) => {
      const { targetScreens } = event.detail;
      if (targetScreens.includes(screenId)) {
        console.log("🎬 FullscreenView responding to sync play");

        // Reset and play all videos
        videoRefs.current.forEach((ref, index) => {
          if (ref && assignments[index] && ref.syncPlay) {
            ref.syncPlay();
          }
        });

        // Reset timers to initial values and start them
        setTimerStates((prev) => ({
          global: { timeLeft: globalTimer3 || 2700, active: true },
          timer1: {
            timeLeft: timer1Values.duration,
            active: true,
            inDelay: false,
            delayTimeLeft: timer1Values.delay,
            shouldRestart: false
          },
          timer2: { timeLeft: timer2Values.duration, active: true, shouldRestart: false }
        }));

        setIsAllPlaying(true);
      }
    };

    const handleSyncPause = (event) => {
      const { targetScreens } = event.detail;
      if (targetScreens.includes(screenId)) {
        console.log("⏸️ FullscreenView responding to sync pause");

        // Pause all videos
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
  }, [screenId, assignments, globalTimer3, timer1Values, timer2Values]);

  // 🔥 OPTIMIZED: Global Timer Effect
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
          // Global timer expired - stop everything
          videoRefs.current.forEach((ref) => {
            if (ref && ref.pause) {
              ref.pause();
            }
          });
          setIsAllPlaying(false);
          clearInterval(timerRefs.current.global);
          timerRefs.current.global = null;
          console.log("⏰ Global Timer expired - stopping all playback");

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
  }, [timerStates.global.active, isAllPlaying]);

  // 🔥 OPTIMIZED: Timer 1 Main Effect
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
              delayTimeLeft: timer1Values.delay
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
  }, [timerStates.timer1.active, isAllPlaying, timerStates.timer1.inDelay, timer1Values.delay]);

  // 🔥 OPTIMIZED: Timer 1 Delay Effect
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

          // Restart all non-middle-top videos
          videoRefs.current.forEach((ref, index) => {
            if (ref && assignments[index] && index !== 1 && ref.restart) {
              ref.restart();
            }
          });

          return {
            ...prev,
            timer1: {
              timeLeft: timer1Values.duration,
              active: true,
              inDelay: false,
              delayTimeLeft: timer1Values.delay,
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
  }, [
    timerStates.timer1.inDelay,
    isAllPlaying,
    timer1Values.duration,
    timer1Values.delay,
    assignments
  ]);

  // Reset shouldRestart flag after videos have restarted
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

  // 🔥 OPTIMIZED: Timer 2 Effect (auto-restart for middle top)
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

          // Restart middle top video (index 1)
          if (videoRefs.current[1] && assignments[1] && videoRefs.current[1].restart) {
            videoRefs.current[1].restart();
          }

          return {
            ...prev,
            timer2: {
              timeLeft: timer2Values.duration,
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
  }, [timerStates.timer2.active, isAllPlaying, timer2Values.duration, assignments]);

  // Reset Timer 2 shouldRestart flag
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

  // Update timers when props change
  useEffect(() => {
    setTimerStates((prev) => ({
      ...prev,
      global: { ...prev.global, timeLeft: globalTimer3 || 2700 }
    }));
  }, [globalTimer3]);

  useEffect(() => {
    const newTimer1Values = getTimer1Values();
    const newTimer2Values = getTimer2Values();
    setTimerStates((prev) => ({
      ...prev,
      timer1: {
        ...prev.timer1,
        timeLeft: prev.timer1.active ? prev.timer1.timeLeft : newTimer1Values.duration,
        delayTimeLeft: newTimer1Values.delay
      },
      timer2: {
        ...prev.timer2,
        timeLeft: prev.timer2.active ? prev.timer2.timeLeft : newTimer2Values.duration
      }
    }));
  }, [assignments, globalTimers]);

  const handleVideoReady = (index) => {
    setVideosReady((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

  const handleVideoError = (index) => {
    setVideoErrors((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
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
      }, 3000);
    };

    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("mousemove", handleMouseMove);
    cursorTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
      document.body.style.cursor = "none";
    }, 3000);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("mousemove", handleMouseMove);
      document.body.style.cursor = "default";
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }
      // Cleanup all timers on unmount
      stopAllTimers();
    };
  }, [onClose]);

  // 🔥 OPTIMIZED: Local play/pause handler with proper timer management
  const handlePlayPauseAll = () => {
    const newPlayingState = !isAllPlaying;

    videoRefs.current.forEach((ref) => {
      if (ref && assignments[videoRefs.current.indexOf(ref)]) {
        if (newPlayingState) {
          ref.play();
        } else {
          ref.pause();
        }
      }
    });

    setIsAllPlaying(newPlayingState);

    if (newPlayingState) {
      startAllTimers();
    } else {
      stopAllTimers();
    }
  };

  const handleMuteUnmuteAll = () => {
    videoRefs.current.forEach((ref) => {
      if (ref) {
        if (isAllMuted) {
          ref.unmute();
        } else {
          ref.mute();
        }
      }
    });
    setIsAllMuted(!isAllMuted);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden flex flex-col">
      {/* Video Loading Overlay */}
      {!allVideosReady && (
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
                    {videosReady.filter(Boolean).length + videoErrors.filter(Boolean).length} of{" "}
                    {assignments.filter(Boolean).length} ready
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                    style={{
                      width: `${
                        ((videosReady.filter(Boolean).length + videoErrors.filter(Boolean).length) /
                          assignments.filter(Boolean).length) *
                        100
                      }%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with 3-timer layout - Enhanced Design */}
      <div className="relative h-36 bg-black border-b-2 border-gray-600 shadow-2xl">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="relative flex items-center justify-between h-full px-6">
          <div className="flex items-center justify-between w-full gap-6">
            <div className="flex items-center gap-6">
              <div className="transform hover:scale-105 transition-transform duration-200">
                <RectangularTimer
                  timeLeft={
                    timerStates.timer1.inDelay
                      ? timerStates.timer1.delayTimeLeft
                      : timerStates.timer1.timeLeft
                  }
                  totalTime={
                    timerStates.timer1.inDelay ? timer1Values.delay : timer1Values.duration
                  }
                  isActive={timerStates.timer1.active}
                  isPlaying={isAllPlaying}
                  label="Station Time"
                  inDelay={timerStates.timer1.inDelay}
                  delayText={timer1Values.delayText}
                />
              </div>
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
            <div className="flex items-center gap-6">
              <div className="transform hover:scale-105 transition-transform duration-200">
                <RectangularTimer
                  timeLeft={timerStates.global.timeLeft}
                  totalTime={globalTimer3 || 2700}
                  isActive={timerStates.global.active}
                  isPlaying={isAllPlaying}
                  label="Class Time"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Close Button - Top Right Corner */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
          className="absolute top-2 right-2 h-10 w-10 p-0 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 hover:border-red-400/80 transition-all duration-300 rounded-lg shadow-lg hover:shadow-red-500/25 backdrop-blur-sm z-10"
        >
          <X className="h-5 w-5 text-red-300 hover:text-red-100 transition-colors duration-200" />
        </Button>
      </div>

      {/* Video grid */}
      <div
        className="flex-1 p-3 grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(assignments.length))}, 1fr)`,
          gridTemplateRows: `repeat(${Math.ceil(
            assignments.length / Math.ceil(Math.sqrt(assignments.length))
          )}, 1fr)`,
          display: "grid",
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
              // 🔥 OPTIMIZED: Pass external timer data for delay display
              externalTimer={
                index !== 1
                  ? {
                      timeLeft: timerStates.timer1.timeLeft,
                      inDelay: timerStates.timer1.inDelay,
                      delayTimeLeft: timerStates.timer1.delayTimeLeft,
                      delayDuration: timer1Values.delay,
                      delayText: timer1Values.delayText,
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
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            ) : (
              <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
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

      {/* Instructions */}
      <div
        className={`absolute bottom-6 left-8 text-white transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-lg text-gray-300 font-medium">
          Press ESC to exit • Move mouse to show controls
        </p>
      </div>
    </div>
  );
};

export default FullscreenView;
