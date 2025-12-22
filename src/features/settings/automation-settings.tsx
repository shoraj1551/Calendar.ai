"use client";

import { Cpu, MessageSquare, CalendarClock, ListTodo, Zap, BrainCircuit } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface AutomationSettingsProps {
    settings: any;
    update: (key: string, value: any) => void;
}

export function AutomationSettings({ settings, update }: AutomationSettingsProps) {

    const toggle = (key: string) => {
        update(key, !settings[key]);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                    <Cpu className="w-5 h-5 text-purple-500" />
                    Automation & AI Controls
                </h3>
                <p className="text-sm text-gray-500 max-w-2xl">
                    Control how proactive the assistant is. You can enable or disable specific capabilities to match your comfort level.
                    <span className="block mt-1 font-medium text-purple-600 dark:text-purple-400">
                        No hidden actions. You see exactly what the AI is allowed to do.
                    </span>
                </p>
            </div>

            <div className="grid gap-6">

                {/* 1. Rescheduling Suggestions */}
                <div className={cn(
                    "p-5 rounded-xl border transition-all duration-200",
                    settings.scheduling ? "bg-white dark:bg-gray-900 border-purple-100 dark:border-purple-900/20 shadow-sm" : "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-80"
                )}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 p-2 rounded-lg bg-pink-50 dark:bg-pink-900/10 text-pink-600 dark:text-pink-400">
                                <CalendarClock className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Rescheduling Suggestions</h4>
                                <p className="text-sm text-gray-500 max-w-md">
                                    Allow the AI to propose better time slots when you are double-booked or overloaded.
                                </p>
                                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-2 flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    When ON: You'll see "Fix Schedule" buttons on conflicting events.
                                </p>
                            </div>
                        </div>
                        <Switch checked={settings.scheduling} onCheckedChange={() => toggle('scheduling')} />
                    </div>
                </div>

                {/* 2. Task Creation from Meetings */}
                <div className={cn(
                    "p-5 rounded-xl border transition-all duration-200",
                    settings.autoTranscribe ? "bg-white dark:bg-gray-900 border-blue-100 dark:border-blue-900/20 shadow-sm" : "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-80"
                )}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400">
                                <ListTodo className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Task Extraction</h4>
                                <p className="text-sm text-gray-500 max-w-md">
                                    Automatically detect action items in meeting notes and add them to your task list.
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-2 flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    When ON: Action items appear in your "Pending" review queue.
                                </p>
                            </div>
                        </div>
                        <Switch checked={settings.autoTranscribe} onCheckedChange={() => toggle('autoTranscribe')} />
                    </div>
                </div>

                {/* 3. Daily AI Summary */}
                <div className={cn(
                    "p-5 rounded-xl border transition-all duration-200",
                    settings.briefing ? "bg-white dark:bg-gray-900 border-amber-100 dark:border-amber-900/20 shadow-sm" : "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-80"
                )}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Daily Briefing & Summary</h4>
                                <p className="text-sm text-gray-500 max-w-md">
                                    Receive a morning briefing of your day and an evening summary of what you accomplished.
                                </p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-2 flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    When ON: A "Start Day" card appears at 8:00 AM on your dashboard.
                                </p>
                            </div>
                        </div>
                        <Switch checked={settings.briefing} onCheckedChange={() => toggle('briefing')} />
                    </div>
                </div>

                {/* 4. Smart Nudges */}
                <div className={cn(
                    "p-5 rounded-xl border transition-all duration-200",
                    settings.prompts ? "bg-white dark:bg-gray-900 border-emerald-100 dark:border-emerald-900/20 shadow-sm" : "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-80"
                )}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400">
                                <BrainCircuit className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Smart Nudges</h4>
                                <p className="text-sm text-gray-500 max-w-md">
                                    Gentle reminders to take breaks, focus, or wrap up meetings that are running late.
                                </p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2 flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    When ON: You'll see small, non-intrusive toasts during work hours.
                                </p>
                            </div>
                        </div>
                        <Switch checked={settings.prompts} onCheckedChange={() => toggle('prompts')} />
                    </div>
                </div>

            </div>
        </div>
    );
}
