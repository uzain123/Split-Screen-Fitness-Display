import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX, Clock, RotateCw } from 'lucide-react';
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
  onReadyToPlay = () => { } 
}, ref) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

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

  // Optimized video loading handlers
  const handleVideoLoad = () => {
    if (!readyCallbackRef.current && videoRef.current) {
      setVideoLoaded(true);
      setVideoError(false);
      readyCallbackRef.current = true;
      onReadyToPlay(index);
    }
  };

  const handleVideoError = (e) => {
    console.error(`Video ${index} load error:`, e);
    setVideoError(true);
    if (!readyCallbackRef.current) {
      readyCallbackRef.current = true;
      onReadyToPlay(index);
    }
  };

  // Global timer effect - pauses video when global timer reaches 0
  useEffect(() => {
    if (globalTimer3 === 0 && isPlaying && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [globalTimer3, isPlaying]);

  // Optimized timer logic
  useEffect(() => {
    if (!isPlaying || delaying || !videoLoaded) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setExpired(true);
          setDelaying(true);
          if (videoRef.current) {
            videoRef.current.pause();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, delaying, videoLoaded]);

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
      }
    }, delayDuration * 1000);

    return () => {
      clearTimeout(delayTimeout);
      clearInterval(progressInterval);
    };
  }, [delaying, timerDuration, delayDuration, videoError]);

  useImperativeHandle(ref, () => ({
    play: () => {
      if (videoRef.current && src && globalTimer3 > 0 && videoLoaded && !videoError) {
        videoRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    },
    pause: () => {
      if (videoRef.current && src) {
        videoRef.current.pause();
        setIsPlaying(false);
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
    isMuted
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
      className={`relative bg-gray-900 overflow-hidden border border-gray-700 transition-all shadow-lg ${
        isFullscreen ? 'h-full' : 'aspect-video rounded-xl'
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
            onError={handleVideoError}
            style={{
              willChange: 'transform',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)'
            }}
          />

          {/* TV-Optimized Video Name Badge - Shorter */}
          {src.name && (
            <div className="absolute bottom-4 right-4 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg border border-gray-600/50"> {/* Reduced padding */}
              <div className="text-lg font-semibold truncate max-w-48">{src.name}</div> {/* Reduced font size and added truncation */}
            </div>
          )}

          {/* Timer Display - Only Timer 2 on middle top video - TV Optimized with better positioning */}
          {isFullscreen && src && isMiddleTop && timer2TimeLeft !== undefined && (
            <div className="absolute top-4 right-4 z-10">
              <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2 border border-white/20"> {/* Reduced background opacity and padding */}
                <CircularTimerOverlay
                  timeLeft={timer2TimeLeft}
                  totalTime={src.timerDuration || 60}
                  isActive={timer2Active}
                  isPlaying={isPlaying}
                  label="Timer 2"
                  size="sm" // Changed to smaller size
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