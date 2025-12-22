"use client";

import { CheckSquare, Activity, AlertOctagon, Heart, Zap, Gavel, ArrowRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function TaskAccountabilitySettings({ settings, update }: { settings: any, update: (k: string, v: any) => void }) {
    const setTone = (val: string) => {
        update('tone', val);
    };

    const setMissedLogic = (val: string) => {
        update('missedTaskLogic', val);
    };

    const toggleEscalation = () => {
        update('allowEscalation', !settings.allowEscalation);
    };

    return (
        <div className="space-y-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-pink-500" />
                Task & Accountability
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Preview / Tone */}
                <div className="order-2 md:order-1 p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-pink-500" />
                            Coaching Tone
                        </h4>

                        {/* Chat Preview */}
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div className="bg-white dark:bg-gray-950 p-3 rounded-lg rounded-tl-none border border-gray-100 dark:border-gray-800 shadow-sm text-sm text-gray-700 dark:text-gray-300">
                                    {settings.tone === 'gentle'
                                        ? "Looks like you worked hard today! Shall we move the unfinished report to tomorrow morning?"
                                        : "You missed the report deadline. I've rescheduled it for 8 AM. No excuses tomorrow."}
                                </div>
                            </div>
                            <div className="flex gap-3 flex-row-reverse">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-medium text-gray-600">Me</span>
                                </div>
                                <div className="bg-blue-600 p-3 rounded-lg rounded-tr-none shadow-sm text-sm text-white">
                                    Sounds good, thanks.
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-6 text-center">
                        Selected Tone: <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">{settings.tone}</span>
                    </p>
                </div>

                {/* Controls */}
                <div className="order-1 md:order-2 space-y-8">
                    {/* Tone Selection */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">AI Personality</h4>
                        <RadioGroup defaultValue={settings.tone} onValueChange={setTone} className="grid grid-cols-2 gap-4">
                            <div>
                                <RadioGroupItem value="gentle" id="gentle" className="peer sr-only" />
                                <Label
                                    htmlFor="gentle"
                                    className="flex flex-col items-center justify-center rounded-md border border-muted bg-white dark:bg-gray-950 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 peer-data-[state=checked]:border-pink-500 peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-pink-500 cursor-pointer h-full"
                                >
                                    <Heart className="mb-2 h-6 w-6 text-gray-400 peer-data-[state=checked]:text-pink-500" />
                                    <span className="text-sm font-semibold">Gentle Guide</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="direct" id="direct" className="peer sr-only" />
                                <Label
                                    htmlFor="direct"
                                    className="flex flex-col items-center justify-center rounded-md border border-muted bg-white dark:bg-gray-950 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 peer-data-[state=checked]:border-pink-500 peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-pink-500 cursor-pointer h-full"
                                >
                                    <Gavel className="mb-2 h-6 w-6 text-gray-400 peer-data-[state=checked]:text-pink-500" />
                                    <span className="text-sm font-semibold">Drill Sergeant</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />

                    {/* Missed Task Logic */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <AlertOctagon className="w-4 h-4 text-orange-500" />
                            When I miss a task...
                        </h4>

                        <RadioGroup defaultValue={settings.missedTaskLogic} onValueChange={setMissedLogic} className="space-y-2">
                            <div className={cn("flex items-center space-x-3 border rounded-md p-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900", settings.missedTaskLogic === 'rollover' ? "border-pink-500 bg-pink-50/50 dark:bg-pink-900/10" : "border-gray-200 dark:border-gray-800")}>
                                <RadioGroupItem value="rollover" id="logic-rollover" />
                                <Label htmlFor="logic-rollover" className="text-sm font-medium cursor-pointer flex-1 flex items-center justify-between">
                                    <span>Auto-Rollover</span>
                                    <span className="text-xs text-gray-400 font-normal">Move to next available slot</span>
                                </Label>
                            </div>

                            <div className={cn("flex items-center space-x-3 border rounded-md p-3 transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900", settings.missedTaskLogic === 'ask' ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10" : "border-gray-200 dark:border-gray-800")}>
                                <RadioGroupItem value="ask" id="logic-ask" />
                                <Label htmlFor="logic-ask" className="text-sm font-medium cursor-pointer flex-1 flex items-center justify-between">
                                    <span>Ask Me</span>
                                    <span className="text-xs text-gray-400 font-normal">Prompt me during End-of-Day Review</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />

                    {/* Escalation Toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Social Accountability</h4>
                            <p className="text-xs text-gray-500">Post specifically chosen goals to Slack/Discord if missed.</p>
                        </div>
                        <Switch checked={settings.allowEscalation} onCheckedChange={toggleEscalation} />
                    </div>
                </div>
            </div>
        </div>
    );
}
