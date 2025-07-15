import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Monitor, RotateCcw } from 'lucide-react';

const ControlPanel = ({
  videos,
  assignments,
  onAssignVideo,
  setAssignments,
  onClearAll
}) => {
  // ✅ Use `null` (not object) for empty screen
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

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Video Assignment Control
        </CardTitle>
      </CardHeader>
      <div className="flex gap-4 pb-4">
        <Button
          onClick={handleAddScreen}
          className="bg-blue-500 text-white hover:bg-blue-400 transition-colors"
        >
          + Add Screen
        </Button>
        <Button
          onClick={handleRemoveScreen}
          disabled={assignments.length === 1}
          className={`text-white transition-colors ${
            assignments.length === 1
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          − Remove Screen
        </Button>
      </div>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment, index) => (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Player {index + 1}
              </label>
              <Select
                value={assignment || 'none'}
                onValueChange={(value) =>
                  onAssignVideo(index, value === 'none' ? null : value)
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select video" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="none" className="text-gray-300">
                    No video
                  </SelectItem>
                  {videos.map((video, videoIndex) => (
                    <SelectItem
                      key={videoIndex}
                      value={video}
                      className="text-white"
                    >
                      {video.split('/').pop()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-700">
          <Button
            variant="outline"
            onClick={onClearAll}
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All Assignments
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
