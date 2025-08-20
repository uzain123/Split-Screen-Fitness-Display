import { Button } from "./ui/button";
import { Upload, Video, Trash2 } from "lucide-react";
import React, { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const VideoUpload = ({ videos, onVideosChange }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(
    (files) => {
      const newVideos = [];

      Array.from(files).forEach((file) => {
        if (file.type.startsWith("video/")) {
          const url = URL.createObjectURL(file);
          newVideos.push({ url, name: `Uploaded Video ${videos.length + newVideos.length + 1}` });
        }
      });

      if (newVideos.length > 0) {
        onVideosChange([...videos, ...newVideos]);
      }
    },
    [videos, onVideosChange]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback(
    (e) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const removeVideo = (index) => {
    const newVideos = videos.filter((_, i) => i !== index);
    onVideosChange(newVideos);
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-white flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video Library
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-gray-500"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-300 mb-2">Drag and drop video files here, or click to browse</p>
          <p className="text-sm text-gray-500 mb-4">Supports MP4, WebM, and other video formats</p>
          <input
            type="file"
            multiple
            accept="video/*"
            onChange={handleFileInput}
            className="hidden"
            id="video-upload"
          />
          <Button
            asChild
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <label htmlFor="video-upload" className="cursor-pointer">
              Browse Files
            </label>
          </Button>
        </div>

        {videos.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-300">Uploaded Videos:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {videos.map((video, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-700 p-2 rounded"
                >
                  <span className="text-sm text-gray-300 truncate flex-1">{video.name}</span>
                  <input
                    type="text"
                    value={video.name}
                    onChange={(e) => {
                      const updatedVideos = [...videos];
                      updatedVideos[index].name = e.target.value;
                      onVideosChange(updatedVideos);
                    }}
                    placeholder="Enter video name"
                    className="ml-4 bg-gray-800 border border-gray-600 text-gray-200 text-xs px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVideo(index)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoUpload;
