"use client";

import { useEffect, useState } from "react";
import { Sparkles, MoveRight, Loader2, Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Suggestion } from "@/services/intelligence/types";
import { toast } from "sonner";

export function SuggestionsWidget() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalysis();
    }, []);

    const fetchAnalysis = async () => {
        try {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);

            const res = await fetch("/api/intelligence/analyze", {
                method: "POST",
                body: JSON.stringify({
                    start: today.toISOString(),
                    end: tomorrow.toISOString()
                })
            });
            const data = await res.json();
            setSuggestions(data.suggestions || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAccept = async (suggestionId: string) => {
        // Find suggestion object for logic
        const suggestion = suggestions.find(s => s.id === suggestionId);
        if (!suggestion) return;

        // Optimistic UI: Remove immediately from view
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));

        // Define the API call
        const apiCall = async () => {
            if (suggestion.action.type === "create") {
                await fetch("/api/calendar/events", {
                    method: "POST",
                    body: JSON.stringify(suggestion.action.event)
                });
            } else if (suggestion.action.type === "update" && suggestion.action.targetEventId) {
                await fetch("/api/calendar/events", {
                    method: "PATCH",
                    body: JSON.stringify({
                        id: suggestion.action.targetEventId,
                        ...suggestion.action.event
                    })
                });
            }
        };

        // Show toast with Undo capability (simulated undo for MVP complexity reasons, or we delay the API call)
        // For distinct "Undo", we'd usually delay execution.
        // Here we just execute and show success.
        toast.promise(apiCall(), {
            loading: 'Applying optimization...',
            success: 'Schedule updated successfully',
            error: 'Failed to update schedule',
            action: {
                label: 'Undo',
                onClick: () => toast("Undo not fully supported in this beta yet.") // Honest placeholder
            }
        });
    };

    if (isLoading) return (
        <Card className="h-full flex items-center justify-center p-6 border-none shadow-none bg-transparent">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </Card>
    );

    if (suggestions.length === 0) return (
        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 border-none shadow-sm">
            <CardContent className="p-6 flex flex-col items-center text-center">
                <Sparkles className="w-8 h-8 text-yellow-400 mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Schedule Optimized</h3>
                <p className="text-sm text-gray-500">No conflicts or heavy overload detected.</p>
            </CardContent>
        </Card>
    );

    return (
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-600 dark:text-purple-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Smart Optimizations
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {suggestions.map(suggestion => (
                    <div key={suggestion.id} className="flex items-start justify-between p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                {suggestion.title}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Why? {suggestion.reason || "To optimize your energy."}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </p>
                            <p className="text-xs text-gray-500">{suggestion.time}</p>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleAccept(suggestion.id)}
                        >
                            <Check className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
