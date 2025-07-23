import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Monitor, RotateCcw, Plus, Minus, Video, Timer, Tag, Info, Clock, MessageSquare } from 'lucide-react';
import { Input } from './ui/input';

const ControlPanel = ({
  videos,
  assignments,
  onAssignVideo,
  setAssignments,
  onClearAll
}) => {

  const [globalTimer, setGlobalTimer] = React.useState(120); // default 2 minutes

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

  const handleTimerChange = (index, timer) => {
    const updated = [...assignments];
    if (!updated[index]) updated[index] = { url: null, name: '', timerDuration: 60, delayDuration: 30, delayText: 'Restarting Video' };

    updated[index].timerDuration = parseInt(timer || '60');
    setAssignments(updated);
  };

  const handleNameChange = (index, newName) => {
    const updated = [...assignments];
    if (!updated[index]) updated[index] = { url: null, name: '', timerDuration: 60, delayDuration: 30, delayText: 'Restarting Video' };
    updated[index].name = newName;
    setAssignments(updated);
  };

  // ✅ New handler for delay duration
  const handleDelayDurationChange = (index, delayDuration) => {
    const updated = [...assignments];
    if (!updated[index]) updated[index] = { url: null, name: '', timerDuration: 60, delayDuration: 30, delayText: 'Restarting Video' };
    
    updated[index].delayDuration = parseInt(delayDuration || '30');
    setAssignments(updated);
  };

  // ✅ New handler for delay text
  const handleDelayTextChange = (index, delayText) => {
    const updated = [...assignments];
    if (!updated[index]) updated[index] = { url: null, name: '', timerDuration: 60, delayDuration: 30, delayText: 'Restarting Video' };
    
    updated[index].delayText = delayText || 'Restarting Video';
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
              Custom timer and delay settings will take effect when the video restarts
            </span>
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
                      Player {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-slate-600"></div>
                </div>

                {/* Configuration Grid - Updated to 5 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                        <SelectValue placeholder="Select video" />
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
                                {typeof video === 'string' ? video.split('/').pop() : video?.name || video?.url?.split('/').pop()}
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

                  {/* Timer */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                      <Timer className="w-4 h-4 text-orange-400" />
                      Timer (seconds)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="30"
                      value={assignment?.timerDuration ?? 60}
                      onChange={(e) => handleTimerChange(index, e.target.value)}
                      className="bg-slate-700/50 border-slate-500 text-slate-200 placeholder-slate-400 focus:border-orange-400 focus:ring-orange-400 hover:bg-slate-700 transition-colors"
                    />
                  </div>

                  {/* ✅ Delay Duration */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                      <Clock className="w-4 h-4 text-purple-400" />
                      Delay (seconds)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      placeholder="3"
                      value={assignment?.delayDuration ?? 30}
                      onChange={(e) => handleDelayDurationChange(index, e.target.value)}
                      className="bg-slate-700/50 border-slate-500 text-slate-200 placeholder-slate-400 focus:border-purple-400 focus:ring-purple-400 hover:bg-slate-700 transition-colors"
                    />
                  </div>

                  {/* ✅ Delay Text */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                      <MessageSquare className="w-4 h-4 text-pink-400" />
                      Delay Message
                    </label>
                    <Input
                      value={assignment?.delayText ?? 'Restarting Video'}
                      onChange={(e) => handleDelayTextChange(index, e.target.value)}
                      placeholder="Restarting Video"
                      className="bg-slate-700/50 border-slate-500 text-slate-200 placeholder-slate-400 focus:border-pink-400 focus:ring-pink-400 hover:bg-slate-700 transition-colors"
                    />
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