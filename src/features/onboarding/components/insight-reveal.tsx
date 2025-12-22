"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export function InsightReveal({ onComplete }: { onComplete: () => Promise<void> }) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const steps = [
            () => setStep(1), // Analyzing...
            () => setStep(2), // Found conflicts...
            () => setStep(3), // Ready
        ];

        let delay = 0;
        steps.forEach((s, i) => {
            delay += i === 0 ? 1000 : 2000;
            setTimeout(s, delay);
        });
    }, []);

    if (step === 0) return null;

    return (
        <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">

            {step === 1 && (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-xl font-medium text-gray-700 dark:text-gray-300">Analyzing your schedule...</p>
                </div>
            )}

            {step === 2 && (
                <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                        <Sparkles className="w-8 h-8 text-orange-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Found 3 Time Leaks</h3>
                    <p className="text-gray-500">You have 5 hours of fragmented time next week. We can fix that.</p>
                </div>
            )}

            {step === 3 && (
                <Card className="p-8 max-w-md mx-auto border-2 border-blue-500 shadow-xl bg-white dark:bg-gray-900">
                    <div className="flex flex-col items-center gap-6">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">You're All Set!</h2>
                            <p className="text-gray-500">Your intelligent agent is active and protecting your time.</p>
                        </div>
                        <Button
                            size="lg"
                            className="w-full text-lg h-12 gap-2"
                            onClick={async () => {
                                await onComplete();
                            }}
                        >
                            Go to Dashboard <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
