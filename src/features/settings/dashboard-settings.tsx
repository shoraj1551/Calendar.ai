"use client";

import { useState } from "react";
import { LayoutDashboard, BarChart3, PieChart, TrendingUp, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { SettingsHeader } from "@/features/settings/components/settings-header";

export function DashboardSettings({ settings, update }: { settings: any, update: (k: string, v: any) => void }) {
    const toggle = (key: string) => {
        update(key, !settings[key]);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <SettingsHeader
                title="Dashboard & Insights"
                description="Customize what you see on your daily command center."
                icon={LayoutDashboard}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Preview */}
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center items-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/20" />
                    <div className="relative z-10 w-full max-w-xs space-y-4">
                        {/* Score Card */}
                        <div className={cn("p-4 bg-white dark:bg-gray-950 shadow-sm rounded-lg border border-gray-100 dark:border-gray-800 transition-all duration-300",
                            !settings.showScore ? "opacity-40 blur-[2px] grayscale" : "scale-105 ring-2 ring-pink-500/20")}>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">Schedule Alignment</h4>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">85%</div>
                        </div>

                        {/* Categories */}
                        <div className={cn("flex gap-2 justify-center transition-all duration-300", !settings.showCategories && "opacity-40 blur-[1px]")}>
                            <div className="h-2 w-8 bg-blue-500 rounded-full" />
                            <div className="h-2 w-12 bg-green-500 rounded-full" />
                            <div className="h-2 w-6 bg-orange-500 rounded-full" />
                        </div>
                    </div>

                    {!settings.showScore && !settings.showCategories && !settings.showTrends && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm bg-white/10">
                            <div className="bg-white dark:bg-gray-950 px-4 py-2 rounded-full shadow-sm text-xs font-medium text-gray-500 flex items-center gap-2">
                                <EyeOff className="w-3 h-3" />
                                Minimalist Mode
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded text-pink-600 dark:text-pink-400">
                                    <BarChart3 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Productivity Score</h4>
                                    <p className="text-xs text-gray-500">Hide this if it causes anxiety.</p>
                                </div>
                            </div>
                            <Switch checked={settings.showScore} onCheckedChange={() => toggle('showScore')} />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400">
                                    <PieChart className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Time Categories</h4>
                                    <p className="text-xs text-gray-500">Show breakdown of Deep Work vs. Meetings.</p>
                                </div>
                            </div>
                            <Switch checked={settings.showCategories} onCheckedChange={() => toggle('showCategories')} />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded text-purple-600 dark:text-purple-400">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Historical Trends</h4>
                                    <p className="text-xs text-gray-500">Compare this week to previous weeks.</p>
                                </div>
                            </div>
                            <Switch checked={settings.showTrends} onCheckedChange={() => toggle('showTrends')} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
