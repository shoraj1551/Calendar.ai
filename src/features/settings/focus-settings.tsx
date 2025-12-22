"use client";

import { Zap, BellOff, Shield, Coffee, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { SettingsHeader } from "@/features/settings/components/settings-header";

export function FocusSettings({ settings, update }: { settings: any, update: (k: string, v: any) => void }) {
    const toggle = (key: string) => {
        update(key, !settings[key]);
    };

    const setDuration = (val: number[]) => {
        update('focusDuration', val);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <SettingsHeader
                title="Focus & Deep Work"
                description="Configure how the assistant protects your deep work sessions."
                icon={Zap}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* System State Visualization */}
                <div className="p-6 bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-xl text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -marginTop-10" />

                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                            <span className="text-xs font-medium text-indigo-300 tracking-wider uppercase">System State</span>
                        </div>
                        <h4 className="text-2xl font-bold">Deep Focus Mode</h4>
                        <p className="text-indigo-200 text-sm mt-1">Cognitive protection active.</p>
                    </div>

                    <div className="space-y-4 mt-8">
                        <div className="flex items-center gap-3 text-sm text-indigo-100">
                            <Clock className="w-4 h-4 text-indigo-300" />
                            <span>{settings.focusDuration?.[0] || 45} min default session</span>
                        </div>
                        <div className={cn("flex items-center gap-3 text-sm transition-opacity", settings.silenceNotifications ? "opacity-100" : "opacity-30")}>
                            <BellOff className="w-4 h-4 text-indigo-300" />
                            <span>Notifications Silenced</span>
                        </div>
                        <div className={cn("flex items-center gap-3 text-sm transition-opacity", settings.blockMeetings ? "opacity-100" : "opacity-30")}>
                            <Shield className="w-4 h-4 text-indigo-300" />
                            <span>Calendar Blocked</span>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Default Focus Duration</h4>
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{settings.focusDuration?.[0] || 45} min</span>
                        </div>
                        <Slider
                            value={settings.focusDuration}
                            min={15}
                            max={120}
                            step={15}
                            onValueChange={setDuration}
                            className="py-2"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                            <span>15m</span>
                            <span>2h</span>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Silence Notifications</h4>
                                <p className="text-xs text-gray-500">Mute Slack/Email while focusing.</p>
                            </div>
                            <Switch checked={settings.silenceNotifications} onCheckedChange={() => toggle('silenceNotifications')} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Block Calendar</h4>
                                <p className="text-xs text-gray-500">Auto-reject meetings during focus mode.</p>
                            </div>
                            <Switch checked={settings.blockMeetings} onCheckedChange={() => toggle('blockMeetings')} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Smart Breaks</h4>
                                <p className="text-xs text-gray-500">Remind me to stretch every 45m.</p>
                            </div>
                            <Switch checked={settings.breakReminders} onCheckedChange={() => toggle('breakReminders')} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
