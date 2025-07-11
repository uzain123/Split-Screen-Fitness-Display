import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import VideoPlayer from './VideoPlayer';
import GlobalControls from './GlobalControls';

const FullscreenView = ({ assignments, onClose }) => {
  const [showControls, setShowControls] = useState(true);
  const [isAllPlaying, setIsAllPlaying] = useState(false);
  const [isAllMuted, setIsAllMuted] = useState(false);
  const videoRefs = useRef([]);
  const cursorTimeoutRef = useRef();

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleMouseMove = () => {
      setShowControls(true);
      document.body.style.cursor = 'default';

      // Clear existing timeout
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current);
      }

      // Set new timeout to hide controls and cursor
      cursorTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        document.body.style.cursor = 'none';
      }, 3000);
    };

    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('mousemove', handleMouseMove);

    // Initial cursor timeout
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
    videoRefs.current.forEach(ref => {
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
    videoRefs.current.forEach(ref => {
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
      {/* Exit button and global controls */}
      <div className={`absolute top-4 right-4 z-10 transition-opacity duration-300 flex items-center gap-4 ${showControls ? 'opacity-100' : 'opacity-0'
        }`}>
        <GlobalControls
          isAllPlaying={isAllPlaying}
          isAllMuted={isAllMuted}
          onPlayPauseAll={handlePlayPauseAll}
          onMuteUnmuteAll={handleMuteUnmuteAll}
          isFullscreen={true}
        />
        <Button
          variant="secondary"
          size="lg"
          onClick={onClose}
          className="h-12 w-12 p-0 bg-black/50 hover:bg-black/70"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Video grid optimized for large screens */}
      <div className="flex-1 p-4 grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(assignments.length))}, 1fr)`,
          gridTemplateRows: `repeat(${Math.ceil(assignments.length / Math.ceil(Math.sqrt(assignments.length)))}, 1fr)`,
          display: 'grid',
          height: '100%',
          minHeight: 0,
        }}>
        {assignments.map((assignment, index) => (
          <div key={index} className="w-full h-full overflow-hidden">
            <VideoPlayer
              ref={(el) => (videoRefs.current[index] = el)}
              src={assignment}
              index={index}
              isFullscreen={true}
            />
          </div>
        ))}
      </div>


      {/* Instructions overlay */}
      <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
        }`}>
        <p className="text-lg mb-2">TV Mode Active</p>
        <p className="text-sm text-gray-300">Press ESC to exit • Move mouse to show controls</p>
      </div>
    </div>
  );
};

export default FullscreenView;
