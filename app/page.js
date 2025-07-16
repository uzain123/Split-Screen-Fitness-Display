// // app/screens/page.jsx
// 'use client';
// import { useEffect, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// export default function ScreenControlPanel() {
//   const [screens, setScreens] = useState([]);

//   useEffect(() => {
//     const savedConfigs = JSON.parse(localStorage.getItem('screenConfigs') || '{}');
//     setScreens(Object.keys(savedConfigs).map(id => ({
//       id,
//       assignments: savedConfigs[id]
//     })));
//   }, []);

//   const updateStorage = (updatedScreens) => {
//     const configs = {};
//     updatedScreens.forEach(screen => {
//       configs[screen.id] = screen.assignments;
//     });
//     localStorage.setItem('screenConfigs', JSON.stringify(configs));
//     setScreens(updatedScreens);
//   };


//   const handleAddScreen = () => {
//     const newId = `screen-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
//     const newScreen = { id: newId, assignments: [null, null, null, null] };
//     updateStorage([...screens, newScreen]);
//   };

//   const handleRemoveScreen = (idToRemove) => {
//     const updatedScreens = screens.filter(s => s.id !== idToRemove);
//     updateStorage(updatedScreens);
//   };
//   const handleRemoveLastScreen = () => {
//     if (screens.length === 0) return;

//     const updated = [...screens.slice(0, -1)];
//     updateStorage(updated);
//   };



//   return (
//     <main className="p-8 space-y-6 text-white">
//       <h1 className="text-3xl font-bold">Screen Launcher</h1>

//       {/* Screen Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {screens.map((screen) => (
//           <Card key={screen.id} className="bg-gray-800 border-gray-700">
//             <CardHeader>
//               <CardTitle>Screen: {screen.id}</CardTitle>

//             </CardHeader>
//             <CardContent>
//               <Button
//                 variant="secondary"
//                 onClick={() =>
//                   window.open(`/dashboard?screen=${screen.id}`, '_blank')
//                 }
//               >
//                 Open Display in New Tab
//               </Button>





//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Add Button */}
// {/* <Button variant="default" onClick={handleAddScreen}> */}
// <Button variant="default">
//   ➕ Add New Screen
// </Button>
// {/* <Button variant="destructive" onClick={handleRemoveLastScreen}> */}
//   <Button variant="destructive" >
//   Remove Last Screen
// </Button>
//     </main>
//   );
// }

'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Settings, Eye, Plus, Trash2, Activity } from 'lucide-react';

export default function ScreenControlPanel() {
  const screenId = 'screen-1';

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
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

  

        {/* Screen Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-800/40 backdrop-blur-sm border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-white flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-blue-400" />
                  {screenId}
                </CardTitle>
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm text-slate-400">Status: Active • Resolution: 1920x1080</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                <Button
                  variant="ghost"
                  className="
                    group/btn w-full justify-start
                    text-blue-300 hover:text-blue-200
                    font-medium px-4 py-3
                    border border-blue-500/30 hover:border-blue-400/50
                    rounded-lg
                    bg-blue-500/10 hover:bg-blue-500/20
                    transition-all duration-200 ease-in-out
                    shadow-sm hover:shadow-md hover:shadow-blue-500/20
                    transform hover:scale-[1.02]
                  "
                  onClick={() =>
                    window.open(`/dashboard?screen=${screenId}`, '_blank')
                  }
                >
                  <Settings className="h-4 w-4 mr-2 group-hover/btn:rotate-90 transition-transform duration-200" />
                  Configure Screen
                </Button>

                <Button
                  variant="ghost"
                  className="
                    group/btn w-full justify-start
                    text-purple-300 hover:text-purple-200
                    font-medium px-4 py-3
                    border border-purple-500/30 hover:border-purple-400/50
                    rounded-lg
                    bg-purple-500/10 hover:bg-purple-500/20
                    transition-all duration-200 ease-in-out
                    shadow-sm hover:shadow-md hover:shadow-purple-500/20
                    transform hover:scale-[1.02]
                  "
                  onClick={() =>
                    window.open(`/dashboard?screen=${screenId}&fullscreen=true`, '_blank')
                  }
                >
                  <Eye className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" />
                  Launch Display
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder cards for future screens */}
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

          <Card className="bg-slate-800/20 backdrop-blur-sm border-slate-700/30 border-dashed hover:border-slate-600/50 transition-all duration-300 opacity-60">
            <CardContent className="flex items-center justify-center h-48">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto">
                  <Monitor className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-400 text-sm">Screen slot available</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            variant="default"
            className="
              opacity-50 cursor-not-allowed
              bg-gradient-to-r from-slate-600 to-slate-700
              hover:from-slate-600 hover:to-slate-700
              text-slate-400 hover:text-slate-400
              border border-slate-600
              rounded-lg
              px-6 py-3
              font-medium
              shadow-none
              transform-none
              transition-none
              flex items-center gap-2
            "
            disabled
          >
            <Plus className="h-4 w-4" />
            Add New Screen
          </Button>

          <Button
            variant="destructive"
            className="
              opacity-50 cursor-not-allowed
              bg-gradient-to-r from-red-900/50 to-red-800/50
              hover:from-red-900/50 hover:to-red-800/50
              text-red-400 hover:text-red-400
              border border-red-800/50
              rounded-lg
              px-6 py-3
              font-medium
              shadow-none
              transform-none
              transition-none
              flex items-center gap-2
            "
            disabled
          >
            <Trash2 className="h-4 w-4" />
            Remove Screen
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm border-t border-slate-700/50 pt-6">
          <p>© 2025 Screen Control Center • Advanced Display Management System</p>
        </div>
      </div>
    </main>
  );
}
