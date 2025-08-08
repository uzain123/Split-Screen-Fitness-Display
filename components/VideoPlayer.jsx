import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX, Clock, RotateCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from './ui/button';

// TV-Optimized Circular Timer Component for VideoPlayer
const CircularTimerOverlay = ({ timeLeft, totalTime, isActive, isPlaying, label, inDelay = false, delayText = "", size = "md" }) => {
  const percentage = (timeLeft / totalTime) * 100;
  // Increased sizes for TV visibility
  const radius = size === "sm" ? 50 : size === "lg" ? 80 : 65;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Memoized color calculation
  const getColor = () => {
    if (inDelay) return '#3B82F6'; // Blue during delay
    if (timeLeft <= 20) return '#EF4444'; // Red when < 20 seconds
    return '#10B981'; // Green otherwise
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const svgSize = radius * 2 + 20;
  // Larger font sizes for TV
  const fontSize = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-xl";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg className="transform -rotate-90" viewBox={`0 0 ${svgSize} ${svgSize}`} width={svgSize} height={svgSize}>
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-white font-mono font-bold ${fontSize}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm text-white/70 uppercase tracking-wide font-semibold">
          {inDelay ? delayText : `${label} ${isActive && isPlaying ? '(Active)' : '(Paused)'}`}
        </div>
      </div>
    </div>
  );
};

const VideoPlayer = forwardRef(({
  src,
  index,
  isFullscreen = false,
  globalTimer3,
  globalTimerActive,
  timer1TimeLeft,
  timer1Active,
  timer2TimeLeft,
  timer2Active,
  onReadyToPlay = () => { },
  onVideoError = () => { },
  // WebSocket props
  websocketConnected = false,
  lastSyncCommand = null,
  onSyncPlay = null,
  onSyncPause = null
}, ref) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showSyncIndicator, setShowSyncIndicator] = useState(false);

  const timerDuration = typeof src?.timerDuration === 'number' ? src.timerDuration : 60;
  const delayDuration = typeof src?.delayDuration === 'number' ? src.delayDuration : 30;
  const delayText = src?.delayText || 'Restarting Video';

  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [expired, setExpired] = useState(false);
  const [delaying, setDelaying] = useState(false);
  const [delayProgress, setDelayProgress] = useState(0);
  const timerRef = useRef(null);
  const readyCallbackRef = useRef(false);

  // Check if this is the middle top video (Timer 2)
  const isMiddleTop = index === 1;

  // Helper function to get screen ID from URL
  const getScreenIdFromURL = () => {
    // Extract screen ID from current URL or use a default pattern
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const screenIdPart = pathParts[pathParts.length - 1];
      return screenIdPart || `screen-${index + 1}`;
    }
    return `screen-${index + 1}`;
  };

  // 🔥 FIXED: Helper function to start the internal timer
  const startInternalTimer = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Reset timer state
    setTimeLeft(timerDuration);
    setExpired(false);
    setDelaying(false);

    console.log(`🕐 Starting internal timer for video ${index} (${timerDuration}s)`);
  };

  // 🔥 FIXED: Helper function to stop the internal timer
  const stopInternalTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    console.log(`⏹️ Stopped internal timer for video ${index}`);
  };

  // WebSocket sync event listeners
  useEffect(() => {
    const handleSyncPlay = (event) => {
      const { targetScreens, timestamp } = event.detail;

      // Check if this screen should respond to the sync command
      const screenId = getScreenIdFromURL();
      if (targetScreens.includes(screenId)) {
        console.log('🎬 VideoPlayer responding to sync play');
        if (videoRef.current) {
          videoRef.current.currentTime = 0; // Reset to beginning
          videoRef.current.play();
          setIsPlaying(true); // This will trigger the timer via useEffect
          
          // 🔥 FIXED: Explicitly start the internal timer
          startInternalTimer();

          // Show sync indicator
          setShowSyncIndicator(true);
          setTimeout(() => setShowSyncIndicator(false), 2000);
        }
      }
    };

    const handleSyncPause = (event) => {
      const { targetScreens, timestamp } = event.detail;

      const screenId = getScreenIdFromURL();
      if (targetScreens.includes(screenId)) {
        console.log('⏸️ VideoPlayer responding to sync pause');
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);

          // 🔥 FIXED: Stop the internal timer when pausing via WebSocket
          stopInternalTimer();

          // Show sync indicator
          setShowSyncIndicator(true);
          setTimeout(() => setShowSyncIndicator(false), 2000);
        }
      }
    };

    window.addEventListener('websocket-sync-play', handleSyncPlay);
    window.addEventListener('websocket-sync-pause', handleSyncPause);

    return () => {
      window.removeEventListener('websocket-sync-play', handleSyncPlay);
      window.removeEventListener('websocket-sync-pause', handleSyncPause);
    };
  }, [index, timerDuration]);

  // WebSocket sync play handler
  const handleWebSocketPlay = async () => {
    if (!videoRef.current || !videoLoaded || videoError) return;

    try {
      // Reset video to beginning for synchronized start
      videoRef.current.currentTime = 0;
      await videoRef.current.play();
      setIsPlaying(true);
      
      // 🔥 FIXED: Start the internal timer
      startInternalTimer();
      
      setShowSyncIndicator(true);
      setTimeout(() => setShowSyncIndicator(false), 2000);
      console.log(`✅ Video ${index} synced play via WebSocket with timer started`);
    } catch (error) {
      console.error(`❌ WebSocket play failed on video ${index}:`, error);
    }
  };

  // WebSocket sync pause handler
  const handleWebSocketPause = async () => {
    if (!videoRef.current) return;

    try {
      videoRef.current.pause();
      setIsPlaying(false);
      
      // 🔥 FIXED: Stop the internal timer
      stopInternalTimer();
      
      setShowSyncIndicator(true);
      setTimeout(() => setShowSyncIndicator(false), 2000);
      console.log(`✅ Video ${index} synced pause via WebSocket with timer stopped`);
    } catch (error) {
      console.error(`❌ WebSocket pause failed on video ${index}:`, error);
    }
  };

  // Handle WebSocket sync commands
  useEffect(() => {
    if (!lastSyncCommand) return;

    const handleSyncCommand = async () => {
      if (lastSyncCommand.action === 'play') {
        await handleWebSocketPlay();
      } else if (lastSyncCommand.action === 'pause') {
        await handleWebSocketPause();
      }
    };

    handleSyncCommand();
  }, [lastSyncCommand]);

  // Optimized video loading handlers
  const handleVideoLoad = () => {
    if (!readyCallbackRef.current && videoRef.current) {
      setVideoLoaded(true);
      setVideoError(false);
      readyCallbackRef.current = true;
      onReadyToPlay(index);
    }
  };

  const handleVideoErrorEvent = (e) => {
    console.error(`Video ${index} load error:`, e);
    setVideoError(true);
    if (!readyCallbackRef.current) {
      readyCallbackRef.current = true;
      onVideoError(index);
    }
  };

  // Global timer effect - pauses video when global timer reaches 0
  useEffect(() => {
    if (globalTimer3 === 0 && isPlaying && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      // 🔥 FIXED: Stop internal timer when global timer expires
      stopInternalTimer();
    }
  }, [globalTimer3, isPlaying]);

  // 🔥 FIXED: Enhanced timer logic with better state management
  useEffect(() => {
    // Don't start timer if video is not playing, delaying, or not loaded
    if (!isPlaying || delaying || !videoLoaded) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Only start the interval if we don't already have one running
    if (!timerRef.current) {
      console.log(`🕐 Starting timer interval for video ${index}`);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setExpired(true);
            setDelaying(true);
            if (videoRef.current) {
              videoRef.current.pause();
              setIsPlaying(false);
            }
            console.log(`⏰ Timer expired for video ${index}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, delaying, videoLoaded, index]);

  // Optimized delay logic
  useEffect(() => {
    if (!delaying) return;

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 100 / (delayDuration * 10);
      setDelayProgress(Math.min(progress, 100));
    }, 100);

    const delayTimeout = setTimeout(() => {
      setExpired(false);
      setDelaying(false);
      setDelayProgress(0);
      setTimeLeft(timerDuration);
      if (videoRef.current && !videoError) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(console.error);
        // Timer will start automatically via the isPlaying useEffect
      }
      console.log(`🔄 Video ${index} restarted after delay`);
    }, delayDuration * 1000);

    return () => {
      clearTimeout(delayTimeout);
      clearInterval(progressInterval);
    };
  }, [delaying, timerDuration, delayDuration, videoError, index]);

  useImperativeHandle(ref, () => ({
    play: () => {
      if (videoRef.current && src && globalTimer3 > 0 && videoLoaded && !videoError) {
        videoRef.current.play().catch(console.error);
        setIsPlaying(true);
        // Timer will start via useEffect
      }
    },
    pause: () => {
      if (videoRef.current && src) {
        videoRef.current.pause();
        setIsPlaying(false);
        // Timer will stop via useEffect
      }
    },
    startTimer: (seconds) => {
      setTimeLeft(seconds);
      setExpired(false);
    },
    mute: () => {
      if (videoRef.current && src) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    },
    unmute: () => {
      if (videoRef.current && src) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    },
    isPlaying,
    isMuted,
    // WebSocket sync methods
    syncPlay: handleWebSocketPlay,
    syncPause: handleWebSocketPause
  }));

  // Optimized control visibility for fullscreen
  useEffect(() => {
    let timeout;
    if (showControls && isFullscreen) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [showControls, isFullscreen]);

  const togglePlay = () => {
    if (videoRef.current && globalTimer3 > 0 && videoLoaded && !videoError) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current && videoLoaded) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleMouseMove = () => {
    if (isFullscreen) {
      setShowControls(true);
    }
  };

  const validSrc = src && (typeof src === 'string' ? src.trim() : src?.url);

  return (
    <div
      className={`relative bg-gray-900 overflow-hidden border border-gray-700 transition-all shadow-lg ${isFullscreen ? 'h-full' : 'aspect-video rounded-xl'
        }`}
      onMouseMove={handleMouseMove}
      style={{
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    >
      {validSrc ? (
        <>
          <video
            ref={videoRef}
            src={typeof src === 'string' ? src : src?.url}
            className="w-full h-full object-cover"
            loop
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            preload="metadata"
            playsInline
            onCanPlayThrough={handleVideoLoad}
            onLoadedData={handleVideoLoad}
            onLoadedMetadata={handleVideoLoad}
            onError={handleVideoErrorEvent}
            style={{
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
          />



          {/* WebSocket Sync Command Indicator */}
          {(lastSyncCommand || showSyncIndicator) && isFullscreen && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 bg-blue-600/90 backdrop-blur-sm rounded-lg px-6 py-4 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-3 text-white">
                {(lastSyncCommand?.action === 'play' || showSyncIndicator) ? (
                  <Play className="h-8 w-8" />
                ) : (
                  <Pause className="h-8 w-8" />
                )}
                <div>
                  <div className="font-semibold">WebSocket Sync</div>
                  <div className="text-sm opacity-90">
                    {(lastSyncCommand?.action === 'play' || showSyncIndicator) ? 'Playing All' : 'Paused All'}
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* TV-Optimized Video Name Badge - Shorter */}
          {src.name && (
            <div className="absolute bottom-4 right-4 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg border border-gray-600/50">
              <div className="text-lg font-semibold truncate max-w-48">{src.name}</div>
            </div>
          )}

          {/* Timer Display - Only Timer 2 on middle top video - TV Optimized with better positioning */}
          {isFullscreen && src && isMiddleTop && timer2TimeLeft !== undefined && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                <CircularTimerOverlay
                  timeLeft={timer2TimeLeft}
                  totalTime={src.timerDuration || 60}
                  isActive={timer2Active}
                  isPlaying={isPlaying}
                  label="Timer 2"
                  size="sm"
                />
              </div>
            </div>
          )}

          {/* TV-Optimized Global Timer Overlay - Shows when global timer is low */}
          {isFullscreen && globalTimer3 <= 30 && globalTimer3 > 0 && (
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-gradient-to-r from-red-500/90 to-red-600/90 p-1 rounded-2xl shadow-lg animate-pulse">
                <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl px-8 py-4 flex items-center gap-3">
                  <Clock className="h-8 w-8 text-red-300" />
                  <span className="text-red-300 text-2xl font-bold">
                    Global: {Math.floor(globalTimer3 / 60)}:{(globalTimer3 % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TV-Optimized Enhanced Delay Overlay */}
          {delaying && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="text-center">
                <div className="relative mb-8">
                  <div className="w-32 h-32 border-8 border-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RotateCw className="h-16 w-16 text-white animate-spin" />
                  </div>
                  <div className="w-64 h-4 bg-gray-700 rounded-full mx-auto overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-100"
                      style={{ width: `${delayProgress}%` }}
                    />
                  </div>
                </div>
                <div className="text-white text-4xl font-bold mb-4">{delayText}</div>
                <div className="text-gray-300 text-xl">
                  Please wait {delayDuration} second{delayDuration !== 1 ? 's' : ''}...
                </div>
              </div>
            </div>
          )}

          {/* TV-Optimized Video Error Overlay */}
          {videoError && (
            <div className="absolute inset-0 bg-red-900/80 backdrop-blur-sm z-30 flex items-center justify-center">
              <div className="text-center">
                <div className="text-white text-6xl font-bold mb-4">⚠️ VIDEO ERROR</div>
                <div className="text-red-200 text-3xl">Failed to load video</div>
              </div>
            </div>
          )}

          {/* TV-Optimized Global Timer Expired Overlay */}
          {globalTimer3 === 0 && (
            <div className="absolute inset-0 bg-red-900/80 backdrop-blur-sm z-30 flex items-center justify-center">
              <div className="text-center">
                <div className="text-white text-6xl font-bold mb-4">⏰ TIME'S UP!</div>
                <div className="text-red-200 text-3xl">Global timer has expired</div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center p-12">
            <div className="mb-6 p-8 bg-gray-700/50 rounded-full w-fit mx-auto">
              <div className={`${isFullscreen ? 'text-8xl' : 'text-4xl'}`}>📺</div>
            </div>
            <p className={`${isFullscreen ? 'text-4xl' : 'text-lg'} font-bold text-gray-300 mb-4`}>
              Player {index + 1}
            </p>
            <p className={`${isFullscreen ? 'text-2xl' : 'text-sm'} text-gray-500`}>
              No video assigned
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;