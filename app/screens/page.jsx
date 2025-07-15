// app/screens/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ScreenControlPanel() {
    const [screens, setScreens] = useState([]);

    useEffect(() => {
        const savedConfigs = JSON.parse(localStorage.getItem('screenConfigs') || '{}');
        setScreens(Object.keys(savedConfigs).map(id => ({
            id,
            assignments: savedConfigs[id]
        })));
    }, []);

    const updateStorage = (updatedScreens) => {
        const configs = {};
        updatedScreens.forEach(screen => {
            configs[screen.id] = screen.assignments;
        });
        localStorage.setItem('screenConfigs', JSON.stringify(configs));
        setScreens(updatedScreens);
    };


    const handleAddScreen = () => {
        const newId = `screen-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const newScreen = { id: newId, assignments: [null, null, null, null] };
        updateStorage([...screens, newScreen]);
    };

    const handleRemoveScreen = (idToRemove) => {
        const updatedScreens = screens.filter(s => s.id !== idToRemove);
        updateStorage(updatedScreens);
    };
    const handleRemoveLastScreen = () => {
        if (screens.length === 0) return;

        const updated = [...screens.slice(0, -1)];
        updateStorage(updated);
    };



    return (
        <main className="p-8 space-y-6 text-white">
            <h1 className="text-3xl font-bold">Screen Launcher</h1>

            {/* Screen Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {screens.map((screen) => (
                    <Card key={screen.id} className="bg-gray-800 border-gray-700">
                        <CardHeader>
                            <CardTitle>Screen: {screen.id}</CardTitle>

                        </CardHeader>
                        <CardContent>
                            <Button
                                variant="secondary"
                                className="mt-4"
                                onClick={() => window.open(`/?screen=${screen.id}`, '_blank')}
                            >
                                Open Screen in New Tab
                            </Button>




                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Add Button */}
            <Button variant="default" onClick={handleAddScreen}>
                ➕ Add New Screen
            </Button>
            <Button variant="destructive" onClick={handleRemoveLastScreen}>
                Remove Last Screen
            </Button>
        </main>
    );
}
