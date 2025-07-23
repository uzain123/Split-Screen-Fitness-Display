import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import VideoPlayer from './VideoPlayer';
import GlobalControls from './GlobalControls';
import Image from 'next/image';

const FullscreenView = ({ assignments, onClose }) => {
  const [showControls, setShowControls] = useState(true);
  const [isAllPlaying, setIsAllPlaying] = useState(false);
  const [isAllMuted, setIsAllMuted] = useState(false);
  const [videosReady, setVideosReady] = useState(Array(assignments.length).fill(false));
  const videoRefs = useRef([]);
  const cursorTimeoutRef = useRef();

  const allVideosReady = assignments.every((video, i) => !video || videosReady[i]);
  const loadingProgress = (videosReady.filter(Boolean).length / assignments.length) * 100;

  const handleVideoReady = (index) => {
    setVideosReady((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

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
    setIsAllPlaying(!isAllPlaying);
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
      {/* Loading Overlay */}
      {!allVideosReady && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
          <div className="text-white text-lg mb-4">⚙️ Loading videos...</div>
          <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Top Header Bar */}

      <div className="relative h-16 bg-black border-b border-gray-800 flex items-center justify-between px-6">
        {/* Left - Fitness Display Text */}
        <div className="flex-1 flex items-center">
          <h1 className="text-white text-xl font-semibold tracking-wide">FITNESS DISPLAY</h1>
        </div>

        <div className="flex-1 flex justify-center items-center">
          <Image
            src="/logo.jpeg"
            alt="Logo"
            width={120}
            height={60}
            className="object-contain"
            priority
          />
        </div>

        {/* Right - Global Controls and Exit */}
        <div className="flex-1 flex items-center justify-end gap-4">
          <GlobalControls
            isAllPlaying={isAllPlaying}
            isAllMuted={isAllMuted}
            onPlayPauseAll={handlePlayPauseAll}
            onMuteUnmuteAll={handleMuteUnmuteAll}
            isFullscreen={true}
            assignments={assignments}
          />

          <Button
            variant="secondary"
            size="lg"
            onClick={onClose}
            className="h-12 w-12 p-0 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 hover:border-red-500/60 transition-all duration-200"
          >
            <X className="h-6 w-6 text-red-400" />
          </Button>
        </div>
      </div>

      {/* Video grid - more compact with less gaps */}
      <div className="flex-1 p-2 grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(assignments.length))}, 1fr)`,
          gridTemplateRows: `repeat(${Math.ceil(assignments.length / Math.ceil(Math.sqrt(assignments.length)))}, 1fr)`,
          display: 'grid',
          height: 'calc(100% - 4rem)', // Account for header height
          minHeight: 0,
        }}>
        {assignments.map((assignment, index) => (
          <div key={index} className="w-full h-full overflow-hidden">
            <VideoPlayer
              ref={(el) => (videoRefs.current[index] = el)}
              src={assignment}
              index={index}
              isFullscreen={true}
              timerDuration={assignment?.timer}
              onReadyToPlay={() => handleVideoReady(index)}
            />
          </div>
        ))}
      </div>

      {/* Instructions overlay - moved to bottom left */}
      <div className={`absolute bottom-4 left-6 text-white transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-sm text-gray-300">Press ESC to exit • Move mouse to show controls</p>
      </div>
    </div>
  );
};

export default FullscreenView;