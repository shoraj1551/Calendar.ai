"use client";

import { useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function AIChatWidget() {
    const [query, setQuery] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [response, setResponse] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsProcessing(true);
        setResponse(null);

        try {
            const res = await fetch("/api/ai/command", {
                method: "POST",
                body: JSON.stringify({ text: query }),
            });
            const data = await res.json();

            // Basic formatting of the response
            if (data.confirmation) {
                setResponse(`I understand. ${data.confirmation}`);
            } else if (data.intent) {
                setResponse(`Processed intent: ${data.intent} with confidence ${data.confidence}`);
            } else {
                setResponse("I processed your request.");
            }
        } catch (err) {
            setResponse("Sorry, I encountered an error processing that.");
        } finally {
            setIsProcessing(false);
            setQuery("");
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h2 className="font-semibold text-gray-900 dark:text-gray-100">AI Command Center</h2>
                    <p className="text-sm text-gray-500">Ask me to schedule events, summarize meetings, or plan your day.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., 'Schedule a focus block at 2pm' or 'Summarize my last meeting'"
                    className="w-full bg-gray-50 dark:bg-gray-800 border-0 rounded-lg px-4 py-4 pr-12 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={isProcessing || !query.trim()}
                    className="absolute right-2 top-2 h-10 w-10 shrink-0 rounded-lg hover:bg-blue-600"
                >
                    {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </Button>
            </form>

            {response && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 mr-2">AI:</span>
                        {response}
                    </p>
                </div>
            )}
        </div>
    );
}
