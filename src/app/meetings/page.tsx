"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MeetingRecorder } from "@/features/meeting-mode/components/meeting-recorder";
import { LiveTranscript } from "@/features/meeting-mode/components/live-transcript";
import { SummaryView } from "@/features/meeting-mode/components/summary-view";
import { Button } from "@/components/ui/button";
import { Mic, Loader2 } from "lucide-react";

type MeetingState = "IDLE" | "RECORDING" | "PROCESSING" | "SUMMARY";

export default function MeetingPage() {
    const [state, setState] = useState<MeetingState>("IDLE");
    const [transcript, setTranscript] = useState<string[]>([]);
    const [summaryData, setSummaryData] = useState<{ summary: string; actionItems: string[] } | null>(null);

    const handleStartRecording = () => {
        setState("RECORDING");
        setTranscript([]);
    };

    const handleStopRecording = () => {
        setState("PROCESSING");
        // Simulate AI processing time
        setTimeout(() => {
            setSummaryData({
                summary: "The team discussed the Q4 roadmap. Product launch is delayed by 2 weeks due to critical bugs in the payment gateway. Marketing needs updated assets by Friday. Engineering will focus on stability sprints.",
                actionItems: [
                    "Fix payment gateway bugs (High Priority)",
                    "Update marketing assets for Q4 launch",
                    "Schedule stability sprint planning"
                ]
            });
            setState("SUMMARY");
        }, 3000);
    };

    const handleTranscriptUpdate = (text: string) => {
        setTranscript((prev) => [...prev, text]);
    };

    const handleClose = () => {
        setState("IDLE");
        setSummaryData(null);
        setTranscript([]);
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto h-full flex flex-col items-center">

                {/* Header */}
                <div className="w-full text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Meeting Intelligence</h1>
                    <p className="text-gray-500">Focus on the conversation. We'll handle the notes.</p>
                </div>

                {/* State: IDLE */}
                {state === "IDLE" && (
                    <div className="flex flex-col items-center justify-center flex-1">
                        <Button
                            size="lg"
                            className="h-32 w-32 rounded-full shadow-xl text-lg flex flex-col gap-2 hover:scale-105 transition-transform"
                            onClick={handleStartRecording}
                        >
                            <Mic className="w-8 h-8" />
                            Start
                        </Button>
                        <p className="mt-8 text-sm text-gray-400">Ready to listen...</p>
                    </div>
                )}

                {/* State: RECORDING */}
                {state === "RECORDING" && (
                    <div className="w-full flex-1 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                        <MeetingRecorder
                            onStop={handleStopRecording}
                            onTranscriptUpdate={handleTranscriptUpdate}
                        />
                        <LiveTranscript segments={transcript} />
                    </div>
                )}

                {/* State: PROCESSING */}
                {state === "PROCESSING" && (
                    <div className="flex flex-col items-center justify-center flex-1 animate-in fade-in">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Processing Conversation...</h3>
                        <p className="text-gray-500 mt-2">Generating summary and action items.</p>
                    </div>
                )}

                {/* State: SUMMARY */}
                {state === "SUMMARY" && summaryData && (
                    <SummaryView
                        summary={summaryData.summary}
                        actionItems={summaryData.actionItems}
                        transcript={transcript}
                        onClose={handleClose}
                    />
                )}

            </div>
        </DashboardLayout>
    );
}
