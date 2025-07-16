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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Video Assignment Control
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2 justify-center">
          <Button
            onClick={handleAddScreen}
            disabled={assignments.length >= 6}
            variant="outline"
            size="sm"
          >
            + Add Display
          </Button>

          <Button
            onClick={handleRemoveScreen}
            disabled={assignments.length <= 1}
            variant="outline"
            size="sm"
          >
            − Remove Display
          </Button>
        </div>

        <div className="space-y-3">
          {assignments.map((assignment, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex items-center gap-2 min-w-0 w-24">
                <Monitor className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-sm">
                  Player {index + 1}
                </span>
              </div>

              <div className="flex-1">
                <Select
                  value={assignment || 'none'}
                  onValueChange={(value) =>
                    onAssignVideo(index, value === 'none' ? null : value)
                  }
                >
                  <SelectTrigger className="bg-blue border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="none" className="text-gray-300 hover:bg-slate-700 focus:bg-slate-700">
                      No video
                    </SelectItem>
                    {videos.map((video, videoIndex) => (
                      <SelectItem
                        key={videoIndex}
                        value={video}
                        className="text-gray-100 hover:bg-slate-700 focus:bg-slate-700"
                      >
                        <p className="text-xs text-right text-gray-400">
                          {video?.name || (typeof video === 'string' ? video.split('/').pop() : video?.url?.split('/').pop())}
                        </p>

                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-2">
          <Button
            onClick={onClearAll}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All Assignments
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;