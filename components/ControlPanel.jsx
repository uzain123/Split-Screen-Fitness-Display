import React from "react";
import { Button } from "./ui/button";
import { Info, Monitor, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import VideoManagement from "./ControlPanel/VideoManagement";
import DisplayManagement from "./ControlPanel/DisplayManagement";
import GlobalTimerControls from "./ControlPanel/GlobalTimerControls";
import PlayerConfiguration from "./ControlPanel/PlayerConfiguration";
import { useVideoOperations } from "../hooks/useVideoOperations";
import { useTimerControls } from "../hooks/useTimerControls";

const ControlPanel = ({
  videos,
  assignments,
  onAssignVideo,
  setAssignments,
  onClearAll,
  globalTimers,
  setGlobalTimers,
  setVideos
}) => {
  const videoOperations = useVideoOperations(setVideos, assignments, setAssignments);
  const timerControls = useTimerControls(
    globalTimers,
    setGlobalTimers,
    assignments,
    setAssignments
  );

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
    if (!updated[index])
      updated[index] = {
        url: null,
        name: "",
        timerDuration: 60,
        delayDuration: 30,
        delayText: "Restarting Video"
      };
    updated[index].name = newName;
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
              Global timer settings will apply to all videos. Timer 1 affects all displays except
              middle top, Timer 2 affects only middle top, Timer 3 is global pause timer.
            </span>
          </div>
        </div>

        {/* Video Management Section */}
        <VideoManagement
          videos={videos}
          uploading={videoOperations.uploading}
          deleting={videoOperations.deleting}
          renaming={videoOperations.renaming}
          newName={videoOperations.newName}
          setNewName={videoOperations.setNewName}
          getVideoDisplayName={videoOperations.getVideoDisplayName}
          handleFileUpload={videoOperations.handleFileUpload}
          handleDeleteVideo={videoOperations.handleDeleteVideo}
          startRename={videoOperations.startRename}
          cancelRename={videoOperations.cancelRename}
          submitRename={videoOperations.submitRename}
        />

        {/* Global Timer Controls Section */}
        <GlobalTimerControls
          globalTimers={globalTimers}
          handleGlobalTimer1Change={timerControls.handleGlobalTimer1Change}
          handleGlobalTimer2Change={timerControls.handleGlobalTimer2Change}
          handleGlobalTimer3Change={timerControls.handleGlobalTimer3Change}
          handleGlobalTimer4Change={timerControls.handleGlobalTimer4Change}
          handleDelay1Change={timerControls.handleDelay1Change}
          handleDelayText1Change={timerControls.handleDelayText1Change}
        />

        {/* Display Management Section */}
        <DisplayManagement
          assignments={assignments}
          handleAddScreen={handleAddScreen}
          handleRemoveScreen={handleRemoveScreen}
        />

        {/* Player Configuration Section */}
        <PlayerConfiguration
          assignments={assignments}
          videos={videos}
          globalTimers={globalTimers}
          getVideoDisplayName={videoOperations.getVideoDisplayName}
          onAssignVideo={onAssignVideo}
          handleNameChange={handleNameChange}
        />

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
