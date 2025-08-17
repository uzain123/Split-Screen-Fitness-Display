import React from "react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Monitor, Video, Tag, Timer, Clock, MessageSquare } from "lucide-react";

const PlayerConfiguration = ({
  assignments,
  videos,
  globalTimers,
  getVideoDisplayName,
  onAssignVideo,
  handleNameChange
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-slate-400 rounded-full"></div>
        <h3 className="text-lg font-semibold text-slate-200">Player Configuration</h3>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment, index) => (
          <div
            key={index}
            className="p-5 bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-600 text-white rounded-lg">
                <Monitor className="w-4 h-4" />
                <span className="font-semibold text-sm">
                  Player {index + 1} {index === 1 ? "(Middle Top - Timer 2)" : "(Timer 1)"}
                </span>
              </div>
              <div className="flex-1 h-px bg-slate-600"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Video className="w-4 h-4 text-indigo-400" />
                  Video Source
                </label>
                <Select
                  value={assignment?.url || "none"}
                  onValueChange={(value) => onAssignVideo(index, value === "none" ? null : value)}
                >
                  <SelectTrigger className="bg-slate-700/50 border-slate-500 text-slate-200 focus:border-indigo-400 focus:ring-indigo-400 hover:bg-slate-700 transition-colors">
                    <SelectValue placeholder="Select video">
                      {assignment?.url && assignment.url !== "none"
                        ? getVideoDisplayName(assignment.url)
                        : "Select video"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 shadow-lg">
                    <SelectItem
                      value="none"
                      className="text-slate-300 hover:bg-slate-600 focus:bg-slate-600"
                    >
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
                          <span className="text-sm">{getVideoDisplayName(video)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Tag className="w-4 h-4 text-green-400" />
                  Display Name
                </label>
                <Input
                  value={assignment?.name || ""}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  placeholder="Enter custom name"
                  className="bg-slate-700/50 border-slate-500 text-slate-200 placeholder-slate-400 focus:border-green-400 focus:ring-green-400 hover:bg-slate-700 transition-colors"
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-600/50">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-orange-400" />
                  <span className="text-slate-300">
                    Timer:{" "}
                    <span className="text-orange-400 font-medium">
                      {index === 1
                        ? `${globalTimers.timer2}s (Timer 2)`
                        : `${globalTimers.timer1}s (Timer 1)`}
                    </span>
                  </span>
                </div>
                {index !== 1 && (
                  <>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-300">
                        Delay:{" "}
                        <span className="text-blue-400 font-medium">{globalTimers.delay1}s</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300">
                        Message:{" "}
                        <span className="text-green-400 font-medium">
                          "{globalTimers.delayText1}"
                        </span>
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

            <div className="mt-4 flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  assignment?.url ? "bg-green-400" : "bg-slate-500"
                }`}
              ></div>
              <span
                className={`text-xs font-medium ${
                  assignment?.url ? "text-green-400" : "text-slate-400"
                }`}
              >
                {assignment?.url ? "Video assigned" : "No video assigned"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerConfiguration;
