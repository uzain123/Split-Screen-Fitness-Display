import React, { useEffect, useState, useRef } from 'react';
import { X, Timer, Clock } from 'lucide-react';
import { Button } from './ui/button';
import VideoPlayer from './VideoPlayer';
import GlobalControls from './GlobalControls';
import Image from 'next/image';

// Circular Timer Component
const CircularTimer = ({ timeLeft, totalTime, isActive, isPlaying, label, inDelay = false, delayText = "" }) => {
  const percentage = (timeLeft / totalTime) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on time remaining and state
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

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-20 h-20">
        {/* Background circle */}
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={getColor()}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
        </svg>
        {/* Timer number in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white text-lg font-mono font-bold">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

    </div>
  );
};

const FullscreenView = ({ assignments, onClose, globalTimer3, globalTimers }) => {
  const [showControls, setShowControls] = useState(true);
  const [isAllPlaying, setIsAllPlaying] = useState(false);
  const [isAllMuted, setIsAllMuted] = useState(false);
  const [videosReady, setVideosReady] = useState(Array(assignments.length).fill(false));
  const videoRefs = useRef([]);
  const cursorTimeoutRef = useRef();
  // Add this useEffect in FullscreenView component
  useEffect(() => {
    // Auto-start timers when entering fullscreen and videos are playing
    if (isAllPlaying) {
      setGlobalTimerActive(true);
      setTimer1Active(true);
      setTimer2Active(true);
    }
  }, [isAllPlaying]);

  // Global Timer 3 state
  const [globalTimeLeft, setGlobalTimeLeft] = useState(globalTimer3 || 2700);
  const [globalTimerActive, setGlobalTimerActive] = useState(false);
  const globalTimerRef = useRef(null);

  // Timer 1 state - Get values from first non-middle-top assignment
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

  // Timer 2 state - Get values from middle top assignment (index 1)
  const getTimer2Values = () => {
    const timer2Assignment = assignments[1]; // Middle top is always index 1

    return {
      duration: timer2Assignment?.timerDuration || globalTimers?.timer2 || 60,
      delay: 0, // Timer 2 has no delay
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

  const allVideosReady = assignments.every((video, i) => !video || videosReady[i]);
  const loadingProgress = (videosReady.filter(Boolean).length / assignments.length) * 100;

  const handleVideoReady = (index) => {
    setVideosReady((prev) => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

  // Timer 1 Main Timer Logic
  useEffect(() => {
    if (!timer1Active || !isAllPlaying || timer1InDelay) {
      if (timer1Ref.current) {
        clearInterval(timer1Ref.current);
      }
      return;
    }

    timer1Ref.current = setInterval(() => {
      setTimer1TimeLeft(prev => {
        if (prev <= 1) {
          setTimer1InDelay(true);
          setTimer1DelayTimeLeft(timer1Values.delay);
          clearInterval(timer1Ref.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timer1Ref.current) {
        clearInterval(timer1Ref.current);
      }
    };
  }, [timer1Active, isAllPlaying, timer1InDelay, timer1Values.delay]);

  // Timer 1 Delay Logic
  useEffect(() => {
    if (!timer1InDelay || !isAllPlaying) {
      if (timer1DelayRef.current) {
        clearInterval(timer1DelayRef.current);
      }
      return;
    }

    timer1DelayRef.current = setInterval(() => {
      setTimer1DelayTimeLeft(prev => {
        if (prev <= 1) {
          setTimer1InDelay(false);
          setTimer1TimeLeft(timer1Values.duration);
          clearInterval(timer1DelayRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timer1DelayRef.current) {
        clearInterval(timer1DelayRef.current);
      }
    };
  }, [timer1InDelay, isAllPlaying, timer1Values.duration]);

  // Timer 2 Logic (for middle top video)
  useEffect(() => {
    if (!timer2Active || !isAllPlaying) {
      if (timer2Ref.current) {
        clearInterval(timer2Ref.current);
      }
      return;
    }

    timer2Ref.current = setInterval(() => {
      setTimer2TimeLeft(prev => {
        if (prev <= 1) {
          // Timer 2 restarts immediately (no delay)
          setTimer2TimeLeft(timer2Values.duration);
          return timer2Values.duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timer2Ref.current) {
        clearInterval(timer2Ref.current);
      }
    };
  }, [timer2Active, isAllPlaying, timer2Values.duration]);

  // Global Timer 3 logic
  useEffect(() => {
    if (!globalTimerActive || !isAllPlaying) {
      if (globalTimerRef.current) {
        clearInterval(globalTimerRef.current);
      }
      return;
    }

    globalTimerRef.current = setInterval(() => {
      setGlobalTimeLeft(prev => {
        if (prev <= 1) {
          videoRefs.current.forEach((ref) => {
            if (ref) {
              ref.pause();
            }
          });
          setIsAllPlaying(false);
          setGlobalTimerActive(false);
          setTimer1Active(false);
          setTimer2Active(false);
          setTimer1InDelay(false);
          clearInterval(globalTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (globalTimerRef.current) {
        clearInterval(globalTimerRef.current);
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

    if (newPlayingState) {
      setGlobalTimerActive(true);
      setTimer1Active(true);
      setTimer2Active(true);
    } else {
      setGlobalTimerActive(false);
      setTimer1Active(false);
      setTimer2Active(false);
      setTimer1InDelay(false);
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

      <div className="relative h-28 bg-black border-b border-gray-800 flex items-center justify-between px-12">
        {/* Left - Timer 1 Display */}
        <div className="flex-1 flex items-center pl-4 ">
          <div className="scale-125 transform">
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

        {/* Center - Logo */}
        <div className="flex-1 flex justify-center items-center px-8">
          <Image
            src="/logo.jpeg"
            alt="Logo"
            width={160}
            height={80}
            className="object-contain"
            priority
          />
        </div>

        {/* Right - Global Timer 3 and Exit */}
        <div className="flex-1 flex items-center justify-end gap-6 pr-4">
          <div className="scale-125 transform">
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
            className="h-12 w-12 p-0 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 hover:border-red-500/60 transition-all duration-200 ml-4"
          >
            <X className="h-6 w-6 text-red-400" />
          </Button>
        </div>
      </div>

      {/* Video grid */}
      <div className="flex-1 p-2 grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(assignments.length))}, 1fr)`,
          gridTemplateRows: `repeat(${Math.ceil(assignments.length / Math.ceil(Math.sqrt(assignments.length)))}, 1fr)`,
          display: 'grid',
          height: 'calc(100% - 5rem)', // Account for header height
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
              timer2TimeLeft={timer2TimeLeft} // Pass Timer 2 to VideoPlayer
              timer2Active={timer2Active}
              onReadyToPlay={() => handleVideoReady(index)}
            />
          </div>
        ))}
      </div>

      {/* Global Controls - Floating at bottom center */}
      <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-3 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-600/50">
          <Button
            variant="secondary"
            size="lg"
            onClick={handlePlayPauseAll}
            className="h-12 w-12 p-0 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200"
          >
            {isAllPlaying ? (
              <div className="w-3 h-3 bg-white rounded-sm"></div>
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

      {/* Instructions overlay */}
      <div className={`absolute bottom-4 left-6 text-white transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-sm text-gray-300">Press ESC to exit • Move mouse to show controls</p>
      </div>
    </div>
  );
};

export default FullscreenView;