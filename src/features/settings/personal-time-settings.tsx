"use client";

import { useState } from "react";
import { Coffee, Utensils, Zap, Shield, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SettingsHeader } from "@/features/settings/components/settings-header";

export function PersonalTimeSettings({ settings, update }: { settings: any, update: (k: string, v: any) => void }) {
    const toggle = (key: string) => {
        update(key, !settings[key]);
    };

    const setConflict = (val: string) => {
        update('conflictRule', val);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <SettingsHeader
                title="Personal Time Rules"
                description="Define your boundaries. The AI will prioritize your health and work-life balance based on these rules."
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
                        <div className="relative h-64 w-full bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col">
                            {/* Morning Focus */}
                            <div className="flex-1 border-b border-dashed border-gray-200 dark:border-gray-800 p-2 relative">
                                <span className="text-[10px] text-gray-400 absolute top-1 left-2">09:00</span>
                                {settings.focusTime && (
                                    <div className="absolute top-4 left-12 right-4 h-12 bg-purple-100 dark:bg-purple-900/30 border-l-2 border-purple-500 rounded-sm flex items-center px-2">
                                        <Zap className="w-3 h-3 text-purple-600 mr-2" />
                                        <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">Focus Block</span>
                                    </div>
                                )}
                            </div>

                            {/* Lunch */}
                            <div className="h-16 border-b border-dashed border-gray-200 dark:border-gray-800 p-2 relative bg-stripes-gray sticky z-10">
                                <span className="text-[10px] text-gray-400 absolute top-1 left-2">12:00</span>
                                {settings.lunch && (
                                    <div className="absolute top-1 bottom-1 left-12 right-4 bg-emerald-100 dark:bg-emerald-900/30 border-l-2 border-emerald-500 rounded-sm flex items-center px-2">
                                        <Utensils className="w-3 h-3 text-emerald-600 mr-2" />
                                        <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Lunch</span>
                                    </div>
                                )}
                            </div>

                            {/* Afternoon */}
                            <div className="flex-1 p-2 relative">
                                <span className="text-[10px] text-gray-400 absolute top-1 left-2">14:00</span>
                                {settings.breaks && (
                                    <div className="absolute top-8 left-12 right-4 h-6 bg-orange-100 dark:bg-orange-900/30 border-l-2 border-orange-500 rounded-sm flex items-center px-2 w-1/2">
                                        <Coffee className="w-3 h-3 text-orange-600 mr-2" />
                                        <span className="text-xs text-orange-700 dark:text-orange-300 font-medium">Break</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                        Visualizing how rules impact your schedule.
                    </p>
                </div>

                {/* Controls */}
                <div className="order-1 md:order-2 space-y-6">
                    {/* Toggles */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Lunch Block</h4>
                                <p className="text-xs text-gray-500">Keep 12:00 - 13:00 free.</p>
                            </div>
                            <Switch checked={settings.lunch} onCheckedChange={() => toggle('lunch')} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Smart Breaks</h4>
                                <p className="text-xs text-gray-500">Suggest 15m breaks after long meetings.</p>
                            </div>
                            <Switch checked={settings.breaks} onCheckedChange={() => toggle('breaks')} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Focus Defense</h4>
                                <p className="text-xs text-gray-500">Auto-decline non-urgent meetings in Focus Time.</p>
                            </div>
                            <Switch checked={settings.focusTime} onCheckedChange={() => toggle('focusTime')} />
                        </div>
                    </div>

                    <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />

                    {/* Conflict Rules */}
                    <div className="space-y-3 pt-2">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-purple-500" />
                            Meeting Overlaps
                        </h4>
                        <RadioGroup value={settings.conflictRule} onValueChange={setConflict} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                                <RadioGroupItem value="never" id="never" className="peer sr-only" />
                                <Label
                                    htmlFor="never"
                                    className="flex flex-col items-center justify-center rounded-md border border-muted bg-white dark:bg-gray-950 p-2 hover:bg-gray-50 dark:hover:bg-gray-900 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50 dark:peer-data-[state=checked]:bg-purple-900/20 cursor-pointer text-center h-20"
                                >
                                    <span className="text-xs font-semibold mb-1">Never Allow</span>
                                    <span className="text-[10px] text-gray-500 leading-tight">Auto-decline conflicts</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="ask" id="ask" className="peer sr-only" />
                                <Label
                                    htmlFor="ask"
                                    className="flex flex-col items-center justify-center rounded-md border border-muted bg-white dark:bg-gray-950 p-2 hover:bg-gray-50 dark:hover:bg-gray-900 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50 dark:peer-data-[state=checked]:bg-purple-900/20 cursor-pointer text-center h-20"
                                >
                                    <span className="text-xs font-semibold mb-1">Ask Me First</span>
                                    <span className="text-[10px] text-gray-500 leading-tight">Review each conflict</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="allow" id="allow" className="peer sr-only" />
                                <Label
                                    htmlFor="allow"
                                    className="flex flex-col items-center justify-center rounded-md border border-muted bg-white dark:bg-gray-950 p-2 hover:bg-gray-50 dark:hover:bg-gray-900 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-50 dark:peer-data-[state=checked]:bg-purple-900/20 cursor-pointer text-center h-20"
                                >
                                    <span className="text-xs font-semibold mb-1">Always Allow</span>
                                    <span className="text-[10px] text-gray-500 leading-tight">Prioritize meetings</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                {/* Visual Feedback / Analysis */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-center">
                    <div className="mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Your Typical Day</h4>
                    </div>

                    {/* Day Visualization Bar */}
                    <div className="relative h-12 w-full bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden flex">
                        {/* Morning Work */}
                        <div className="h-full bg-blue-400 dark:bg-blue-600 w-[30%] flex items-center justify-center text-[10px] text-white font-medium">Work</div>

                        {/* Lunch */}
                        <div className={cn("h-full transition-all duration-300 flex items-center justify-center text-[10px] font-medium border-l border-r border-white/20",
                            settings.lunch ? "bg-green-400 dark:bg-green-600 w-[10%] text-white" : "bg-blue-400 dark:bg-blue-600 w-[10%] text-transparent")}>
                            {settings.lunch && "Lunch"}
                        </div>

                        {/* Afternoon Work */}
                        <div className="h-full bg-blue-400 dark:bg-blue-600 w-[25%] flex items-center justify-center text-[10px] text-white font-medium">Work</div>

                        {/* Break */}
                        <div className={cn("h-full transition-all duration-300 flex items-center justify-center text-[10px] font-medium border-l border-r border-white/20",
                            settings.breaks ? "bg-orange-400 dark:bg-orange-600 w-[5%] text-white" : "bg-blue-400 dark:bg-blue-600 w-[5%] text-transparent")}>
                        </div>

                        {/* Focus Block */}
                        <div className={cn("h-full transition-all duration-300 flex items-center justify-center text-[10px] font-medium border-l border-white/20",
                            settings.focusTime ? "bg-purple-500 dark:bg-purple-700 w-[30%] text-white" : "bg-blue-400 dark:bg-blue-600 w-[30%] text-white")}>
                            {settings.focusTime ? "Focus" : "Meetings"}
                        </div>
                    </div>

                    <div className="mt-4 flex gap-4 text-xs text-gray-500 justify-center">
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span>Protected Time</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            <span>Focus Time</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
