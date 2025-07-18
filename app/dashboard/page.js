'use client';
import { loadConfig, saveConfig } from '@/lib/config';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/button';
import { Maximize, Monitor, Settings } from 'lucide-react';
import VideoPlayer from '../../components/VideoPlayer';
import ControlPanel from '../../components/ControlPanel';
import VideoUpload from '../../components/VideoUpload';
import FullscreenView from '../../components/FullscreenView';
import GlobalControls from '../../components/GlobalControls';






export default function Home() {
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
          fetch('/api/configs/screen-1'),
          fetch('/api/videos')
        ]);

        const configData = await configRes.json();
        const videoData = await videosRes.json();

        setAssignments(configData || Array(6).fill(null));
        setVideos((videoData || []).map(v => {
          const url = typeof v === 'string' ? v : v?.url;
          if (!url) return null;
          return {
            url,
            name: url.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Unnamed',
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



  useEffect(() => {
    // Save screen-1 assignments to JSON via API whenever they change
    const saveConfig = async () => {
      try {
        await fetch('/api/configs/screen-1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(assignments),
        });
      } catch (error) {
        console.error('Error saving config:', error);
      }
    };

    saveConfig();
  }, [assignments]);




  const handleAssignVideo = (playerIndex, videoPath) => {
    const newAssignments = [...assignments];
    newAssignments[playerIndex] = videoPath;
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

  const handleRandomAssign = () => {
    let selected = [];
    if (videos.length >= 6) {
      // Shuffle and pick 6 unique
      const shuffled = [...videos].sort(() => 0.5 - Math.random());
      selected = shuffled.slice(0, assignments.length);
    } else if (videos.length > 0) {
      // Less than 6, allow repeats
      for (let i = 0; i < assignments.length; i++) {
        selected.push(videos[Math.floor(Math.random() * videos.length)]);
      }
    } else {
      selected = Array(6).fill(null);
    }
    setAssignments(selected);
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
                timerDuration={assignment?.timer}

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
              <h4 className="font-medium mb-2">📁 Video Library:</h4>
              <p>Simply add video files to the <code className="bg-gray-700 px-1 rounded">/public/videos/</code> folder. All valid `.mp4` files will automatically appear in your dashboard’s library—no upload needed.</p>
            </div>

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
              <p>Launch any screen in fullscreen mode using <strong>“TV Mode”</strong>. This is optimized for public displays, gyms, and projection walls.</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">⚙️ Smart Randomizer:</h4>
              <p>Click <strong>“Random Assign”</strong> to instantly populate all displays with random videos from your library. Ideal for quick demos or background loops.</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">⚠️ Config Saving (Local Only):</h4>
              <p>Video assignments are saved in a <code className="bg-gray-700 px-1 rounded">screenConfigs.json</code> file. This only works during local development. In deployments like Vercel, assignments reset on page refresh.</p>
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
