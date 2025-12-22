"use client";

import { useState } from "react";
import { Mail, Bell, Smartphone, ChevronDown, BellOff, Volume2, Flag } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function CommunicationSettings({ settings, update }: { settings: any, update: (k: string, v: any) => void }) {
    // Local state removed, using props

    const toggle = (key: string) => {
        update(key, !settings[key]);
    };

    const setChannel = (val: string) => {
        update('commChannel', val);
    };

    const setTime = (key: string, val: string) => {
        update(key, val);
    };

    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-500" />
                Communication & Noise
            </h3>

            {/* Toggles */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Daily Summary</h4>
                        <p className="text-xs text-gray-500">Get a briefing email every morning at 8 AM.</p>
                    </div>
                    <Switch checked={settings.dailySummary} onCheckedChange={() => toggle('dailySummary')} />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Weekly Insights</h4>
                        <p className="text-xs text-gray-500">Sunday report on your time usage and balance.</p>
                    </div>
                    <Switch checked={settings.weeklyInsights} onCheckedChange={() => toggle('weeklyInsights')} />
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <div className="flex items-start gap-3">
                        <Flag className="w-4 h-4 text-red-500 mt-1" />
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">Urgent-Only Mode</h4>
                            <p className="text-xs text-gray-500">Silence everything except meeting alerts starting in less than 15m.</p>
                        </div>
                    </div>
                    <Switch checked={settings.urgentOnly} onCheckedChange={() => toggle('urgentOnly')} />
                </div>
            </div>

            {/* Channels */}
            <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Notification Channel</h4>
                <RadioGroup defaultValue={settings.commChannel} onValueChange={setChannel} className="grid grid-cols-3 gap-4">
                    <div>
                        <RadioGroupItem value="push" id="push" className="peer sr-only" />
                        <Label
                            htmlFor="push"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
                        >
                            <Smartphone className="mb-3 h-6 w-6 text-gray-500" />
                            <span className="text-xs font-medium">Push</span>
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="email" id="email" className="peer sr-only" />
                        <Label
                            htmlFor="email"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
                        >
                            <Mail className="mb-3 h-6 w-6 text-gray-500" />
                            <span className="text-xs font-medium">Email</span>
                        </Label>
                    </div>
                    <div>
                        <RadioGroupItem value="in-app" id="in-app" className="peer sr-only" />
                        <Label
                            htmlFor="in-app"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
                        >
                            <Bell className="mb-3 h-6 w-6 text-gray-500" />
                            <span className="text-xs font-medium">In-App Only</span>
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            {/* Advanced: Quiet Hours */}
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen} className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-500">Advanced Controls</h4>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent">
                            <ChevronDown className={cn("w-4 h-4 transition-transform text-gray-400", isAdvancedOpen ? "transform rotate-180" : "")} />
                        </Button>
                    </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BellOff className="w-4 h-4 text-gray-500" />
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Quiet Hours</h4>
                            </div>
                            <Switch checked={settings.quietHours} onCheckedChange={() => toggle('quietHours')} />
                        </div>

                        {settings.quietHours && (
                            <div className="grid grid-cols-2 gap-4 pl-6 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500">Mute From</label>
                                    <input
                                        type="time"
                                        value={settings.quietStart}
                                        onChange={(e) => setTime('quietStart', e.target.value)}
                                        className="w-full text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded p-2"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-500">Unmute At</label>
                                    <input
                                        type="time"
                                        value={settings.quietEnd}
                                        onChange={(e) => setTime('quietEnd', e.target.value)}
                                        className="w-full text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded p-2"
                                    />
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-gray-400 pl-6">
                            Notifications will be queued and delivered silently during these hours.
                        </p>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
