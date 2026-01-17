"use client";

import { useState } from "react";
import { Coffee, Utensils, Zap, Shield, Calendar as CalendarIcon, Clock, Battery, BatteryCharging, BatteryWarning } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SettingsHeader } from "@/features/settings/components/settings-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export function PersonalTimeSettings({ settings, update }: { settings: any, update: (k: string, v: any) => void }) {
    const toggle = (key: string) => {
        update(key, !settings[key]);
    };

    const setConflict = (val: string) => {
        update('conflictRule', val);
    };

    // Chronotype presets (mapped to energy zones)
    const setChronotype = (type: string) => {
        // In a real app, this would trigger a backend update to populate user_energy_zones
        // For UI state, we might store 'chronotype' in settings
        update('chronotype', type);
    };

    const chronotype = settings.chronotype || 'bear'; // bear, wolf, lion, dolphin

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <SettingsHeader
                title="Personal Time & Energy"
                description="Define your boundaries and energy rhythms. The AI will prioritize your health and work-life balance."
                icon={Clock}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Preview */}
                <div className="order-2 md:order-1 p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-500" />
                            Your Typical Day
                        </h4>

                        {/* Day Visualization */}
                        <div className="relative h-80 w-full bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
                            {/* Morning Focus (High Energy) */}
                            <div className="flex-1 border-b border-dashed border-gray-200 dark:border-gray-800 p-2 relative bg-yellow-50/50 dark:bg-yellow-900/10">
                                <span className="text-[10px] text-gray-400 absolute top-1 left-2">09:00</span>
                                <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-medium text-yellow-600 dark:text-yellow-400">
                                    <Zap className="w-3 h-3 fill-current" /> High Energy
                                </div>
                                {settings.focusTime && (
                                    <div className="absolute top-8 left-12 right-4 h-16 bg-purple-100 dark:bg-purple-900/30 border-l-2 border-purple-500 rounded-sm flex items-center px-2 shadow-sm">
                                        <Zap className="w-3 h-3 text-purple-600 mr-2" />
                                        <div className="flex flex-col">
                                            <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">Deep Work</span>
                                            <span className="text-[10px] text-purple-500">Recommended for Peak Energy</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Lunch (Dip) */}
                            <div className="h-20 border-b border-dashed border-gray-200 dark:border-gray-800 p-2 relative bg-stripes-gray sticky z-10">
                                <span className="text-[10px] text-gray-400 absolute top-1 left-2">12:00</span>
                                {settings.lunch && (
                                    <div className="absolute top-2 bottom-2 left-12 right-4 bg-emerald-100 dark:bg-emerald-900/30 border-l-2 border-emerald-500 rounded-sm flex items-center px-2">
                                        <Utensils className="w-3 h-3 text-emerald-600 mr-2" />
                                        <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Lunch & Recharge</span>
                                    </div>
                                )}
                            </div>

                            {/* Afternoon (Dip/Medium) */}
                            <div className="flex-1 p-2 relative bg-blue-50/30 dark:bg-blue-900/5">
                                <span className="text-[10px] text-gray-400 absolute top-1 left-2">14:00</span>
                                <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-medium text-blue-500 dark:text-blue-400">
                                    <Battery className="w-3 h-3" /> Medium Energy
                                </div>
                                {settings.breaks && (
                                    <div className="absolute top-10 left-12 right-4 h-8 bg-orange-100 dark:bg-orange-900/30 border-l-2 border-orange-500 rounded-sm flex items-center px-2 w-2/3">
                                        <Coffee className="w-3 h-3 text-orange-600 mr-2" />
                                        <span className="text-xs text-orange-700 dark:text-orange-300 font-medium">Recovery Break</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                        Visualizing how energy zones align with your schedule.
                    </p>
                </div>

                {/* Controls */}
                <div className="order-1 md:order-2 space-y-6">

                    {/* Energy Profile Section */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                            <BatteryCharging className="w-4 h-4 text-amber-500" />
                            Energy Profile
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div
                                onClick={() => setChronotype('bear')}
                                className={cn("cursor-pointer border rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all",
                                    chronotype === 'bear' ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-500" : "border-gray-200 dark:border-gray-800")}
                            >
                                <div className="text-sm font-medium mb-1">🐻 Bear (Normal)</div>
                                <div className="text-[10px] text-gray-500">Peak: 10am - 2pm</div>
                            </div>
                            <div
                                onClick={() => setChronotype('wolf')}
                                className={cn("cursor-pointer border rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all",
                                    chronotype === 'wolf' ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500" : "border-gray-200 dark:border-gray-800")}
                            >
                                <div className="text-sm font-medium mb-1">🐺 Wolf (Night)</div>
                                <div className="text-[10px] text-gray-500">Peak: 5pm - 9pm</div>
                            </div>
                            <div
                                onClick={() => setChronotype('lion')}
                                className={cn("cursor-pointer border rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all",
                                    chronotype === 'lion' ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 ring-1 ring-yellow-500" : "border-gray-200 dark:border-gray-800")}
                            >
                                <div className="text-sm font-medium mb-1">🦁 Lion (Morning)</div>
                                <div className="text-[10px] text-gray-500">Peak: 8am - 12pm</div>
                            </div>
                            <div
                                onClick={() => setChronotype('dolphin')}
                                className={cn("cursor-pointer border rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all",
                                    chronotype === 'dolphin' ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 ring-1 ring-cyan-500" : "border-gray-200 dark:border-gray-800")}
                            >
                                <div className="text-sm font-medium mb-1">🐬 Dolphin (Erratic)</div>
                                <div className="text-[10px] text-gray-500">Peak: 10am - 12pm</div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Toggles */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Lunch Protection</h4>
                                <p className="text-xs text-gray-500">Ensure time for fuel (12-1 PM).</p>
                            </div>
                            <Switch checked={settings.lunch} onCheckedChange={() => toggle('lunch')} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Smart Recovery</h4>
                                <p className="text-xs text-gray-500">Insert 15m breaks when energy dips.</p>
                            </div>
                            <Switch checked={settings.breaks} onCheckedChange={() => toggle('breaks')} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Focus Defense</h4>
                                <p className="text-xs text-gray-500">Auto-decline meetings in Peak Zones.</p>
                            </div>
                            <Switch checked={settings.focusTime} onCheckedChange={() => toggle('focusTime')} />
                        </div>
                    </div>

                    <Separator />

                    {/* Conflict Rules */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-purple-500" />
                            Overlap Strategy
                        </h4>
                        <RadioGroup value={settings.conflictRule} onValueChange={setConflict} className="grid grid-cols-3 gap-2">
                            <Label
                                htmlFor="ask"
                                className={cn("flex flex-col items-center justify-center rounded-md border border-muted p-2 hover:bg-gray-50 cursor-pointer text-center h-16", settings.conflictRule === 'ask' && "border-purple-500 bg-purple-50")}
                            >
                                <RadioGroupItem value="ask" id="ask" className="sr-only" />
                                <span className="text-xs font-semibold">Ask First</span>
                            </Label>
                            <Label
                                htmlFor="never" // mapped to Auto-Decline
                                className={cn("flex flex-col items-center justify-center rounded-md border border-muted p-2 hover:bg-gray-50 cursor-pointer text-center h-16", settings.conflictRule === 'never' && "border-red-500 bg-red-50")}
                            >
                                <RadioGroupItem value="never" id="never" className="sr-only" />
                                <span className="text-xs font-semibold">Strict</span>
                            </Label>
                            <Label
                                htmlFor="allow"
                                className={cn("flex flex-col items-center justify-center rounded-md border border-muted p-2 hover:bg-gray-50 cursor-pointer text-center h-16", settings.conflictRule === 'allow' && "border-green-500 bg-green-50")}
                            >
                                <RadioGroupItem value="allow" id="allow" className="sr-only" />
                                <span className="text-xs font-semibold">Flexible</span>
                            </Label>
                        </RadioGroup>
                    </div>
                </div>
            </div>
        </div>
    );
}
