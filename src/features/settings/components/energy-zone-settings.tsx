'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Loader2 } from 'lucide-react';
import { getEnergyZonesAction, saveEnergyZonesAction } from '@/app/actions/settings';
import { toast } from 'sonner';

interface EnergyZone {
    startHour: number;
    endHour: number;
    energyLevel: 'high' | 'medium' | 'low';
}

const TEMPLATES = {
    morning: [
        { startHour: 8, endHour: 12, energyLevel: 'high' as const },
        { startHour: 12, endHour: 16, energyLevel: 'medium' as const },
        { startHour: 16, endHour: 20, energyLevel: 'low' as const },
    ],
    night: [
        { startHour: 8, endHour: 12, energyLevel: 'low' as const },
        { startHour: 12, endHour: 16, energyLevel: 'medium' as const },
        { startHour: 16, endHour: 22, energyLevel: 'high' as const },
    ],
    balanced: [
        { startHour: 9, endHour: 11, energyLevel: 'high' as const },
        { startHour: 11, endHour: 14, energyLevel: 'medium' as const },
        { startHour: 14, endHour: 17, energyLevel: 'high' as const },
        { startHour: 17, endHour: 20, energyLevel: 'low' as const },
    ],
};

export function EnergyZoneSettings() {
    const [zones, setZones] = useState<EnergyZone[]>(TEMPLATES.balanced);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadZones();
    }, []);

    const loadZones = async () => {
        setLoading(true);
        const result = await getEnergyZonesAction();

        if (result.success && result.zones && result.zones.length > 0) {
            setZones(result.zones as EnergyZone[]);
        }

        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const result = await saveEnergyZonesAction(zones);

        if (result.success) {
            toast.success('Energy zones saved!');
        } else {
            toast.error(result.error || 'Failed to save');
        }

        setSaving(false);
    };

    const getEnergyColor = (level: string) => {
        switch (level) {
            case 'high': return 'bg-green-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-gray-400';
            default: return 'bg-gray-300';
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <span>Loading energy zones...</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Energy Zones
                </CardTitle>
                <CardDescription>
                    Define when you have high, medium, or low energy throughout the day.
                    This helps AI recommend optimal focus times.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Templates */}
                <div>
                    <h3 className="text-sm font-medium mb-3">Quick Templates</h3>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setZones(TEMPLATES.morning)}
                        >
                            Morning Person
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setZones(TEMPLATES.night)}
                        >
                            Night Owl
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setZones(TEMPLATES.balanced)}
                        >
                            Balanced
                        </Button>
                    </div>
                </div>

                {/* Visual Timeline */}
                <div>
                    <h3 className="text-sm font-medium mb-3">Your Energy Throughout the Day</h3>
                    <div className="relative h-16 bg-muted rounded-lg overflow-hidden">
                        {zones.map((zone, index) => {
                            const width = ((zone.endHour - zone.startHour) / 24) * 100;
                            const left = (zone.startHour / 24) * 100;

                            return (
                                <div
                                    key={index}
                                    className={`absolute h-full ${getEnergyColor(zone.energyLevel)}`}
                                    style={{
                                        left: `${left}%`,
                                        width: `${width}%`,
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* Hour markers */}
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>12 AM</span>
                        <span>6 AM</span>
                        <span>12 PM</span>
                        <span>6 PM</span>
                        <span>12 AM</span>
                    </div>
                </div>

                {/* Zone List */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium mb-2">Energy Zones</h3>
                    {zones.map((zone, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${getEnergyColor(zone.energyLevel)}`} />
                                <span className="font-medium capitalize">{zone.energyLevel} Energy</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {zone.startHour}:00 - {zone.endHour}:00
                            </span>
                        </div>
                    ))}
                </div>

                {/* Save Button */}
                <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Energy Zones'
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
