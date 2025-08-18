"use client";

import { useParams } from "next/navigation";
import { Maximize, Monitor, Settings } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

import { useWebSocket } from "@/hooks/useWebSocket";
import { Button } from "../../../components/ui/button";
import VideoPlayer from "../../../components/VideoPlayer";
import ControlPanel from "../../../components/ControlPanel";
import FullscreenView from "../../../components/FullscreenView";
import GlobalControls from "../../../components/GlobalControls";

export default function Home() {
  const { screenId } = useParams();

  const [videos, setVideos] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAllMuted, setIsAllMuted] = useState(false);
  const [isAllPlaying, setIsAllPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [assignments, setAssignments] = useState(Array(6).fill(null));

  const videoRefs = useRef([]);

  const [globalTimers, setGlobalTimers] = useState({
    timer1: 60,
    timer2: 60,
    timer3: 2700,
    timer4: 120,
    delay1: 30,
    delayText1: "Move to the next station"
  });

  const { isConnected, connectedScreens, sendSyncPlay, sendSyncPause } = useWebSocket(
    `control-${screenId}`
  );

  const syncDebounceRef = useRef({ lastSync: 0, debounceMs: 300 });

  useEffect(() => {
    window.debugRandomAssign = () => {
      if (!videos.length) {
        console.warn("⚠️ No videos available to assign.");
        return;
      }

      const newAssignments = assignments.map((_, index) => {
        const randomVideo = videos[Math.floor(Math.random() * videos.length)];
        const isMiddleTop = index === 1;

        return {
          url: randomVideo,
          name:
            randomVideo
              .split("/")
              .pop()
              ?.replace(/\.[^/.]+$/, "") || "Unnamed",
          timerDuration: isMiddleTop ? globalTimers.timer2 : globalTimers.timer1,
          delayDuration: isMiddleTop ? 0 : globalTimers.delay1,
          delayText: isMiddleTop ? "Restarting Video" : globalTimers.delayText1
        };
      });

      setAssignments(newAssignments);
      console.log("✅ Random assignments applied:", newAssignments);
    };

    return () => {
      delete window.debugRandomAssign;
    };
  }, [videos, assignments, globalTimers]);

  const debounceSync = (action) => {
    const now = Date.now();
    if (now - syncDebounceRef.current.lastSync < syncDebounceRef.current.debounceMs) return false;
    syncDebounceRef.current.lastSync = now;
    return action();
  };

  const getActiveScreens = () =>
    assignments
      .map((assignment, index) => (assignment ? `screen-${index + 1}` : null))
      .filter(Boolean);

  const handleSyncPlayAll = () => {
    if (!isConnected) return console.warn("WebSocket not connected");
    debounceSync(() => {
      const activeScreens = getActiveScreens();
      if (!activeScreens.length) return console.warn("No active screens to sync");
      if (sendSyncPlay(activeScreens, Date.now())) setIsAllPlaying(true);
    });
  };

  const handleSyncPauseAll = () => {
    if (!isConnected) return console.warn("WebSocket not connected");
    debounceSync(() => {
      const activeScreens = getActiveScreens();
      if (sendSyncPause(activeScreens, Date.now())) setIsAllPlaying(false);
    });
  };

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/videos");
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();

      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.videos)) return data.videos;
      if (typeof data === "object") {
        const urls = Object.values(data).filter(
          (v) => typeof v === "string" && (v.startsWith("http") || v.startsWith("/"))
        );
        if (urls.length) return urls;
      }
      return [];
    } catch (err) {
      setApiError(`Failed to fetch videos: ${err.message}`);
      return [];
    }
  };

  const fetchConfigAndVideos = async () => {
    try {
      const [configRes, videoData] = await Promise.all([
        fetch(`/api/configs/${screenId}`).catch(() => ({ ok: false, json: async () => ({}) })),
        fetchVideos()
      ]);

      const configData = configRes.ok ? await configRes.json() : {};

      setVideos(videoData);

      // Handle new config structure
      if (configData.videoAssignments && configData.globalTimers) {
        // New structure: separate video assignments and global timers
        const newAssignments = Array(6)
          .fill(null)
          .map((_, i) => {
            const videoAssignment = configData.videoAssignments[i];
            if (!videoAssignment?.url) return null;
            return {
              url: videoAssignment.url,
              name:
                videoAssignment.title ||
                videoAssignment.url
                  .split("/")
                  .pop()
                  ?.replace(/\.[^/.]+$/, "") ||
                "Unnamed",
              timerDuration:
                i === 1 ? configData.globalTimers.timer2 : configData.globalTimers.timer1,
              delayDuration: i === 1 ? 0 : configData.globalTimers.delay1,
              delayText: i === 1 ? "Restarting Video" : configData.globalTimers.delayText1
            };
          });

        setAssignments(newAssignments);
        setGlobalTimers(configData.globalTimers);
      } else {
        // Fallback for legacy format or default values
        const newAssignments = Array(6).fill(null);
        setAssignments(newAssignments);
        setGlobalTimers({
          timer1: 60,
          timer2: 60,
          timer3: 2700,
          timer4: 120,
          delay1: 30,
          delayText1: "Move to the next station"
        });
      }

      if (new URLSearchParams(window.location.search).get("fullscreen") === "true")
        enterFullscreen();
    } catch (err) {
      setApiError(`Failed to load data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigAndVideos();
  }, [screenId]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        // Create new config structure - save both assignments and globalTimers
        const configData = {
          videoAssignments: assignments.map((assignment) =>
            assignment
              ? {
                  url: assignment.url,
                  title: assignment.name
                }
              : null
          ),
          globalTimers: globalTimers
        };

        const res = await fetch(`/api/configs/${screenId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(configData)
        });
        if (!res.ok) throw new Error("Failed to save config");
      } catch (err) {
        console.error("❌ Error saving config:", err);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [assignments, globalTimers, screenId]);

  const handleAssignVideo = (index, videoUrl) => {
    const newAssignments = [...assignments];
    if (!videoUrl) return setAssignments(newAssignments.fill(null, index, index + 1));

    const isMiddleTop = index === 1;
    newAssignments[index] = {
      url: videoUrl,
      name:
        videoUrl
          .split("/")
          .pop()
          ?.replace(/\.[^/.]+$/, "") || "Unnamed",
      timerDuration: isMiddleTop ? globalTimers.timer2 : globalTimers.timer1,
      delayDuration: isMiddleTop ? 0 : globalTimers.delay1,
      delayText: isMiddleTop ? "Restarting Video" : globalTimers.delayText1
    };
    setAssignments(newAssignments);
  };

  const handleClearAll = () => setAssignments(Array(assignments.length).fill(null));

  const enterFullscreen = () => {
    videoRefs.current.forEach((ref) => ref?.play());
    setIsAllMuted(false);
    setIsAllPlaying(true);
    setIsFullscreen(true);
  };

  const exitFullscreen = () => setIsFullscreen(false);

  const handlePlayPauseAll = () => {
    const newState = !isAllPlaying;
    setIsAllPlaying(newState);
    videoRefs.current.forEach((ref) => (newState ? ref?.play() : ref?.pause()));
    if (isConnected) newState ? handleSyncPlayAll() : handleSyncPauseAll();
  };

  const handleMuteUnmuteAll = () => {
    videoRefs.current.forEach((ref) => (isAllMuted ? ref?.unmute() : ref?.mute()));
    setIsAllMuted(!isAllMuted);
  };

  if (isFullscreen) {
    return (
      <FullscreenView
        assignments={assignments}
        onClose={exitFullscreen}
        globalTimer3={globalTimers.timer3}
        globalTimers={globalTimers}
        screenId={screenId}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
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
      {apiError && (
        <div className="bg-red-900/50 border-b border-red-500 p-4">
          <div className="container mx-auto px-4">
            <p className="text-red-200 text-sm">⚠️ {apiError}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold">Multi-Video Stream Dashboard</h1>
              <p className="text-sm text-gray-400">
                Professional video management for large displays
                {videos.length > 0 && ` • ${videos.length} videos available`}
                {isConnected && ` • WebSocket Connected (${connectedScreens.length} screens)`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              Back to Control Center
            </Button>
            <Button onClick={enterFullscreen} className="bg-blue-600 hover:bg-blue-700">
              <Maximize className="h-4 w-4 mr-2" />
              TV Mode
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Video Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Monitor className="h-5 w-5" /> Video Display Grid
            </h2>
            <GlobalControls
              isAllMuted={isAllMuted}
              isAllPlaying={isAllPlaying}
              onPlayPauseAll={handlePlayPauseAll}
              onMuteUnmuteAll={handleMuteUnmuteAll}
              isFullscreen={isFullscreen}
              assignments={assignments}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {assignments.map((assignment, index) => (
              <VideoPlayer
                key={index}
                ref={(el) => (videoRefs.current[index] = el)}
                src={assignment}
                index={index}
                globalTimer3={globalTimers.timer3}
              />
            ))}
          </div>
        </div>

        <ControlPanel
          videos={videos}
          setVideos={setVideos}
          assignments={assignments}
          onAssignVideo={handleAssignVideo}
          setAssignments={setAssignments}
          onClearAll={handleClearAll}
          globalTimers={globalTimers}
          setGlobalTimers={setGlobalTimers}
        />
      </div>
    </div>
  );
}
