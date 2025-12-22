"use client";

import { Button } from "@/components/ui/button";
import { Zap, Moon } from "lucide-react";
import { toast } from "sonner";
import { useCalendarEvents } from "@/features/calendar/hooks/use-calendar-events";

export function QuickActions() {
    const { refresh } = useCalendarEvents();

    const handleZapFocus = async () => {
        // Optimistic UI: In a real implementation, we'd add to local state immediately.
        // For now, we simulate the action.

        const promise = new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API

        toast.promise(promise, {
            loading: 'Finding the best slot...',
            success: (data) => {
                return (
                    <div className="flex flex-col gap-1">
                        <span className="font-bold">Focus Time Blocked!</span>
                        <span className="text-xs">Added 1h Focus at 2:00 PM.</span>
                    </div>
                );
            },
            error: 'Could not find a slot',
            action: {
                label: 'Undo',
                onClick: () => {
                    toast.info("Focus block removed.");
                    // In real app: await deleteEvent(eventId);
                }
            }
        });

        // In real app: Call API here
        // await createEvent({ title: "Focus Time", ... });
        // refresh();
    };

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                className="gap-2 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                onClick={handleZapFocus}
            >
                <Zap className="w-4 h-4" />
                Zap Focus
            </Button>
        </div>
    );
}
