import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';

const VideoPlayer = forwardRef(({ src, index, isFullscreen = false }, ref) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

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

  return (
    <div
      className={`relative bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700 transition-all ${isFullscreen ? 'h-full' : 'aspect-video'
        }`}
      onMouseMove={handleMouseMove}
    >
      {(src && (typeof src === 'string' ? src.trim() : src?.url)) ? (
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
          />

          {src.name && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded shadow-sm">
              {src.name}
            </div>
          )}

          <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${showControls || !isFullscreen ? 'opacity-100' : 'opacity-0'
            }`}>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size={isFullscreen ? "lg" : "sm"}
                onClick={togglePlay}
                className={`${isFullscreen ? 'h-12 w-12' : 'h-8 w-8'} p-0 bg-black/50 hover:bg-black/70`}
              >
                {isPlaying ? (
                  <Pause className={isFullscreen ? 'h-6 w-6' : 'h-4 w-4'} />
                ) : (
                  <Play className={isFullscreen ? 'h-6 w-6' : 'h-4 w-4'} />
                )}
              </Button>
              <Button
                variant="secondary"
                size={isFullscreen ? "lg" : "sm"}
                onClick={toggleMute}
                className={`${isFullscreen ? 'h-12 w-12' : 'h-8 w-8'} p-0 bg-black/50 hover:bg-black/70`}
              >
                {isMuted ? (
                  <VolumeX className={isFullscreen ? 'h-6 w-6' : 'h-4 w-4'} />
                ) : (
                  <Volume2 className={isFullscreen ? 'h-6 w-6' : 'h-4 w-4'} />
                )}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">
          <div className="text-center">
            <div className={`${isFullscreen ? 'text-4xl mb-4' : 'text-2xl mb-2'}`}>📺</div>
            <p className={isFullscreen ? 'text-xl' : 'text-sm'}>Player {index + 1}</p>
            <p className={`${isFullscreen ? 'text-lg' : 'text-xs'} text-gray-500`}>No video assigned</p>
          </div>
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
