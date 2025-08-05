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

  // Global timer states
  const [globalTimers, setGlobalTimers] = useState({
    timer1: 60,      // Timer for all displays except middle top
    timer2: 60,      // Timer for middle top display only
    timer3: 2700,     // Global pause timer (not saved to JSON)
    delay1: 30,      // Delay for Timer 1 displays
    delayText1: 'Move to the next station' // Delay text for Timer 1 displays
  });

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Function to fetch videos from S3 with better error handling
  const fetchVideos = async () => {
    try {
      console.log('🔄 Fetching videos from API...');
      const videosRes = await fetch('/api/videos');
      
      if (!videosRes.ok) {
        console.error(`❌ API Error: ${videosRes.status} ${videosRes.statusText}`);
        setApiError(`Failed to fetch videos: ${videosRes.status} ${videosRes.statusText}`);
        return [];
      }

      const videoData = await videosRes.json();
      console.log('✅ API Response:', videoData);
      
      // Ensure we always return an array
      if (!videoData) {
        console.warn('⚠️ API returned null/undefined, using empty array');
        return [];
      }
      
      if (!Array.isArray(videoData)) {
        console.warn('⚠️ API returned non-array data:', typeof videoData, videoData);
        // If it's an object with a videos property, use that
        if (videoData.videos && Array.isArray(videoData.videos)) {
          console.log('✅ Found videos array in response.videos');
          return videoData.videos;
        }
        // If it's an object with URL values, convert to array
        if (typeof videoData === 'object') {
          const urls = Object.values(videoData).filter(item => 
            typeof item === 'string' && (item.startsWith('http') || item.startsWith('/'))
          );
          if (urls.length > 0) {
            console.log('✅ Extracted URLs from object:', urls);
            return urls;
          }
        }
        console.warn('⚠️ Could not extract video URLs, returning empty array');
        return [];
      }
      
      console.log(`✅ Successfully loaded ${videoData.length} videos`);
      return videoData;
    } catch (error) {
      console.error('❌ Error fetching videos:', error);
      setApiError(`Network error: ${error.message}`);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🚀 Starting data fetch for screenId:', screenId);
        
        // Fetch config and videos simultaneously
        const [configRes, videoData] = await Promise.all([
          fetch(`/api/configs/${screenId}`).catch(err => {
            console.error('❌ Config fetch error:', err);
            return { ok: false, json: () => Promise.resolve({}) };
          }),
          fetchVideos()
        ]);

        // Handle config response
        let configData = {};
        if (configRes.ok) {
          configData = await configRes.json();
          console.log('✅ Config loaded:', configData);
        } else {
          console.warn('⚠️ Config fetch failed, using defaults');
        }

        // Set videos with safety check
        if (Array.isArray(videoData) && videoData.length > 0) {
          setVideos(videoData);
          console.log('✅ Videos set successfully:', videoData.length);
        } else {
          setVideos([]);
          console.warn('⚠️ No videos available, set empty array');
        }

        // Load assignments from config
        const newAssignments = Array(6)
          .fill(null)
          .map((_, i) => {
            const item = configData?.[i];
            if (!item || !item.url) return null;

            return {
              url: item.url,
              name: item.name || item.url.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Unnamed',
              timerDuration: item.timerDuration || 60,
              delayDuration: item.delayDuration || (i === 1 ? 0 : 30), // Middle top (index 1) has 0 delay
              delayText: item.delayText || 'Move to the next station',
            };
          });
        
        setAssignments(newAssignments);
        console.log('✅ Assignments loaded:', newAssignments.filter(Boolean).length, 'active');

        // Extract global timer values from the first valid assignment (if exists)
        const firstAssignment = configData?.find(item => item && item.url);
        if (firstAssignment) {
          setGlobalTimers(prev => ({
            ...prev,
            timer1: firstAssignment.timerDuration || 60,
            delay1: firstAssignment.delayDuration || 30,
            delayText1: firstAssignment.delayText || 'Move to the next station'
          }));
        }

        // Extract timer2 from middle top assignment (index 1)
        const middleTopAssignment = configData?.[1];
        if (middleTopAssignment && middleTopAssignment.url) {
          setGlobalTimers(prev => ({
            ...prev,
            timer2: middleTopAssignment.timerDuration || 60
          }));
        }

        // Check for ?fullscreen=true
        const urlParams = new URLSearchParams(window.location.search);
        const fullscreen = urlParams.get('fullscreen');
        if (fullscreen === 'true') {
          enterFullscreen();
        }

      } catch (err) {
        console.error('❌ Error in fetchData:', err);
        setApiError(`Failed to load data: ${err.message}`);
      } finally {
        setIsLoading(false);
        console.log('✅ Data fetch complete');
      }
    };

    fetchData();
  }, [screenId]);

  // Save config to API with proper timer distribution
  useEffect(() => {
    const timeout = setTimeout(() => {
      const saveConfig = async () => {
        if (!assignments || assignments.length === 0 || assignments.every(item => item === null)) {
          console.warn('🛑 Prevented POST: Empty or uninitialized assignments.');
          return;
        }

        console.log('✅ Saving config with global timer settings:', assignments);

        try {
          const res = await fetch(`/api/configs/${screenId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assignments),
          });

          if (!res.ok) throw new Error('Failed to save config');
          console.log('✅ Config saved with global timer settings.');
        } catch (err) {
          console.error('❌ Error saving config:', err);
        }
      };

      saveConfig();
    }, 500);

    return () => clearTimeout(timeout);
  }, [assignments, screenId]);

  // Handle video assignment with proper timer application
  const handleAssignVideo = (playerIndex, videoUrl) => {
    const newAssignments = [...assignments];
    
    if (!videoUrl) {
      // Clear assignment
      newAssignments[playerIndex] = null;
      setAssignments(newAssignments);
      return;
    }
    
    // Apply appropriate timer based on player index
    let timerDuration, delayDuration, delayText;
    
    if (playerIndex === 1) {
      // Middle top - Timer 2
      timerDuration = globalTimers.timer2;
      delayDuration = 0; // No delay for Timer 2
      delayText = 'Restarting Video'; // Default text for Timer 2
    } else {
      // All other displays - Timer 1
      timerDuration = globalTimers.timer1;
      delayDuration = globalTimers.delay1;
      delayText = globalTimers.delayText1;
    }

    // Extract video name from URL
    const videoName = videoUrl.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Unnamed';

    newAssignments[playerIndex] = {
      url: videoUrl,
      name: videoName,
      timerDuration: timerDuration,
      delayDuration: delayDuration,
      delayText: delayText,
    };
    
    setAssignments(newAssignments);
  };

  const handleClearAll = () => {
    setAssignments(Array(assignments.length).fill(null));
  };

  const enterFullscreen = () => {
    // Instead of pausing, start playing all videos when entering fullscreen
    videoRefs.current.forEach(ref => {
      if (ref) {
        ref.play(); // Start playing instead of pausing
      }
    });
    setIsAllPlaying(true); // Set to playing state
    setIsAllMuted(false); // Optionally unmute as well
    setIsFullscreen(true);
  };

  // Keep exitFullscreen as is, or update similarly if you want videos to keep playing:
  const exitFullscreen = () => {
    // Reset all video states when exiting fullscreen
    videoRefs.current.forEach(ref => {
      if (ref) {
        ref.play();
      }
    });
    setIsAllPlaying(true);
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

  // Updated random assign with proper timer application and safety checks
  const handleRandomAssign = () => {
    if (!Array.isArray(videos) || videos.length === 0) {
      console.warn('⚠️ No videos available for random assignment');
      setApiError('No videos available for random assignment. Please check your video API.');
      return;
    }

    let shuffledVideoUrls = [];

    if (videos.length >= assignments.length) {
      // Shuffle and pick unique videos for each slot
      const shuffled = [...videos].sort(() => 0.5 - Math.random());
      shuffledVideoUrls = shuffled.slice(0, assignments.length);
    } else {
      // Less videos than slots, allow repeats but still shuffle
      for (let i = 0; i < assignments.length; i++) {
        const randomVideo = videos[Math.floor(Math.random() * videos.length)];
        shuffledVideoUrls.push(randomVideo);
      }
    }

    const newAssignments = assignments.map((currentAssignment, index) => {
      // Apply appropriate timer based on player index
      let timerDuration, delayDuration, delayText;
      
      if (index === 1) {
        // Middle top - Timer 2
        timerDuration = globalTimers.timer2;
        delayDuration = 0;
        delayText = 'Restarting Video';
      } else {
        // All other displays - Timer 1
        timerDuration = globalTimers.timer1;
        delayDuration = globalTimers.delay1;
        delayText = globalTimers.delayText1;
      }

      const videoUrl = shuffledVideoUrls[index];
      const videoName = videoUrl.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Unnamed';

      return {
        url: videoUrl,
        name: currentAssignment?.name || videoName,
        timerDuration: timerDuration,
        delayDuration: delayDuration,
        delayText: delayText,
      };
    });

    setAssignments(newAssignments);
    console.log('✅ Random assignment completed');
  };

  if (isFullscreen) {
    return (
      <FullscreenView
        assignments={assignments}
        onClose={exitFullscreen}
        globalTimer3={globalTimers.timer3} // Pass Timer 3 to fullscreen view
        globalTimers={globalTimers} // Pass all global timers
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-lg font-medium">Loading your display...</p>
          {apiError && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-200 text-sm">⚠️ {apiError}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* API Error Banner */}
      {apiError && (
        <div className="bg-red-900/50 border-b border-red-500 p-4">
          <div className="container mx-auto px-4">
            <p className="text-red-200 text-sm">⚠️ {apiError}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-2xl font-bold">Multi-Video Stream Dashboard</h1>
                <p className="text-sm text-gray-400">
                  Professional video management for large displays 
                  {videos.length > 0 && ` • ${videos.length} videos available`}
                </p>
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
              globalTimer3={globalTimers.timer3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {assignments.map((assignment, index) => (
              <VideoPlayer
                key={index}
                ref={el => videoRefs.current[index] = el}
                src={assignment}
                index={index}
                globalTimer3={globalTimers.timer3}
              />
            ))}
          </div>
        </div>

        {/* Controls Section */}
        {showControls && (
          <div className="space-y-6">
            <ControlPanel
              videos={videos}
              setVideos={setVideos} // Add this line - this was missing!
              assignments={assignments}
              onAssignVideo={handleAssignVideo}
              setAssignments={setAssignments}
              onClearAll={handleClearAll}
              globalTimers={globalTimers}
              setGlobalTimers={setGlobalTimers}
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
              <h4 className="font-medium mb-2">⏱️ Global Timer System:</h4>
              <p><strong>Timer 1:</strong> Applied to all displays except middle top. <strong>Timer 2:</strong> Applied only to middle top display (no delay). <strong>Timer 3:</strong> Global pause timer that stops all videos when reached.</p>
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