'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Calendar } from 'lucide-react';
import { getUserSettingsAction, saveUserSettingsAction } from '@/app/actions/settings';
import { toast } from 'sonner';

export function CalendarSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<{
        defaultView: "day" | "week" | "month";
        workingHoursStart: number;
        workingHoursEnd: number;
        showWeekends: boolean;
        firstDayOfWeek: number;
    }>({
        defaultView: 'week',
        workingHoursStart: 9,
        workingHoursEnd: 17,
        showWeekends: true,
        firstDayOfWeek: 0,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const result = await getUserSettingsAction();

        if (result.success && result.settings) {
            setSettings({
                defaultView: result.settings.defaultView || 'week',
                workingHoursStart: result.settings.workingHoursStart || 9,
                workingHoursEnd: result.settings.workingHoursEnd || 17,
                showWeekends: result.settings.showWeekends ?? true,
                firstDayOfWeek: result.settings.firstDayOfWeek || 0,
            });
        }

        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const result = await saveUserSettingsAction(settings);

        if (result.success) {
            toast.success('Settings saved!');
        } else {
            toast.error(result.error || 'Failed to save');
        }

        setSaving(false);
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <span>Loading settings...</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Calendar Preferences
                </CardTitle>
                <CardDescription>
                    Customize how your calendar looks and behaves
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Default View */}
                <div className="space-y-2">
                    <Label htmlFor="defaultView">Default Calendar View</Label>
                    <Select
                        value={settings.defaultView}
                        onValueChange={(value) => setSettings({ ...settings, defaultView: value as "day" | "week" | "month" })}
                    >
                        <SelectTrigger id="defaultView">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Day View</SelectItem>
                            <SelectItem value="week">Week View</SelectItem>
                            <SelectItem value="month">Month View</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Working Hours */}
                <div className="space-y-4">
                    <Label>Working Hours</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="workStart" className="text-sm text-muted-foreground">
                                Start Time
                            </Label>
                            <Select
                                value={settings.workingHoursStart.toString()}
                                onValueChange={(value) => setSettings({ ...settings, workingHoursStart: parseInt(value) })}
                            >
                                <SelectTrigger id="workStart">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <SelectItem key={i} value={i.toString()}>
                                            {i}:00
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="workEnd" className="text-sm text-muted-foreground">
                                End Time
                            </Label>
                            <Select
                                value={settings.workingHoursEnd.toString()}
                                onValueChange={(value) => setSettings({ ...settings, workingHoursEnd: parseInt(value) })}
                            >
                                <SelectTrigger id="workEnd">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 24 }, (_, i) => (
                                        <SelectItem key={i} value={i.toString()}>
                                            {i}:00
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Show Weekends */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="showWeekends">Show Weekends</Label>
                        <p className="text-sm text-muted-foreground">
                            Display Saturday and Sunday on calendar
                        </p>
                    </div>
                    <Switch
                        id="showWeekends"
                        checked={settings.showWeekends}
                        onCheckedChange={(checked) => setSettings({ ...settings, showWeekends: checked })}
                    />
                </div>

                {/* First Day of Week */}
                <div className="space-y-2">
                    <Label htmlFor="firstDay">First Day of Week</Label>
                    <Select
                        value={settings.firstDayOfWeek.toString()}
                        onValueChange={(value) => setSettings({ ...settings, firstDayOfWeek: parseInt(value) })}
                    >
                        <SelectTrigger id="firstDay">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0">Sunday</SelectItem>
                            <SelectItem value="1">Monday</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Save Button */}
                <Button onClick={handleSave} disabled={saving} className="w-full">
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Settings'
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
