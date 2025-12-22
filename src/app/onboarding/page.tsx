"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { InsightReveal } from "@/features/onboarding/components/insight-reveal";

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        workStart: "09:00",
        workEnd: "17:00",
        protectLunch: true
    });

    const handleNext = () => setStep(prev => prev + 1);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">

            <div className="w-full max-w-xl">
                {/* Step 1: Welcome & Connection */}
                {step === 1 && (
                    <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Welcome to Calendar.ai
                        </h1>
                        <p className="text-xl text-gray-500">
                            Let's set up your intelligent time agent. It takes less than 2 minutes.
                        </p>

                        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-medium">Google Calendar</span>
                                <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold uppercase">Connected</span>
                            </div>
                            <p className="text-sm text-gray-500 text-left">
                                We've successfully synced your events. We only read availability to verify conflicts; your data is private.
                            </p>
                        </div>

                        <Button size="lg" className="w-full text-lg h-12" onClick={handleNext}>
                            Continue
                        </Button>
                    </div>
                )}

                {/* Step 2: Calibration */}
                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Refine Your Schedule</h2>
                            <p className="text-gray-500 mt-2">When do you actually work?</p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Start Time</Label>
                                    <Input
                                        type="time"
                                        value={formData.workStart}
                                        onChange={(e) => setFormData({ ...formData, workStart: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Time</Label>
                                    <Input
                                        type="time"
                                        value={formData.workEnd}
                                        onChange={(e) => setFormData({ ...formData, workEnd: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Protect Lunch Hours</Label>
                                    <p className="text-sm text-gray-500">Auto-block 30m if 11:30-14:30 is busy.</p>
                                </div>
                                <Switch
                                    checked={formData.protectLunch}
                                    onCheckedChange={(c) => setFormData({ ...formData, protectLunch: c })}
                                />
                            </div>
                        </div>

                        <Button size="lg" className="w-full text-lg h-12" onClick={handleNext}>
                            Analyze My Schedule
                        </Button>
                    </div>
                )}

                {/* Step 3: Analysis & Result */}
                {step === 3 && (
                    <InsightReveal onComplete={async () => {
                        await fetch("/api/onboarding/complete", {
                            method: "POST",
                            body: JSON.stringify({
                                workStart: formData.workStart,
                                workEnd: formData.workEnd
                            })
                        });
                        // navigate logic is inside InsightReveal/Button if we want, or here. 
                        // But since InsightReveal button calls onComplete, we can do the navigation there if we passed router, 
                        // or better yet, make onComplete handle everything.
                        // Wait... InsightReveal's button calls onComplete. 
                        // Let's make this function do the navigation too.
                        window.location.href = "/dashboard";
                    }} />
                )}
            </div>
        </div>
    );
}
