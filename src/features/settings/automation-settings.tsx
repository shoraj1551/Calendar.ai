"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Sparkles, MessageSquare, Clock, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch"; // Assuming we have this, or will mock basic toggle

export function AutomationSettings() {
    const [isOpen, setIsOpen] = useState(false);

    // Mock Settings State (In real app, persist to DB/LocalStorage)
    const [settings, setSettings] = useState({
        prompts: true,
        scheduling: true,
        briefing: true
    });

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                    <Shield className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Shield className="w-5 h-5 text-indigo-500" />
                            AI Control Center
                        </h2>
                        <p className="text-sm text-gray-500">You are in charge. Disable any agent you don't trust.</p>
                    </div>

                    <div className="space-y-4">
                        {/* Context Prompts */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-start gap-3">
                                <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5" />
                                <div>
                                    <h4 className="font-medium">Context Whispers</h4>
                                    <p className="text-xs text-gray-500">Subtle nudges when your schedule looks risky.</p>
                                </div>
                            </div>
                            <Switch checked={settings.prompts} onCheckedChange={() => toggle('prompts')} />
                        </div>

                        {/* Auto Scheduling */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-green-500 mt-0.5" />
                                <div>
                                    <h4 className="font-medium">Auto-Scheduler</h4>
                                    <p className="text-xs text-gray-500">Allows AI to suggest times for tasks/breaks.</p>
                                </div>
                            </div>
                            <Switch checked={settings.scheduling} onCheckedChange={() => toggle('scheduling')} />
                        </div>

                        {/* Briefing */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-purple-500 mt-0.5" />
                                <div>
                                    <h4 className="font-medium">Daily Briefing</h4>
                                    <p className="text-xs text-gray-500">Morning and Evening AI summaries.</p>
                                </div>
                            </div>
                            <Switch checked={settings.briefing} onCheckedChange={() => toggle('briefing')} />
                        </div>
                    </div>

                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-100 dark:border-amber-900/30 flex gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            Disabling these means you will manage everything manually. The AI will not intervene.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
