// components/WebSocketIntegration.jsx - Fixed version
import React, { useEffect } from 'react';

const WebSocketIntegration = ({ 
  assignments, 
  videoRefs, 
  isAllPlaying, 
  setIsAllPlaying,
  isAllMuted,
  setIsAllMuted,
  isConnected,
  onSyncPlay,
  onSyncPause
}) => {
  // Listen for WebSocket sync events from other screens/control panels
  useEffect(() => {
    const handleSyncPlay = (event) => {
      const { targetScreens } = event.detail;
      
      // Get current screen ID from URL or params
      const currentScreenId = getCurrentScreenId();
      
      if (targetScreens.includes(currentScreenId)) {
        console.log('🎬 Screen', currentScreenId, 'responding to sync play');
        
        // Play all videos with assignments
        videoRefs.current.forEach((ref, index) => {
          if (ref && assignments[index]) {
            const videoElement = ref.querySelector ? ref.querySelector('video') : ref;
            if (videoElement && videoElement.play) {
              videoElement.currentTime = 0; // Reset to beginning
              videoElement.play().catch(e => console.warn('Play failed:', e));
            }
          }
        });
        
        setIsAllPlaying(true);
      }
    };

    const handleSyncPause = (event) => {
      const { targetScreens } = event.detail;
      
      const currentScreenId = getCurrentScreenId();
      
      if (targetScreens.includes(currentScreenId)) {
        console.log('⏸️ Screen', currentScreenId, 'responding to sync pause');
        
        // Pause all videos with assignments
        videoRefs.current.forEach((ref, index) => {
          if (ref && assignments[index]) {
            const videoElement = ref.querySelector ? ref.querySelector('video') : ref;
            if (videoElement && videoElement.pause) {
              videoElement.pause();
            }
          }
        });
        
        setIsAllPlaying(false);
      }
    };

    window.addEventListener('websocket-sync-play', handleSyncPlay);
    window.addEventListener('websocket-sync-pause', handleSyncPause);

    return () => {
      window.removeEventListener('websocket-sync-play', handleSyncPlay);
      window.removeEventListener('websocket-sync-pause', handleSyncPause);
    };
  }, [assignments, videoRefs, setIsAllPlaying]);

  // Helper function to get current screen ID
  const getCurrentScreenId = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.pathname;
      const match = url.match(/\/dashboard\/(.+)/);
      return match ? match[1] : null;
    }
    return null;
  };

  // Get active screen IDs for display
  const getActiveScreenIds = () => {
    return assignments
      .map((assignment, index) => assignment ? `screen-${index + 1}` : null)
      .filter(Boolean);
  };

  const activeScreens = getActiveScreenIds();

  return (
    <div className="websocket-integration bg-gray-800 p-4 rounded-lg mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="font-medium">
            WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <div className="text-sm text-gray-400">
          Active Screens: {activeScreens.length > 0 ? activeScreens.join(', ') : 'None'}
        </div>
      </div>
      
      {/* Control buttons for testing */}
      {isConnected && (
        <div className="flex gap-2">
          <button 
            onClick={onSyncPlay}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
            disabled={activeScreens.length === 0}
          >
            🎬 Sync Play All ({activeScreens.length})
          </button>
          <button 
            onClick={onSyncPause}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            disabled={activeScreens.length === 0}
          >
            ⏸️ Sync Pause All ({activeScreens.length})
          </button>
        </div>
      )}

      {/* Status information */}
      <div className="mt-3 text-xs text-gray-500">
        {!isConnected && (
          <div className="text-yellow-400">
            ⚠️ WebSocket disconnected. Sync functionality unavailable.
          </div>
        )}
        {isConnected && activeScreens.length === 0 && (
          <div className="text-blue-400">
            ℹ️ Assign videos to screens to enable sync functionality.
          </div>
        )}
        {isConnected && activeScreens.length > 0 && (
          <div className="text-green-400">
            ✅ Ready to sync {activeScreens.length} active screen(s).
          </div>
        )}
      </div>
    </div>
  );
};

export default WebSocketIntegration;