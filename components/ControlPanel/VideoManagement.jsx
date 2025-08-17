import React, { useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Upload, Edit2, Trash2, Check, X, FolderOpen } from "lucide-react";

const VideoManagement = ({
  videos,
  uploading,
  deleting,
  renaming,
  newName,
  setNewName,
  getVideoDisplayName,
  handleFileUpload,
  handleDeleteVideo,
  startRename,
  cancelRename,
  submitRename
}) => {
  const fileInputRef = useRef(null);

  const onFileChange = (event) => {
    const file = event.target.files[0];
    handleFileUpload(file, fileInputRef);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full"></div>
        <h3 className="text-lg font-semibold text-slate-200">Video Management</h3>
      </div>

      <div className="p-5 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-700/50 rounded-xl">
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,video/mp4"
            onChange={onFileChange}
            className="hidden"
          />
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full w-4 h-4 border-2 border-white border-t-transparent"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload MP4 Video
                </>
              )}
            </Button>
            <p className="text-xs text-slate-400">📹 Only MP4 files are supported (Max: 500MB)</p>
          </div>
        </div>

        {videos.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Available Videos ({videos.length})
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {videos.map((video, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600/50"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>

                  {renaming === video ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && submitRename(video)}
                        className="flex-1 h-8 bg-slate-700/50 border-slate-500 text-slate-200 text-sm"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => submitRename(video)}
                        className="h-8 px-2 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={cancelRename}
                        variant="outline"
                        className="h-8 px-2 border-slate-500 text-slate-300 hover:bg-slate-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-slate-200 truncate">
                        {getVideoDisplayName(video)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={() => startRename(video)}
                          variant="ghost"
                          className="h-8 px-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/20"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => handleDeleteVideo(video)}
                          disabled={deleting === video}
                          variant="ghost"
                          className="h-8 px-2 text-slate-400 hover:text-red-400 hover:bg-red-900/20 disabled:opacity-50"
                        >
                          {deleting === video ? (
                            <div className="animate-spin rounded-full w-3 h-3 border-2 border-red-400 border-t-transparent"></div>
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoManagement;
