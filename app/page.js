'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Settings, Eye, Plus, Play, Pause, Check, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

const screenIds = ['screen-1', 'screen-2', 'screen-3'];

export default function ScreenControlPanel() {
  const [selectedScreens, setSelectedScreens] = useState(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [screenStatuses, setScreenStatuses] = useState(new Map());

  // 🔥 FIXED: Use the correct WebSocket hook integration
  const { socket, isConnected, connectedScreens, emit } = useWebSocket('control_panel');

  // Listen for acknowledgments and screen status updates
  useEffect(() => {
    if (!socket) return;

    const handleSyncAck = (data) => {
      console.log('✅ Sync command acknowledged:', data);
      setIsPlaying(data.action === 'play');
      setIsLoading(false);
      setLastAction(data.action);

      // Clear action feedback after 2 seconds
      setTimeout(() => setLastAction(null), 2000);
    };

    const handleScreenStatus = (data) => {
      console.log('📊 Screen status update:', data);
      setScreenStatuses(prev => new Map(prev.set(data.screenId, data.status)));
    };

    socket.on('sync_command_ack', handleSyncAck);
    socket.on('screen_status_update', handleScreenStatus);

    return () => {
      socket.off('sync_command_ack', handleSyncAck);
      socket.off('screen_status_update', handleScreenStatus);
    };
  }, [socket]);

  // Toggle screen selection
  const toggleScreenSelection = useCallback((screenId) => {
    setSelectedScreens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(screenId)) {
        newSet.delete(screenId);
      } else {
        newSet.add(screenId);
      }
      return newSet;
    });
  }, []);

  // Select all screens
  const selectAllScreens = useCallback(() => {
    setSelectedScreens(new Set(screenIds));
  }, []);

  // Clear all selections
  const clearAllSelections = useCallback(() => {
    setSelectedScreens(new Set());
  });

  // 🔥 FIXED: WebSocket-based synchronized play/pause using emit function
  const performSyncAction = useCallback(async (action) => {
    if (selectedScreens.size === 0) {
      alert('Please select at least one screen to control');
      return;
    }

    if (!isConnected) {
      alert('Not connected to WebSocket server. Please check your connection.');
      return;
    }

    const targetScreens = Array.from(selectedScreens);
    
    // Log all screens for debugging
    console.log('🎯 Target screens:', targetScreens);
    console.log('🌐 Connected screens:', connectedScreens);

    // For control panel, we can send commands to all selected screens
    // The server will filter out disconnected ones
    setIsLoading(true);
    setLastAction(action);

    try {
      if (action === 'play') {
        console.log('🎬 Sending sync play to:', targetScreens);
        emit('sync_play', { 
          targetScreens: targetScreens,
          timestamp: Date.now() 
        });
      } else if (action === 'pause') {
        console.log('⏸️ Sending sync pause to:', targetScreens);
        emit('sync_pause', { 
          targetScreens: targetScreens,
          timestamp: Date.now() 
        });
      }

      // Set a timeout to clear loading state if no ack received
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);

    } catch (error) {
      console.error(`❌ WebSocket sync ${action} failed:`, error);
      alert(`Failed to ${action} selected screens via WebSocket. Please try again.`);
      setIsLoading(false);
    }
  }, [selectedScreens, isConnected, connectedScreens, emit]);

  // Sync control handlers
  const handleSyncPlay = () => performSyncAction('play');
  const handleSyncPause = () => performSyncAction('pause');

  // Get screen connection status
  const getScreenStatus = (screenId) => {
    const isScreenConnected = connectedScreens.includes(screenId);
    const status = screenStatuses.get(screenId);
    return { isConnected: isScreenConnected, status: status || 'unknown' };
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/20">
              <Monitor className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Screen Control Center
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Real-time synchronized multi-screen playback control via WebSocket
          </p>
        </div>

        {/* WebSocket Connection Status */}
        <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <>
                    <Wifi className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-medium">WebSocket Connected</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5 text-red-400" />
                    <span className="text-red-400 font-medium">WebSocket Disconnected</span>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  </>
                )}
              </div>

              <div className="text-sm text-slate-400">
                {connectedScreens.length} screen(s) online: {connectedScreens.length > 0 ? connectedScreens.join(', ') : 'None'}
              </div>
            </div>

            {!isConnected && (
              <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Connection Error: WebSocket server not reachable. Make sure the WebSocket server is running on port 3001.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Multi-Screen Sync Controls */}
        <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              WebSocket Multi-Screen Synchronization
            </CardTitle>
            <p className="text-sm text-slate-400">
              Select screens and control playback simultaneously via WebSocket. All videos will start and stop at exactly the same time.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Screen Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Select Screens</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllScreens}
                    className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20 text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllSelections}
                    className="border-red-500/30 text-red-300 hover:bg-red-500/20 text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {screenIds.map((screenId) => {
                  const isSelected = selectedScreens.has(screenId);
                  const { isConnected: screenConnected } = getScreenStatus(screenId);

                  return (
                    <button
                      key={screenId}
                      onClick={() => toggleScreenSelection(screenId)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${isSelected
                          ? 'border-green-500 bg-green-500/20 text-green-300'
                          : 'border-slate-600/50 bg-slate-700/30 text-slate-300 hover:border-slate-500/70 hover:bg-slate-700/50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Monitor className="h-5 w-5" />
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${screenConnected ? 'bg-green-400' : 'bg-red-400'
                            }`}></div>
                        </div>
                        <span className="font-medium">{screenId}</span>
                        {isSelected && <Check className="h-4 w-4 ml-auto" />}
                      </div>
                      <div className="text-xs mt-1 opacity-70">
                        {screenConnected ? 'Online' : 'Offline'}
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-sm text-slate-400 text-center">
                {selectedScreens.size === 0 ? (
                  "No screens selected"
                ) : (
                  `${selectedScreens.size} screen${selectedScreens.size > 1 ? 's' : ''} selected: ${Array.from(selectedScreens).join(', ')}`
                )}
              </p>
            </div>

            {/* Synchronized Play/Pause Controls */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white">WebSocket Synchronized Playback</h3>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleSyncPlay}
                  disabled={isLoading || selectedScreens.size === 0 || !isConnected}
                  className={`group/btn h-20 w-32 flex flex-col items-center justify-center gap-2 ${isPlaying && lastAction === 'play'
                      ? 'bg-green-600 hover:bg-green-700 border-green-500'
                      : 'bg-green-500/20 hover:bg-green-500/30 border-green-500/30'
                    } transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Play className="h-8 w-8 text-green-300 group-hover/btn:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-green-300">Play All</span>
                </Button>

                <Button
                  onClick={handleSyncPause}
                  disabled={isLoading || selectedScreens.size === 0 || !isConnected}
                  className={`group/btn h-20 w-32 flex flex-col items-center justify-center gap-2 ${!isPlaying && lastAction === 'pause'
                      ? 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500'
                      : 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/30'
                    } transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Pause className="h-8 w-8 text-yellow-300 group-hover/btn:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-yellow-300">Pause All</span>
                </Button>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-blue-300">
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Synchronizing {lastAction} across selected screens via WebSocket...</span>
                </div>
              )}

              {!isConnected && (
                <div className="flex items-center justify-center gap-2 text-red-300">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm">WebSocket disconnected - sync controls disabled</span>
                </div>
              )}
            </div>

            {/* Status Display */}
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide">Connection</p>
                  <p className={`font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    {isConnected ? 'Online' : 'Offline'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide">Status</p>
                  <p className={`font-medium ${isPlaying ? 'text-green-400' : 'text-yellow-400'}`}>
                    {isPlaying ? 'Playing' : 'Paused'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide">Selected</p>
                  <p className="font-medium text-white">{selectedScreens.size} screens</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide">Last Action</p>
                  <p className="font-medium text-slate-300">
                    {lastAction ? lastAction.charAt(0).toUpperCase() + lastAction.slice(1) : 'None'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Screen Cards */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Individual Screen Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {screenIds.map((screenId) => {
              const isSelected = selectedScreens.has(screenId);
              const { isConnected: screenConnected, status } = getScreenStatus(screenId);

              return (
                <Card
                  key={screenId}
                  className={`backdrop-blur-sm transition-all duration-300 hover:shadow-xl group cursor-pointer ${isSelected
                      ? 'bg-green-500/10 border-green-500/50 hover:border-green-400/70 shadow-green-500/20'
                      : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600/50 hover:shadow-blue-500/10'
                    }`}
                  onClick={() => toggleScreenSelection(screenId)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                        <div className="relative">
                          <Monitor className={`h-5 w-5 ${isSelected ? 'text-green-400' : 'text-blue-400'}`} />
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${screenConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                            }`}></div>
                        </div>
                        {screenId}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {isSelected && (
                          <Check className="w-5 h-5 text-green-400" />
                        )}
                        <div className={`w-3 h-3 rounded-full ${screenConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                          }`}></div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400">
                      Status: {screenConnected ? 'Connected' : 'Disconnected'} • Resolution: 1920x1080
                      {isSelected && <span className="text-green-400 ml-2">• Selected for sync</span>}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3">
                      <Button
                        variant="ghost"
                        className="group/btn w-full justify-start text-blue-300 hover:text-blue-200 font-medium px-4 py-3 border border-blue-500/30 hover:border-blue-400/50 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md hover:shadow-blue-500/20 transform hover:scale-[1.02]"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/dashboard/${screenId}`, '_blank');
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2 group-hover/btn:rotate-90 transition-transform duration-200" />
                        Configure Screen
                      </Button>

                      <Button
                        variant="ghost"
                        className="group/btn w-full justify-start text-purple-300 hover:text-purple-200 font-medium px-4 py-3 border border-purple-500/30 hover:border-purple-400/50 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md hover:shadow-purple-500/20 transform hover:scale-[1.02]"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/dashboard/${screenId}?fullscreen=true`, '_blank');
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" />
                        Launch Display
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Add new screen (placeholder) */}
            <Card className="bg-slate-800/20 backdrop-blur-sm border-slate-700/30 border-dashed hover:border-slate-600/50 transition-all duration-300 opacity-60">
              <CardContent className="flex items-center justify-center h-48">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto">
                    <Plus className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-sm">Add new screen</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Usage Instructions */}
        <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-400">WebSocket Multi-Screen Synchronization Guide</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-300">
              <div>
                <h4 className="font-medium mb-2 text-white">🔌 WebSocket Connection:</h4>
                <p className="mb-3">The control panel automatically connects to the WebSocket server. Green indicators show connected screens, red indicators show disconnected screens.</p>

                <h4 className="font-medium mb-2 text-white">🎯 Screen Selection:</h4>
                <p className="mb-3">Click on screen cards to select/deselect them for synchronized control. Commands are sent to all selected screens regardless of connection status.</p>

                <h4 className="font-medium mb-2 text-white">⏯️ Synchronized Playback:</h4>
                <p>Use "Play All" and "Pause All" to control video playback across all selected screens simultaneously via WebSocket. Timers will start/stop automatically.</p>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-white">🚀 Real-time Updates:</h4>
                <p className="mb-3">Screen connection status updates in real-time. The system sends commands to all selected screens, and the WebSocket server handles routing.</p>

                <h4 className="font-medium mb-2 text-white">📺 Individual Control:</h4>
                <p className="mb-3">Click "Configure Screen" or "Launch Display" to manage individual screens. The display opens in fullscreen mode automatically.</p>

                <h4 className="font-medium mb-2 text-white">🔧 Troubleshooting:</h4>
                <p>If WebSocket connection fails, check that the WebSocket server is running on port 3001 and refresh the page.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm border-t border-slate-700/50 pt-6">
          <p>© 2025 Screen Control Center • Real-time WebSocket Multi-Screen Synchronization System</p>
        </div>
      </div>
    </main>
  );
}