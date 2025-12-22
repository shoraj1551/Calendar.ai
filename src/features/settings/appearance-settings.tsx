"use client";

import { Monitor, Type, CalendarDays, Clock, Sun, Moon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SettingsHeader } from "@/features/settings/components/settings-header";

export function AppearanceSettings({ settings, update }: { settings: any, update: (k: string, v: any) => void }) {
    const setSetting = (key: string, val: string) => {
        update(key, val);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <SettingsHeader
                title="Appearance & Basics"
                description="Customize your experience for maximum comfort."
                icon={Monitor}
            />

            <div className="grid gap-8">

                {/* 1. Theme Selection - Minimal Cards */}
                <div className="space-y-4">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 uppercase tracking-wider text-xs font-bold text-gray-400">Theme</h4>
                    <RadioGroup value={settings.theme} onValueChange={(val) => setSetting('theme', val)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
                            <Label
                                htmlFor="theme-light"
                                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-transparent bg-white shadow-sm hover:bg-gray-50 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50/50 cursor-pointer transition-all h-24"
                            >
                                <Sun className="w-6 h-6 text-orange-400 mb-2" />
                                <span className="text-sm font-medium text-gray-700">Light Mode</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
                            <Label
                                htmlFor="theme-dark"
                                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-transparent bg-gray-900 shadow-sm hover:bg-gray-800 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-gray-800 cursor-pointer transition-all h-24"
                            >
                                <Moon className="w-6 h-6 text-blue-400 mb-2" />
                                <span className="text-sm font-medium text-gray-200">Dark Mode</span>
                            </Label>
                        </div>
                        <div>
                            <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
                            <Label
                                htmlFor="theme-system"
                                className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-transparent bg-gray-100 shadow-sm hover:bg-gray-200 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-gray-200 cursor-pointer transition-all h-24"
                            >
                                <Monitor className="w-6 h-6 text-gray-500 mb-2" />
                                <span className="text-sm font-medium text-gray-700">System Default</span>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />

                {/* 2. Basic Formats - Clean Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Week Start */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-gray-400" />
                            <Label className="font-medium text-gray-900 dark:text-gray-100">Week Starts On</Label>
                        </div>
                        <Select value={settings.weekStart} onValueChange={(val) => setSetting('weekStart', val)}>
                            <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                                <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sunday">Sunday (US Standard)</SelectItem>
                                <SelectItem value="monday">Monday (ISO Standard)</SelectItem>
                                <SelectItem value="saturday">Saturday</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Time Format */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <Label className="font-medium text-gray-900 dark:text-gray-100">Time Format</Label>
                        </div>
                        <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 w-fit">
                            <button
                                onClick={() => setSetting('timeFormat', '12')}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                    settings.timeFormat === '12'
                                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                12h (1:00 PM)
                            </button>
                            <button
                                onClick={() => setSetting('timeFormat', '24')}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                    settings.timeFormat === '24'
                                        ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                24h (13:00)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
