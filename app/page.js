'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Settings, Eye, Plus, Trash2 } from 'lucide-react';

const screenIds = ['screen-1', 'screen-2', 'screen-3'];

export default function ScreenControlPanel() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/20">
              <Monitor className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Screen Control Center
            </h1>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Manage and control your digital displays with advanced configuration and monitoring capabilities
          </p>
        </div>

        {/* Grid of Screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {screenIds.map((screenId) => (
            <Card
              key={screenId}
              className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-blue-400" />
                    {screenId}
                  </CardTitle>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                </div>
                <p className="text-sm text-slate-400">Status: Active • Resolution: 1920x1080</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3">
                  <Button
                    variant="ghost"
                    className="group/btn w-full justify-start text-blue-300 hover:text-blue-200 font-medium px-4 py-3 border border-blue-500/30 hover:border-blue-400/50 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md hover:shadow-blue-500/20 transform hover:scale-[1.02]"
                    onClick={() => window.open(`/dashboard/${screenId}`, '_blank')}
                  >
                    <Settings className="h-4 w-4 mr-2 group-hover/btn:rotate-90 transition-transform duration-200" />
                    Configure Screen
                  </Button>

                  <Button
                    variant="ghost"
                    className="group/btn w-full justify-start text-purple-300 hover:text-purple-200 font-medium px-4 py-3 border border-purple-500/30 hover:border-purple-400/50 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md hover:shadow-purple-500/20 transform hover:scale-[1.02]"
                    onClick={() =>
                      window.open(`/dashboard/${screenId}?fullscreen=true`, '_blank')
                    }
                  >
                    <Eye className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" />
                    Launch Display
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add new screen (placeholder) */}
          <Card className="bg-slate-800/20 backdrop-blur-sm border-slate-700/30 border-dashed hover:border-slate-600/50 transition-all duration-300 opacity-60">
            <CardContent className="flex items-center justify-center h-48">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-400 text-sm">Add new screen</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm border-t border-slate-700/50 pt-6">
          <p>© 2025 Screen Control Center • Advanced Display Management System</p>
        </div>
      </div>
    </main>
  );
}
