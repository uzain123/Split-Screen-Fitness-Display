import React from "react";
import { Input } from "../ui/input";
import { Timer, Globe, Clock, MessageSquare, Zap, Activity } from "lucide-react";

const GlobalTimerControls = ({
  globalTimers,
  handleGlobalTimer1Change,
  handleGlobalTimer2Change,
  handleGlobalTimer3Change,
  handleGlobalTimer4Change,
  handleDelay1Change,
  handleDelayText1Change
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-red-400 rounded-full"></div>
        <h3 className="text-lg font-semibold text-slate-200">Global Timer Controls</h3>
      </div>

      <div className="p-5 bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-700/50 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-orange-300">
              <Timer className="w-4 h-4 text-orange-400" />
              Station Timer
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

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-purple-300">
              <Timer className="w-4 h-4 text-purple-400" />
              Middle-Top Timer
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

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-red-300">
              <Globe className="w-4 h-4 text-red-400" />
              Class Timer
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-indigo-300">
              <Activity className="w-4 h-4 text-indigo-400" />
              Warm-Up Timer
            </label>
            <Input
              type="number"
              min={1}
              placeholder="120"
              value={globalTimers.timer4}
              onChange={(e) => handleGlobalTimer4Change(e.target.value)}
              className="bg-slate-700/50 border-indigo-500/50 text-slate-200 placeholder-slate-400 focus:border-indigo-400 focus:ring-indigo-400 hover:bg-slate-700 transition-colors"
            />
            <span className="text-xs text-indigo-300/70">seconds</span>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-blue-300">
              <Clock className="w-4 h-4 text-blue-400" />
              Station Timer Break
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

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-green-300">
              <MessageSquare className="w-4 h-4 text-green-400" />
              Station Break Message
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
    </div>
  );
};

export default GlobalTimerControls;
