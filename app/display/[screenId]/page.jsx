// app/display/[screenId]/page.jsx
'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import FullscreenView from '@/components/FullscreenView';

export default function DisplayScreen() {
  const { screenId } = useParams();
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const savedConfigs = JSON.parse(localStorage.getItem('screenConfigs') || '{}');
    const screenData = savedConfigs[screenId] || [];
    setAssignments(screenData);
  }, [screenId]);

  return (
    <FullscreenView
      assignments={assignments}
      onClose={() => window.close()}
    />
  );
}
