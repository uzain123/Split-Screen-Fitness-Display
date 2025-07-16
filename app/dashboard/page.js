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
              <h4 className="font-medium mb-2">📁 Default Videos:</h4>
              <p>Place video files in the <code className="bg-gray-700 px-1 rounded">/public/videos/</code> folder. They'll automatically appear in your video library.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎮 Controls:</h4>
              <p>Use the control panel to assign videos to each player. Click "TV Mode" for fullscreen casting to your large display.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📺 TV Optimization:</h4>
              <p>The interface is optimized for large screens with high contrast and large controls for easy viewing from a distance.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚡ High Performance:</h4>
              <p>Built for smooth playback of multiple high-resolution videos simultaneously.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
