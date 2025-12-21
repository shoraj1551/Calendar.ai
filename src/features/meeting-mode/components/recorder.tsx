"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Loader2 } from "lucide-react";
import { MeetingRecorder } from "@/lib/audio";
import { useRouter } from "next/navigation";

export function MeetingRecorderUI() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const recorder = useRef<MeetingRecorder | null>(null);
    const router = useRouter();

    useEffect(() => {
        recorder.current = new MeetingRecorder((text) => {
            setTranscript((prev) => prev + " " + text);
        });
        return () => {
            // Cleanup if needed
        };
    }, []);

    const toggleRecording = async () => {
        if (isRecording) {
            // Stop
            setIsRecording(false);
            setIsProcessing(true);
            await recorder.current?.stop();

            // Send to API
            try {
                const res = await fetch("/api/meetings/process", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: "Meeting " + new Date().toLocaleString(),
                        transcript: transcript
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    alert("Meeting Saved! Tasks created.");
                    setTranscript("");
                }
            } catch (e) {
                alert("Failed to save meeting");
            } finally {
                setIsProcessing(false);
            }

        } else {
            // Start
            setTranscript("");
            setIsRecording(true);
            await recorder.current?.start();
        }
    };

    return (
        <Card className="p-6 text-center space-y-4">
            <h2 className="text-xl font-bold">Meeting Mode</h2>

            <div className="h-40 p-4 border rounded bg-muted/50 overflow-y-auto text-left whitespace-pre-wrap">
                {transcript || (isRecording ? "Listening..." : "Press record to start...")}
            </div>

            <Button
                onClick={toggleRecording}
                variant={isRecording ? "destructive" : "default"}
                disabled={isProcessing}
                size="lg"
            >
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                    isRecording ? <Square className="mr-2 h-4 w-4" /> :
                        <Mic className="mr-2 h-4 w-4" />}
                {isProcessing ? "Processing..." : isRecording ? "Stop Recording" : "Start Meeting"}
            </Button>
        </Card>
    );
}
