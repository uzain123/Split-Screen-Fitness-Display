'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import FullscreenView from '@/components/FullscreenView';

export default function DisplayScreen() {
  const { screenId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [globalTimer3, setGlobalTimer3] = useState(2700); // 45 minutes default
  const [globalTimers, setGlobalTimers] = useState({});

  useEffect(() => {
    // Load screen-specific configurations
    const savedConfigs = JSON.parse(localStorage.getItem('screenConfigs') || '{}');
    const screenData = savedConfigs[screenId] || [];
    setAssignments(screenData);

    // Load global timer settings
    const savedGlobalTimer = localStorage.getItem('globalTimer3');
    if (savedGlobalTimer) {
      setGlobalTimer3(parseInt(savedGlobalTimer));
    }

    // Load additional timer configurations if needed
    const savedGlobalTimers = JSON.parse(localStorage.getItem('globalTimers') || '{}');
    setGlobalTimers(savedGlobalTimers);

    console.log(`🖥️ Display screen ${screenId} initialized with WebSocket support`);
  }, [screenId]);

  const handleClose = () => {
    console.log(`🖥️ Display screen ${screenId} closing`);
    window.close();
  };

  return (
    <FullscreenView
      assignments={assignments}
      onClose={handleClose}
      globalTimer3={globalTimer3}
      globalTimers={globalTimers}
      screenId={screenId} // Pass screenId for WebSocket identification
    />
  );
}