'use client';
import { loadConfig, saveConfig } from '@/lib/config';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import { Maximize, Monitor, Settings } from 'lucide-react';
import VideoPlayer from '../../../components/VideoPlayer';
import ControlPanel from '../../../components/ControlPanel';
import VideoUpload from '../../../components/VideoUpload';
import FullscreenView from '../../../components/FullscreenView';
import GlobalControls from '../../../components/GlobalControls';
import { useParams } from 'next/navigation';


export default function Home() {
  const { screenId } = useParams();
  const [videos, setVideos] = useState([]);
  const [assignments, setAssignments] = useState(Array(6).fill(null));
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isAllPlaying, setIsAllPlaying] = useState(false);
  const [isAllMuted, setIsAllMuted] = useState(false);
  const videoRefs = useRef([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, videosRes] = await Promise.all([
          fetch(`/api/configs/${screenId}`),
          fetch('/api/videos')
        ]);

        const configData = await configRes.json();
        const videoData = await videosRes.json();

        // ✅ Updated to include delayDuration and delayText from config
        setAssignments(
          Array(6)
            .fill(null)
            .map((_, i) => {
              const item = configData?.[i];
              if (!item || !item.url) return null;

              return {
                url: item.url,
                name: item.name || item.url.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Unnamed',
                timerDuration: item.timerDuration || 60,
                delayDuration: item.delayDuration || 30, // ✅ Load delay duration
                delayText: item.delayText || 'Move to the next station', // ✅ Load delay text
              };
            })
        );

        // ✅ Updated to include default delayDuration and delayText for videos from folder
        setVideos((videoData || []).map(v => {
          const url = typeof v === 'string' ? v : v?.url;
          if (!url) return null;
          return {
            url,
            name: url.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Unnamed',
            timerDuration: 60,
            delayDuration: 30, // ✅ Default delay duration
            delayText: 'Move to the next station', // ✅ Default delay text
          };
        }).filter(Boolean));

        // Check for ?fullscreen=true
        const urlParams = new URLSearchParams(window.location.search);
        const fullscreen = urlParams.get('fullscreen');
        if (fullscreen === 'true') {
          enterFullscreen();
        }

      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false); // Done loading
      }
    };

    fetchData();
  }, []);

  // ✅ Updated save config to include delayDuration and delayText
  useEffect(() => {
    const timeout = setTimeout(() => {
      const saveConfig = async () => {
        if (!assignments || assignments.length === 0 || assignments.every(item => item === null)) {
          console.warn('🛑 Prevented POST: Empty or uninitialized assignments.');
          return;
        }

        // ✅ Log the full assignments including delay properties
        console.log('✅ Saving config with delay settings:', assignments);

        try {
          const res = await fetch(`/api/configs/${screenId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assignments), // This now includes delayDuration and delayText
          });

          if (!res.ok) throw new Error('Failed to save config');
          console.log('✅ Config saved with delay settings.');
        } catch (err) {
          console.error('❌ Error saving config:', err);
        }
      };

      saveConfig();
    }, 500); // Wait 0.5 sec before saving

    return () => clearTimeout(timeout); // Cancel if changed too soon
  }, [assignments]);

  // ✅ Updated to include delayDuration and delayText when assigning videos
  const handleAssignVideo = (playerIndex, video) => {
    const newAssignments = [...assignments];
    newAssignments[playerIndex] = {
      url: video.url,
      name: video.name,
      timerDuration: video.timerDuration || 60,
      delayDuration: video.delayDuration || 30, // ✅ Include delay duration
      delayText: video.delayText || 'Move to the next station', // ✅ Include delay text
    };
    setAssignments(newAssignments);
  };

  const handleClearAll = () => {
    setAssignments(Array(assignments.length).fill(null));
  };

  const enterFullscreen = () => {
    // Reset all video states when entering fullscreen
    videoRefs.current.forEach(ref => {
      if (ref) {
        ref.pause();
      }
    });
    setIsAllPlaying(false);
    setIsAllMuted(false);
    setIsFullscreen(true);
  };

  const exitFullscreen = () => {
    // Reset all video states when exiting fullscreen
    videoRefs.current.forEach(ref => {
      if (ref) {
        ref.pause();
      }
    });
    setIsAllPlaying(false);
    setIsAllMuted(false);
    setIsFullscreen(false);
  };

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

  // ✅ Updated random assign to properly shuffle unique URLs while preserving all other settings
  const handleRandomAssign = () => {
    if (videos.length === 0) {
      console.warn('No videos available for random assignment');
      return;
    }

    let shuffledVideoUrls = [];

    if (videos.length >= assignments.length) {
      // Shuffle and pick unique videos for each slot
      const shuffled = [...videos].sort(() => 0.5 - Math.random());
      shuffledVideoUrls = shuffled.slice(0, assignments.length).map(v => v.url);
    } else {
      // Less videos than slots, allow repeats but still shuffle
      for (let i = 0; i < assignments.length; i++) {
        const randomVideo = videos[Math.floor(Math.random() * videos.length)];
        shuffledVideoUrls.push(randomVideo.url);
      }
    }

    const newAssignments = assignments.map((currentAssignment, index) => {
      // If there's no current assignment, create a new one with default values
      if (!currentAssignment) {
        return {
          url: shuffledVideoUrls[index],
          name: videos.find(v => v.url === shuffledVideoUrls[index])?.name || 'Unnamed',
          timerDuration: 30,
          delayDuration: 3,
          delayText: 'Move to the next station',
        };
      }

      // If there's an existing assignment, preserve all settings and only change the URL
      return {
        ...currentAssignment, // Preserve all existing properties
        url: shuffledVideoUrls[index],  // Only change the URL to the shuffled one
      };
    });

    setAssignments(newAssignments);
  };

  if (isFullscreen) {
    return (
      <FullscreenView
        assignments={assignments}
        onClose={exitFullscreen}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-lg font-medium">Loading your display...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold">Multi-Video Stream Dashboard</h1>
                <p className="text-sm text-gray-400">Professional video management for large displays</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowControls(!showControls)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                {showControls ? 'Hide Controls' : 'Show Controls'}
              </Button>
              <Button
                onClick={enterFullscreen}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Maximize className="h-4 w-4 mr-2" />
                TV Mode
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Video Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Video Display Grid
            </h2>
            <GlobalControls
              isAllPlaying={isAllPlaying}
              isAllMuted={isAllMuted}
              onPlayPauseAll={handlePlayPauseAll}
              onMuteUnmuteAll={handleMuteUnmuteAll}
              onRandomAssign={handleRandomAssign}
              isFullscreen={isFullscreen}
              assignments={assignments}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {assignments.map((assignment, index) => (
              <VideoPlayer
                key={index}
                ref={el => videoRefs.current[index] = el}
                src={assignment}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Controls Section */}
        {showControls && (
          <div className="space-y-6">
            <ControlPanel
              videos={videos}
              assignments={assignments}
              onAssignVideo={handleAssignVideo}
              setAssignments={setAssignments}
              onClearAll={handleClearAll}
            />

            {/* <VideoUpload
              videos={videos}
              onVideosChange={setVideos}
            /> */}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-blue-400">Getting Started</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">


            <div>
              <h4 className="font-medium mb-2">➕ Dynamic Displays:</h4>
              <p>Easily add or remove display screens with a single click. Each screen will appear in your video grid and can be configured individually.</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">🎮 Per-Screen Control:</h4>
              <p>Assign videos to specific screens from the library. You can also clear all assignments or reassign them randomly using the built-in tools.</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">🎛️ Global Controls:</h4>
              <p>Use the top control bar to <strong>Play/Pause</strong> or <strong>Mute/Unmute</strong> all videos at once. These controls affect all active players in real time.</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">📺 Fullscreen Display (TV Mode):</h4>
              <p>Launch any screen in fullscreen mode using <strong>"TV Mode"</strong>. This is optimized for public displays, gyms, and projection walls.</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">⏱️ Custom Timer & Delay Settings:</h4>
              <p>Each video can have its own timer duration, delay time, and custom delay message. Default values are 30s timer, 30s delay, with "Move to the next station" message.</p>
            </div>


            <div>
              <h4 className="font-medium mb-2">⚡ Performance:</h4>
              <p>Designed for smooth, simultaneous playback of multiple HD videos with hardware acceleration. Works out of the box with CDN-loaded content.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}