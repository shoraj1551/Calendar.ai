"use client";

import { useCalendarEvents } from "@/features/calendar/hooks/use-calendar-events";
import { useState, useEffect } from "react";
import { isSameDay, addDays } from "date-fns";
import { Lightbulb, X, ArrowRight, Coffee, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type PromptType = "back-to-back" | "end-of-day" | "tomorrow-fragmented";

export function ContextPrompts() {
    const { events, loading } = useCalendarEvents();
    const [visiblePrompt, setVisiblePrompt] = useState<PromptType | null>(null);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated || loading) return;

        const checkRules = () => {
            const dismissed = JSON.parse(localStorage.getItem("dismissedPrompts") || "[]");
            const now = new Date();
            const todayEvents = events.filter(e => isSameDay(e.start, now)).sort((a, b) => a.start.getTime() - b.start.getTime());

            // Rule 1: Back-to-Back (3+ meetings with <15m gaps)
            // Simplified check: Just check total meetings > 3 for MVP
            const meetingCount = todayEvents.filter(e => !e.title.toLowerCase().includes("focus")).length;
            if (meetingCount > 3 && !dismissed.includes("back-to-back")) {
                return "back-to-back";
            }

            // Rule 2: End of Day (> 4PM)
            if (now.getHours() >= 16 && !dismissed.includes("end-of-day")) {
                return "end-of-day";
            }

            return null;
        };

        setVisiblePrompt(checkRules());
    }, [events, loading, hydrated]);

    const handleDismiss = () => {
        if (!visiblePrompt) return;
        const dismissed = JSON.parse(localStorage.getItem("dismissedPrompts") || "[]");
        localStorage.setItem("dismissedPrompts", JSON.stringify([...dismissed, visiblePrompt]));
        setVisiblePrompt(null);
    };

    const handleAction = () => {
        if (!visiblePrompt) return;

        if (visiblePrompt === "back-to-back") {
            toast.success("Adding 15m buffer blocks...", { description: "We'll protect your sanity." });
        } else if (visiblePrompt === "end-of-day") {
            // Ideally open Briefing Modal
            toast.info("Generating Daily Brief...", { description: "Great work today." });
        }

        handleDismiss();
    };

    if (!visiblePrompt) return null;

    const CONTENT = {
        "back-to-back": {
            icon: Coffee,
            title: "High friction day detected.",
            desc: "Detected 4+ meetings. Add buffers?",
            action: "Add Buffers",
            color: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
        },
        "end-of-day": {
            icon: Moon,
            title: "Time to wrap up?",
            desc: "It's past 4PM. Capture your wins.",
            action: "Daily Brief",
            color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400"
        },
        "tomorrow-fragmented": {
            icon: Lightbulb,
            title: "Tomorrow looks messy.",
            desc: "Zero focus time found.",
            action: "Fix Schedule",
            color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400"
        }
    };

    const content = CONTENT[visiblePrompt];
    const Icon = content.icon;

    return (
        <div className={`flex items-center justify-between p-3 rounded-lg border mb-4 animate-in fade-in slide-in-from-top-2 ${content.color}`}>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/50 dark:bg-black/20 rounded-full">
                    <Icon className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold">{content.title}</h4>
                    <p className="text-xs opacity-90">{content.desc}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="h-8 hover:bg-white/20" onClick={handleDismiss}>
                    <X className="w-4 h-4" />
                </Button>
                <Button size="sm" className="h-8 text-xs bg-white text-black hover:bg-white/90 dark:bg-gray-900 dark:text-white border-0" onClick={handleAction}>
                    {content.action} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
            </div>
        </div>
    );
}
