"use client";

import { useState, useEffect } from "react";
import { Mic, Square, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MeetingRecorderProps {
    onStop: () => void;
    onTranscriptUpdate: (text: string) => void;
}

export function MeetingRecorder({ onStop, onTranscriptUpdate }: MeetingRecorderProps) {
    const [isPaused, setIsPaused] = useState(false);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!isPaused) {
            interval = setInterval(() => {
                setDuration((prev) => prev + 1);
                // Mock Transcript Update for demo effect
                if (Math.random() > 0.8) {
                    const phrases = ["Okay, let's move on.", "Action item for next week.", "I agree with that assessment.", "What about the timeline?"];
                    onTranscriptUpdate(phrases[Math.floor(Math.random() * phrases.length)]);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPaused, onTranscriptUpdate]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 w-full max-w-2xl mx-auto">
            {/* Audio Visualizer (CSS Animation) */}
            <div className="flex items-center gap-1 h-16 mb-8">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-2 bg-blue-500 rounded-full transition-all duration-300 ease-in-out",
                            isPaused ? "h-2 opacity-50" : "animate-pulse"
                        )}
                        style={{
                            height: isPaused ? "8px" : `${Math.random() * 48 + 16}px`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: "0.8s"
                        }}
                    />
                ))}
            </div>

            <div className="text-4xl font-mono font-bold text-gray-900 dark:text-gray-100 mb-8 tracking-wider">
                {formatTime(duration)}
            </div>

            <div className="flex items-center gap-6">
                <Button
                    variant="outline"
                    size="lg"
                    className="h-14 w-14 rounded-full border-2"
                    onClick={() => setIsPaused(!isPaused)}
                >
                    {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
                </Button>

                <Button
                    variant="destructive"
                    size="lg"
                    className="h-20 w-20 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-red-500 hover:bg-red-600 border-4 border-red-100 dark:border-red-900/30"
                    onClick={onStop}
                >
                    <Square className="w-8 h-8 fill-current" />
                </Button>
            </div>

            <p className="mt-8 text-sm text-gray-400 animate-pulse">
                {isPaused ? "Recording paused" : "AI is listening & transcribing..."}
            </p>
        </div>
    );
}
