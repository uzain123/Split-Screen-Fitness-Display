import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX, Clock, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';

const VideoPlayer = forwardRef(({ src, index, isFullscreen = false, onReadyToPlay = () => { } }, ref) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const timerDuration = typeof src?.timerDuration === 'number' ? src.timerDuration : 30;
  const delayDuration = typeof src?.delayDuration === 'number' ? src.delayDuration : 3; // ✅ customizable delay
  const delayText = src?.delayText || 'Restarting Video'; // ✅ customizable text
  
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [expired, setExpired] = useState(false);
  const [delaying, setDelaying] = useState(false);
  const [delayProgress, setDelayProgress] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isPlaying || delaying) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setExpired(true);
          setDelaying(true);
          videoRef.current?.pause();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isPlaying, delaying]);

  useEffect(() => {
    if (!delaying) return;

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 100 / (delayDuration * 10); // ✅ dynamic progress based on delay duration
      setDelayProgress(Math.min(progress, 100));
    }, 100);

    const delayTimeout = setTimeout(() => {
      setExpired(false);
      setDelaying(false);
      setDelayProgress(0);
      setTimeLeft(timerDuration);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    }, delayDuration * 1000); // ✅ use custom delay duration

    return () => {
      clearTimeout(delayTimeout);
      clearInterval(progressInterval);
    };
  }, [delaying, timerDuration, delayDuration]);

  useImperativeHandle(ref, () => ({
    play: () => {
      if (videoRef.current && src) {
        videoRef.current.play();
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

  useEffect(() => {
    let timeout;
    if (showControls && isFullscreen) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, isFullscreen]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleMouseMove = () => {
    if (isFullscreen) {
      setShowControls(true);
    }
  };

  const handleCanPlayThrough = () => {
    onReadyToPlay(index);
  };

  const validSrc = src && (typeof src === 'string' ? src.trim() : src?.url);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (expired) return 'from-red-500 to-red-600';
    if (timeLeft <= 15) return 'from-orange-500 to-orange-600';
    return 'from-green-500 to-green-600';
  };

  return (
    <div
      className={`relative bg-gray-900 overflow-hidden border border-gray-700 transition-all shadow-lg ${
        isFullscreen ? 'h-full' : 'aspect-video rounded-xl'
      }`}
      onMouseMove={handleMouseMove}
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
            preload="auto"
            playsInline
            onCanPlayThrough={handleCanPlayThrough}
          />

          {/* Video Name Badge */}
          {src.name && (
            <div className="absolute bottom-4 right-4 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg border border-gray-600/50">
              <div className="text-sm font-medium">{src.name}</div>
            </div>
          )}

          {/* Enhanced Timer Display - Top Center */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className={`bg-gradient-to-r ${getTimerColor()} p-0.5 rounded-xl shadow-lg`}>
              <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center gap-3">
                <Clock className={`${isFullscreen ? 'h-6 w-6' : 'h-4 w-4'} text-white`} />
                <span className={`text-white font-mono ${isFullscreen ? 'text-lg' : 'text-sm'} font-semibold`}>
                  {expired ? 'EXPIRED' : formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Delay Overlay with Custom Text and Duration */}
          {delaying && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 border-4 border-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RotateCcw className="h-8 w-8 text-white animate-spin" />
                  </div>
                  <div className="w-32 h-2 bg-gray-700 rounded-full mx-auto overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-100"
                      style={{ width: `${delayProgress}%` }}
                    />
                  </div>
                </div>
                <div className="text-white text-xl font-semibold mb-2">{delayText}</div>
                <div className="text-gray-300 text-sm">
                  Please wait {delayDuration} second{delayDuration !== 1 ? 's' : ''}...
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Controls */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showControls || !isFullscreen ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size={isFullscreen ? "lg" : "sm"}
                onClick={togglePlay}
                className={`${isFullscreen ? 'h-14 w-14' : 'h-10 w-10'} p-0 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-105`}
              >
                {isPlaying ? (
                  <Pause className={`${isFullscreen ? 'h-7 w-7' : 'h-5 w-5'} text-white`} />
                ) : (
                  <Play className={`${isFullscreen ? 'h-7 w-7' : 'h-5 w-5'} text-white`} />
                )}
              </Button>
              <Button
                variant="secondary"
                size={isFullscreen ? "lg" : "sm"}
                onClick={toggleMute}
                className={`${isFullscreen ? 'h-14 w-14' : 'h-10 w-10'} p-0 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-105`}
              >
                {isMuted ? (
                  <VolumeX className={`${isFullscreen ? 'h-7 w-7' : 'h-5 w-5'} text-white`} />
                ) : (
                  <Volume2 className={`${isFullscreen ? 'h-7 w-7' : 'h-5 w-5'} text-white`} />
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center p-8">
            <div className="mb-4 p-6 bg-gray-700/50 rounded-full w-fit mx-auto">
              <div className={`${isFullscreen ? 'text-6xl' : 'text-4xl'}`}>📺</div>
            </div>
            <p className={`${isFullscreen ? 'text-2xl' : 'text-lg'} font-semibold text-gray-300 mb-2`}>
              Player {index + 1}
            </p>
            <p className={`${isFullscreen ? 'text-lg' : 'text-sm'} text-gray-500`}>
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