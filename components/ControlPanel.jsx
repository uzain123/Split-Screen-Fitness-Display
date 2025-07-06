import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Monitor, RotateCcw } from 'lucide-react';

const ControlPanel = ({ 
  videos, 
  assignments, 
  onAssignVideo, 
  onClearAll 
}) => {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Video Assignment Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment, index) => (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Player {index + 1}
              </label>
              <Select
                value={assignment || "none"}
                onValueChange={(value) => 
                  onAssignVideo(index, value === "none" ? null : value)
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
                      {video.split('/').pop()?.replace(/\.[^/.]+$/, '') || `Video ${videoIndex + 1}`}
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
