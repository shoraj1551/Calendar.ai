"use client";

import { useState } from "react";
import { CheckCircle2, ListTodo, FileText, ArrowRight, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryViewProps {
    summary: string;
    actionItems: string[];
    transcript: string[];
    onClose: () => void;
}

export function SummaryView({ summary, actionItems, transcript, onClose }: SummaryViewProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleAddToTasks = async () => {
        setIsSaving(true);
        try {
            await Promise.all(actionItems.map(item =>
                fetch("/api/tasks", {
                    method: "POST",
                    body: JSON.stringify({
                        title: item,
                        priority: "medium", // Default priority
                        // Default due date: Tomorrow? Let's leave it unset for now or set logic elsewhere
                    })
                })
            ));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error("Failed to save tasks", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Meeting Summary</h2>
                    <p className="text-gray-500">AI-generated insights from your session.</p>
                </div>
                <Button onClick={onClose} variant="outline">Done</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Executive Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Executive Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {summary}
                        </p>
                    </CardContent>
                </Card>

                {/* Action Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <ListTodo className="w-5 h-5 text-green-500" />
                            Action Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {actionItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 group hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0 mt-0.5 text-gray-400 group-hover:text-green-500">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm text-gray-700 dark:text-gray-200 pt-1">{item}</span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            className="w-full mt-6"
                            variant={saved ? "outline" : "secondary"}
                            onClick={handleAddToTasks}
                            disabled={isSaving || saved}
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : saved ? (
                                <Check className="w-4 h-4 mr-2" />
                            ) : (
                                <ArrowRight className="w-4 h-4 mr-2" />
                            )}
                            {isSaving ? "Saving..." : saved ? "All Added!" : "Add All to Tasks"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Full Transcript (Collapsed/Scrollable) */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-500">Full Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-48 overflow-y-auto custom-scrollbar p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {transcript.map((line, i) => (
                            <p key={i} className="mb-2">{line}</p>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
