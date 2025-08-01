import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Monitor, RotateCcw, Plus, Minus, Video, Timer, Tag, Info, Clock, MessageSquare, Globe } from 'lucide-react';
import { Input } from './ui/input';

const ControlPanel = ({
  videos,
  assignments,
  onAssignVideo,
  setAssignments,
  onClearAll,
  globalTimers,
  setGlobalTimers
}) => {

  const handleAddScreen = () => {
    if (assignments.length < 6) {
      setAssignments([...assignments, null]);
    }
  };

  const handleRemoveScreen = () => {
    if (assignments.length > 1) {
      const updated = [...assignments];
      updated.pop();
      setAssignments(updated);
    }
  };

  const handleNameChange = (index, newName) => {
    const updated = [...assignments];
    if (!updated[index]) updated[index] = { url: null, name: '', timerDuration: 60, delayDuration: 30, delayText: 'Restarting Video' };
    updated[index].name = newName;
    setAssignments(updated);
  };

  // Function to get display name for video
  const getVideoDisplayName = (video) => {
    if (typeof video === 'string') {
      return video.split('/').pop(); // Return just the filename after last slash
    }
    const videoPath = video?.name || video?.url || 'Unknown video';
    return videoPath.split('/').pop(); // Return just the filename after last slash
  };

  // Handle global timer changes
  const handleGlobalTimer1Change = (value) => {
    const timer1Value = parseInt(value || '60');
    setGlobalTimers(prev => ({ ...prev, timer1: timer1Value }));
    
    // Apply Timer 1 to all displays except index 1 (middle top)
    const updated = [...assignments];
    updated.forEach((assignment, index) => {
      if (index !== 1 && assignment) { // Skip middle top (index 1)
        assignment.timerDuration = timer1Value;
      }
    });
    setAssignments(updated);
  };

  const handleGlobalTimer2Change = (value) => {
    const timer2Value = parseInt(value || '60');
    setGlobalTimers(prev => ({ ...prev, timer2: timer2Value }));
    
    // Apply Timer 2 only to middle top display (index 1)
    const updated = [...assignments];
    if (updated[1]) {
      updated[1].timerDuration = timer2Value;
      updated[1].delayDuration = 0; // Default 0 delay for timer 2
    }
    setAssignments(updated);
  };

  const handleGlobalTimer3Change = (value) => {
    const timer3Value = parseInt(value || '2700');
    setGlobalTimers(prev => ({ ...prev, timer3: timer3Value }));
  };

  const handleDelay1Change = (value) => {
    const delay1Value = parseInt(value || '30');
    setGlobalTimers(prev => ({ ...prev, delay1: delay1Value }));
    
    // Apply Delay 1 to all displays except index 1 (middle top)
    const updated = [...assignments];
    updated.forEach((assignment, index) => {
      if (index !== 1 && assignment) { // Skip middle top (index 1)
        assignment.delayDuration = delay1Value;
      }
    });
    setAssignments(updated);
  };

  const handleDelayText1Change = (value) => {
    const delayText1Value = value || 'Move to the next station';
    setGlobalTimers(prev => ({ ...prev, delayText1: delayText1Value }));
    
    // Apply Delay Text 1 to all displays except index 1 (middle top)
    const updated = [...assignments];
    updated.forEach((assignment, index) => {
      if (index !== 1 && assignment) { // Skip middle top (index 1)
        assignment.delayText = delayText1Value;
      }
    });
    setAssignments(updated);
  };

  return (
    <Card className="shadow-xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
      <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white border-b border-slate-600">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-slate-600 rounded-lg">
            <Monitor className="w-5 h-5 text-slate-200" />
          </div>
          Video Assignment Control
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {/* Info Note */}
        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
          <div className="flex items-center gap-2 text-blue-300">
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">
              Global timer settings will apply to all videos. Timer 1 affects all displays except middle top, Timer 2 affects only middle top, Timer 3 is global pause timer.
            </span>
          </div>
        </div>

        {/* Global Timer Controls Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-red-400 rounded-full"></div>
            <h3 className="text-lg font-semibold text-slate-200">Global Timer Controls</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-5 bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-700/50 rounded-xl">
            {/* Timer 1 - All displays except middle top */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-orange-300">
                <Timer className="w-4 h-4 text-orange-400" />
                Timer 1 (All except middle)
              </label>
              <Input
                type="number"
                min={1}
                placeholder="60"
                value={globalTimers.timer1}
                onChange={(e) => handleGlobalTimer1Change(e.target.value)}
                className="bg-slate-700/50 border-orange-500/50 text-slate-200 placeholder-slate-400 focus:border-orange-400 focus:ring-orange-400 hover:bg-slate-700 transition-colors"
              />
              <span className="text-xs text-orange-300/70">seconds</span>
            </div>

            {/* Timer 2 - Middle top only */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-purple-300">
                <Timer className="w-4 h-4 text-purple-400" />
                Timer 2 (Middle top only)
              </label>
              <Input
                type="number"
                min={1}
                placeholder="60"
                value={globalTimers.timer2}
                onChange={(e) => handleGlobalTimer2Change(e.target.value)}
                className="bg-slate-700/50 border-purple-500/50 text-slate-200 placeholder-slate-400 focus:border-purple-400 focus:ring-purple-400 hover:bg-slate-700 transition-colors"
              />
              <span className="text-xs text-purple-300/70">seconds</span>
            </div>

            {/* Timer 3 - Global pause timer */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-red-300">
                <Globe className="w-4 h-4 text-red-400" />
                Timer 3 (Global pause)
              </label>
              <Input
                type="number"
                min={1}
                placeholder="2700"
                value={globalTimers.timer3}
                onChange={(e) => handleGlobalTimer3Change(e.target.value)}
                className="bg-slate-700/50 border-red-500/50 text-slate-200 placeholder-slate-400 focus:border-red-400 focus:ring-red-400 hover:bg-slate-700 transition-colors"
              />
              <span className="text-xs text-red-300/70">seconds</span>
            </div>

            {/* Delay 1 - For Timer 1 displays */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-blue-300">
                <Clock className="w-4 h-4 text-blue-400" />
                Delay 1 (Timer 1 displays)
              </label>
              <Input
                type="number"
                min={0}
                max={60}
                placeholder="30"
                value={globalTimers.delay1}
                onChange={(e) => handleDelay1Change(e.target.value)}
                className="bg-slate-700/50 border-blue-500/50 text-slate-200 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400 hover:bg-slate-700 transition-colors"
              />
              <span className="text-xs text-blue-300/70">seconds</span>
            </div>

            {/* Delay Text 1 - For Timer 1 displays */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-green-300">
                <MessageSquare className="w-4 h-4 text-green-400" />
                Delay Message 1
              </label>
              <Input
                value={globalTimers.delayText1}
                onChange={(e) => handleDelayText1Change(e.target.value)}
                placeholder="Move to the next station"
                className="bg-slate-700/50 border-green-500/50 text-slate-200 placeholder-slate-400 focus:border-green-400 focus:ring-green-400 hover:bg-slate-700 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Display Management Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-slate-400 rounded-full"></div>
            <h3 className="text-lg font-semibold text-slate-200">Display Management</h3>
          </div>

          <div className="flex gap-3 justify-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <Button
              onClick={handleAddScreen}
              disabled={assignments.length >= 6}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent border-slate-500 text-slate-200 hover:bg-green-900/30 hover:border-green-500 hover:text-green-400 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Display
            </Button>

            <Button
              onClick={handleRemoveScreen}
              disabled={assignments.length <= 1}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent border-slate-500 text-slate-200 hover:bg-red-900/30 hover:border-red-500 hover:text-red-400 transition-all"
            >
              <Minus className="w-4 h-4" />
              Remove Display
            </Button>
          </div>
        </div>

        {/* Player Configuration Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-slate-400 rounded-full"></div>
            <h3 className="text-lg font-semibold text-slate-200">Player Configuration</h3>
          </div>

          <div className="space-y-4">
            {assignments.map((assignment, index) => (
              <div key={index} className="p-5 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                {/* Player Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-600 text-white rounded-lg">
                    <Monitor className="w-4 h-4" />
                    <span className="font-semibold text-sm">
                      Player {index + 1} {index === 1 ? '(Middle Top - Timer 2)' : '(Timer 1)'}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-slate-600"></div>
                </div>

                {/* Configuration Grid - Only Video Selection and Custom Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Video Selection */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                      <Video className="w-4 h-4 text-indigo-400" />
                      Video Source
                    </label>
                    <Select
                      value={assignment?.url || 'none'}
                      onValueChange={(value) =>
                        onAssignVideo(index, value === 'none' ? null : value)
                      }
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-500 text-slate-200 focus:border-indigo-400 focus:ring-indigo-400 hover:bg-slate-700 transition-colors">
                        <SelectValue placeholder="Select video">
                          {assignment?.url && assignment.url !== 'none' ? getVideoDisplayName(assignment.url) : 'Select video'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600 shadow-lg">
                        <SelectItem value="none" className="text-slate-300 hover:bg-slate-600 focus:bg-slate-600">
                          No video assigned
                        </SelectItem>
                        {videos.map((video, videoIndex) => (
                          <SelectItem
                            key={videoIndex}
                            value={video}
                            className="text-slate-200 hover:bg-indigo-900/30 focus:bg-indigo-900/30"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm">
                                {getVideoDisplayName(video)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Name */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                      <Tag className="w-4 h-4 text-green-400" />
                      Display Name
                    </label>
                    <Input
                      value={assignment?.name || ''}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder="Enter custom name"
                      className="bg-slate-700/50 border-slate-500 text-slate-200 placeholder-slate-400 focus:border-green-400 focus:ring-green-400 hover:bg-slate-700 transition-colors"
                    />
                  </div>
                </div>

                {/* Timer Info Display */}
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-600/50">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-orange-400" />
                      <span className="text-slate-300">
                        Timer: <span className="text-orange-400 font-medium">
                          {index === 1 ? `${globalTimers.timer2}s (Timer 2)` : `${globalTimers.timer1}s (Timer 1)`}
                        </span>
                      </span>
                    </div>
                    {index !== 1 && (
                      <>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-slate-300">
                            Delay: <span className="text-blue-400 font-medium">{globalTimers.delay1}s</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-green-400" />
                          <span className="text-slate-300">
                            Message: <span className="text-green-400 font-medium">"{globalTimers.delayText1}"</span>
                          </span>
                        </div>
                      </>
                    )}
                    {index === 1 && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-slate-300">
                          Delay: <span className="text-purple-400 font-medium">0s (No delay)</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment Status */}
                <div className="mt-4 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${assignment?.url ? 'bg-green-400' : 'bg-slate-500'}`}></div>
                  <span className={`text-xs font-medium ${assignment?.url ? 'text-green-400' : 'text-slate-400'}`}>
                    {assignment?.url ? 'Video assigned' : 'No video assigned'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Section */}
        <div className="pt-4 border-t border-slate-600">
          <div className="flex justify-center">
            <Button
              onClick={onClearAll}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent border-slate-500 text-slate-200 hover:bg-red-900/30 hover:border-red-500 hover:text-red-400 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Clear All Assignments
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;