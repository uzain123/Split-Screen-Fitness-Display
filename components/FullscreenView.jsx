import React, { useEffect, useState, useRef } from 'react';
import { X, Timer, Clock } from 'lucide-react';
import { Button } from './ui/button';
import VideoPlayer from './VideoPlayer';
import GlobalControls from './GlobalControls';
import Image from 'next/image';
import { useWebSocket } from '@/hooks/useWebSocket'; // Add WebSocket integration

// TV-Optimized Circular Timer Component
const CircularTimer = ({ timeLeft, totalTime, isActive, isPlaying, label, inDelay = false, delayText = "" }) => {
  const percentage = (timeLeft / totalTime) * 100;
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (inDelay) return '#3B82F6';
    if (timeLeft <= 20) return '#EF4444';
    return '#10B981';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r="60"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="70"
            cy="70"
            r="60"
            stroke={getColor()}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-2xl font-mono font-bold">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="text-white text-xl font-bold">
          {label}
        </div>
        <div className="text-gray-300 text-lg">
          {inDelay 
            ? delayText 
            : `${isActive && isPlaying ? 'Active' : 'Paused'}`
          }
        </div>
      </div>
    </div>
  );
};

// Individual Video Loading Component (unchanged)
const VideoLoadingCard = ({ assignment, index, isLoaded, hasError }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('Connecting...');
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    if (isLoaded || hasError) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setLoadingProgress(100);
      setLoadingStage(hasError ? 'Error' : 'Ready');
      return;
    }

    let progress = 0;
    const stages = [
      { progress: 20, stage: 'Connecting...' },
      { progress: 40, stage: 'Buffering...' },
      { progress: 70, stage: 'Loading metadata...' },
      { progress: 90, stage: 'Preparing...' },
    ];
    
    let currentStageIndex = 0;
    setLoadingProgress(0);
    setLoadingStage('Connecting...');

    progressIntervalRef.current = setInterval(() => {
      progress += Math.random() * 8 + 2;
      
      const currentStage = stages.find(s => progress >= s.progress - 10 && progress < s.progress + 10);
      if (currentStage && currentStageIndex < stages.length - 1) {
        setLoadingStage(currentStage.stage);
        currentStageIndex++;
      }
      
      if (progress >= 95) {
        progress = 95;
        setLoadingStage('Almost ready...');
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
    if (hasError) return 'bg-red-500';
    if (isLoaded) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getStatusText = () => {
    if (hasError) return 'Failed to load';
    if (isLoaded) return 'Ready to play';
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
            <p className="text-gray-300 text-sm">
              Position {index + 1}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${!isLoaded && !hasError ? 'animate-pulse' : ''}`}></div>
          <span className="text-gray-300 text-sm">
            {getStatusText()}
          </span>
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
              hasError ? 'bg-red-500' : isLoaded ? 'bg-green-500' : 'bg-blue-500'
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

  // 🔥 WEBSOCKET INTEGRATION
  const { socket, isConnected, emit } = useWebSocket(screenId);

  // 🔥 FIXED: Three Timer System - Global Timer (Timer 3) state
  const [globalTimeLeft, setGlobalTimeLeft] = useState(globalTimer3 || 2700);
  const [globalTimerActive, setGlobalTimerActive] = useState(false);
  const globalTimerRef = useRef(null);

  // 🔥 FIXED: Timer 1 state - Get values from first non-middle-top assignment
  const getTimer1Values = () => {
    const timer1Assignment = assignments.find((assignment, index) =>
      index !== 1 && assignment && assignment.timerDuration
    );

    return {
      duration: timer1Assignment?.timerDuration || globalTimers?.timer1 || 60,
      delay: timer1Assignment?.delayDuration || globalTimers?.delay1 || 30,
      delayText: timer1Assignment?.delayText || globalTimers?.delayText1 || 'Move to the next station'
    };
  };

  // 🔥 FIXED: Timer 2 state - Get values from middle top assignment (index 1)
  const getTimer2Values = () => {
    const timer2Assignment = assignments[1];

    return {
      duration: timer2Assignment?.timerDuration || globalTimers?.timer2 || 60,
      delay: 0,
      delayText: 'Restarting Video'
    };
  };

  const timer1Values = getTimer1Values();
  const timer2Values = getTimer2Values();

  const [timer1TimeLeft, setTimer1TimeLeft] = useState(timer1Values.duration);
  const [timer1Active, setTimer1Active] = useState(false);
  const [timer1InDelay, setTimer1InDelay] = useState(false);
  const [timer1DelayTimeLeft, setTimer1DelayTimeLeft] = useState(timer1Values.delay);
  const timer1Ref = useRef(null);
  const timer1DelayRef = useRef(null);

  // Timer 2 state
  const [timer2TimeLeft, setTimer2TimeLeft] = useState(timer2Values.duration);
  const [timer2Active, setTimer2Active] = useState(false);
  const timer2Ref = useRef(null);

  const allVideosReady = assignments.every((video, i) => !video || videosReady[i] || videoErrors[i]);

  // 🔥 FIXED: Helper functions to start/stop all timers
  const startAllTimers = () => {
    console.log('🕐 Starting all timers in FullscreenView');
    setGlobalTimerActive(true);
    setTimer1Active(true);
    setTimer2Active(true);
  };

  const stopAllTimers = () => {
    console.log('⏹️ Stopping all timers in FullscreenView');
    setGlobalTimerActive(false);
    setTimer1Active(false);
    setTimer2Active(false);
    setTimer1InDelay(false);
  };

  // 🔥 FIXED: WebSocket sync event listeners with proper timer management
  useEffect(() => {
    const handleSyncPlay = (event) => {
      const { targetScreens } = event.detail;
      if (targetScreens.includes(screenId)) {
        console.log('🎬 FullscreenView responding to sync play');
        
        // Play all videos and start timers
        videoRefs.current.forEach((ref, index) => {
          if (ref && assignments[index]) {
            if (ref.syncPlay) {
              // Use VideoPlayer's syncPlay method if available
              ref.syncPlay();
            } else {
              // Fallback to direct video element control
              const videoElement = ref.querySelector ? ref.querySelector('video') : ref;
              if (videoElement && videoElement.play) {
                videoElement.currentTime = 0;
                videoElement.play().catch(e => console.warn('Play failed:', e));
              }
            }
          }
        });
        
        setIsAllPlaying(true);
        // 🔥 FIXED: Start all timers when WebSocket play is received
        startAllTimers();
      }
    };

    const handleSyncPause = (event) => {
      const { targetScreens } = event.detail;
      if (targetScreens.includes(screenId)) {
        console.log('⏸️ FullscreenView responding to sync pause');
        
        // Pause all videos and stop timers
        videoRefs.current.forEach((ref, index) => {
          if (ref && assignments[index]) {
            if (ref.syncPause) {
              // Use VideoPlayer's syncPause method if available
              ref.syncPause();
            } else {
              // Fallback to direct video element control
              const videoElement = ref.querySelector ? ref.querySelector('video') : ref;
              if (videoElement && videoElement.pause) {
                videoElement.pause();
              }
            }
          }
        });
        
        setIsAllPlaying(false);
        // 🔥 FIXED: Stop all timers when WebSocket pause is received
        stopAllTimers();
      }
    };

    window.addEventListener('websocket-sync-play', handleSyncPlay);
    window.addEventListener('websocket-sync-pause', handleSyncPause);

    return () => {
      window.removeEventListener('websocket-sync-play', handleSyncPlay);
      window.removeEventListener('websocket-sync-pause', handleSyncPause);
    };
  }, [screenId, assignments]);
  
  // Auto-start timers when entering fullscreen and videos are playing
  useEffect(() => {
    if (isAllPlaying) {
      startAllTimers();
    }
  }, [isAllPlaying]);

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

  // 🔥 FIXED: Timer 1 Main Timer Logic
  useEffect(() => {
    if (!timer1Active || !isAllPlaying || timer1InDelay) {
      if (timer1Ref.current) {
        clearInterval(timer1Ref.current);
        timer1Ref.current = null;
      }
      return;
    }

    timer1Ref.current = setInterval(() => {
      setTimer1TimeLeft(prev => {
        if (prev <= 1) {
          setTimer1InDelay(true);
          setTimer1DelayTimeLeft(timer1Values.delay);
          clearInterval(timer1Ref.current);
          timer1Ref.current = null;
          console.log('⏰ Timer 1 expired, starting delay');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timer1Ref.current) {
        clearInterval(timer1Ref.current);
        timer1Ref.current = null;
      }
    };
  }, [timer1Active, isAllPlaying, timer1InDelay, timer1Values.delay]);

  // 🔥 FIXED: Timer 1 Delay Logic
  useEffect(() => {
    if (!timer1InDelay || !isAllPlaying) {
      if (timer1DelayRef.current) {
        clearInterval(timer1DelayRef.current);
        timer1DelayRef.current = null;
      }
      return;
    }

    timer1DelayRef.current = setInterval(() => {
      setTimer1DelayTimeLeft(prev => {
        if (prev <= 1) {
          setTimer1InDelay(false);
          setTimer1TimeLeft(timer1Values.duration);
          clearInterval(timer1DelayRef.current);
          timer1DelayRef.current = null;
          console.log('🔄 Timer 1 delay finished, restarting');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timer1DelayRef.current) {
        clearInterval(timer1DelayRef.current);
        timer1DelayRef.current = null;
      }
    };
  }, [timer1InDelay, isAllPlaying, timer1Values.duration]);

  // 🔥 FIXED: Timer 2 Logic (for middle top video - restarts automatically)
  useEffect(() => {
    if (!timer2Active || !isAllPlaying) {
      if (timer2Ref.current) {
        clearInterval(timer2Ref.current);
        timer2Ref.current = null;
      }
      return;
    }

    timer2Ref.current = setInterval(() => {
      setTimer2TimeLeft(prev => {
        if (prev <= 1) {
          setTimer2TimeLeft(timer2Values.duration);
          console.log('🔄 Timer 2 restarted');
          return timer2Values.duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timer2Ref.current) {
        clearInterval(timer2Ref.current);
        timer2Ref.current = null;
      }
    };
  }, [timer2Active, isAllPlaying, timer2Values.duration]);

  // 🔥 FIXED: Global Timer 3 logic (master timer that stops everything)
  useEffect(() => {
    if (!globalTimerActive || !isAllPlaying) {
      if (globalTimerRef.current) {
        clearInterval(globalTimerRef.current);
        globalTimerRef.current = null;
      }
      return;
    }

    globalTimerRef.current = setInterval(() => {
      setGlobalTimeLeft(prev => {
        if (prev <= 1) {
          // Global timer expired - stop everything
          videoRefs.current.forEach((ref) => {
            if (ref && ref.pause) {
              ref.pause();
            }
          });
          setIsAllPlaying(false);
          stopAllTimers();
          clearInterval(globalTimerRef.current);
          globalTimerRef.current = null;
          console.log('⏰ Global Timer 3 expired - stopping all playback');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (globalTimerRef.current) {
        clearInterval(globalTimerRef.current);
        globalTimerRef.current = null;
      }
    };
  }, [globalTimerActive, isAllPlaying]);

  // Update timers when props change
  useEffect(() => {
    setGlobalTimeLeft(globalTimer3 || 2700);
  }, [globalTimer3]);

  useEffect(() => {
    const newTimer1Values = getTimer1Values();
    const newTimer2Values = getTimer2Values();
    setTimer1TimeLeft(newTimer1Values.duration);
    setTimer1DelayTimeLeft(newTimer1Values.delay);
    setTimer2TimeLeft(newTimer2Values.duration);
  }, [assignments, globalTimers]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleMouseMove = () => {
      setShowControls(true);
      document.body.style.cursor = 'default';
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }
      cursorTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        document.body.style.cursor = 'none';
      }, 3000);
    };

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('mousemove', handleMouseMove);
    cursorTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
      document.body.style.cursor = 'none';
    }, 3000);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'default';
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }
    };
  }, [onClose]);

  // 🔥 FIXED: Local play/pause handler now properly manages all timers
  const handlePlayPauseAll = () => {
    videoRefs.current.forEach((ref) => {
      if (ref) {
        if (isAllPlaying) {
          ref.pause();
        } else {
          ref.play();
        }
      }
    });

    const newPlayingState = !isAllPlaying;
    setIsAllPlaying(newPlayingState);

    // 🔥 FIXED: Properly manage all timers when playing/pausing locally
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
      {/* WebSocket Status Indicator (top-right corner) */}

      {/* TV-Optimized Individual Video Loading Overlay */}
      {!allVideosReady && (
        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-sm">
          <div className="h-full flex flex-col">
            <div className="flex-shrink-0 text-center py-8">
              <div className="text-white text-4xl mb-4 font-bold">🚀 Preparing Your Videos</div>
              <div className="text-gray-300 text-xl">Each video is loading independently...</div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <div className="grid gap-6 max-w-7xl mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(3, assignments.length)}, 1fr)`,
                  gridAutoRows: 'min-content'
                }}>
                {assignments.map((assignment, index) => (
                  assignment && (
                    <VideoLoadingCard
                      key={index}
                      assignment={assignment}
                      index={index}
                      isLoaded={videosReady[index]}
                      hasError={videoErrors[index]}
                    />
                  )
                ))}
              </div>
            </div>

            <div className="flex-shrink-0 bg-gray-900/80 border-t border-gray-700 px-8 py-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white text-lg font-semibold">Overall Progress</span>
                  <span className="text-gray-300">
                    {videosReady.filter(Boolean).length + videoErrors.filter(Boolean).length} of {assignments.filter(Boolean).length} ready
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                    style={{ 
                      width: `${((videosReady.filter(Boolean).length + videoErrors.filter(Boolean).length) / assignments.filter(Boolean).length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 FIXED: TV-Optimized Header with proper 3-timer layout */}
      <div className="relative h-40 bg-black border-b border-gray-800 flex items-center justify-between px-16">
        {/* Timer 1 (Left) */}
        <div className="flex-1 flex items-center pl-6">
          <div className="scale-110 transform">
            <CircularTimer
              timeLeft={timer1InDelay ? timer1DelayTimeLeft : timer1TimeLeft}
              totalTime={timer1InDelay ? timer1Values.delay : timer1Values.duration}
              isActive={timer1Active}
              isPlaying={isAllPlaying}
              label="Timer 1"
              inDelay={timer1InDelay}
              delayText={timer1Values.delayText}
            />
          </div>
        </div>

        {/* Logo (Center) */}
        <div className="flex-1 flex justify-center items-center px-12">
          <Image
            src="/logo.jpeg"
            alt="Logo"
            width={200}
            height={100}
            className="object-contain"
            priority
          />
        </div>

        {/* Global Timer (Right) with Close Button */}
        <div className="flex-1 flex items-center justify-end gap-8 pr-6">
          <div className="scale-110 transform">
            <CircularTimer
              timeLeft={globalTimeLeft}
              totalTime={globalTimer3 || 2700}
              isActive={globalTimerActive}
              isPlaying={isAllPlaying}
              label="Global Timer"
            />
          </div>
          <Button
            variant="secondary"
            size="lg"
            onClick={onClose}
            className="h-16 w-16 p-0 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 hover:border-red-500/60 transition-all duration-200 ml-6"
          >
            <X className="h-8 w-8 text-red-400" />
          </Button>
        </div>
      </div>

      {/* Video grid */}
      <div className="flex-1 p-3 grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(assignments.length))}, 1fr)`,
          gridTemplateRows: `repeat(${Math.ceil(assignments.length / Math.ceil(Math.sqrt(assignments.length)))}, 1fr)`,
          display: 'grid',
          height: 'calc(100% - 10rem)',
          minHeight: 0,
        }}>
        {assignments.map((assignment, index) => (
          <div key={index} className="w-full h-full overflow-hidden">
            <VideoPlayer
              ref={(el) => (videoRefs.current[index] = el)}
              src={assignment}
              index={index}
              isFullscreen={true}
              globalTimer3={globalTimeLeft}
              globalTimerActive={globalTimerActive}
              timer1TimeLeft={timer1TimeLeft}
              timer1Active={timer1Active}
              timer2TimeLeft={timer2TimeLeft}
              timer2Active={timer2Active}
              onReadyToPlay={() => handleVideoReady(index)}
              onVideoError={() => handleVideoError(index)}
              // 🔥 FIXED: Pass WebSocket props to VideoPlayer
              websocketConnected={isConnected}
              lastSyncCommand={null} // We handle sync via events, not props
            />
          </div>
        ))}
      </div>

      {/* TV-Optimized Global Controls */}
      <div className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
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
      <div className={`absolute bottom-6 left-8 text-white transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-lg text-gray-300 font-medium">
          Press ESC to exit • Move mouse to show controls 
        </p>
      </div>
    </div>
  );
};

export default FullscreenView;