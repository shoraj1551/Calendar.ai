"use client";

import { useState, useEffect } from "react";
import { Calculator, Calendar, CreditCard, Settings, Smile, User, Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command";
import { processAICommand } from "@/lib/ai-client";

export function CommandMenu() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const handleConnectCalendar = () => {
        setOpen(false);
        router.push("/settings");
    };

    const handleNavigate = (path: string) => {
        setOpen(false);
        router.push(path);
    };

    const handleAskAI = async () => {
        if (!search) return;
        setLoading(true);
        const result = await processAICommand(search);
        setLoading(false);
        setOpen(false);

        if (result.success && result.data) {
            const { intent, params, confirmationParams } = result.data;
            if (intent === "create_event" && params) {
                try {
                    const response = await fetch("/api/calendar/events", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(params),
                    });
                    if (response.ok) {
                        alert(`Success! Created event: ${(params as any).title}`);
                        window.location.reload();
                    } else {
                        alert("Failed to save event.");
                    }
                } catch (e) {
                    alert("Error saving event.");
                }
            } else if (intent === "query_schedule") {
                const answer = (params as any)?.response || confirmationParams?.message || "I found the info, but couldn't format the answer.";
                alert(answer);
            } else {
                alert(`AI Intent: ${intent}\n${confirmationParams?.message || "Processed."}`);
            }
        } else {
            alert("AI Failed: " + (result.error || "Unknown"));
        }
    };

    if (!isMounted) return null;

    return (
        <>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Type a command or search..."
                    value={search}
                    onValueChange={setSearch}
                />
                <CommandList>
                    <CommandEmpty>
                        <div className="flex flex-col items-center justify-center py-4 cursor-pointer hover:bg-muted/50 rounded" onClick={handleAskAI}>
                            <Bot className="h-8 w-8 mb-2 text-primary" />
                            <p className="text-sm">Ask AI to "{search}"</p>
                            <p className="text-xs text-muted-foreground">Press Enter to process</p>
                        </div>
                    </CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem onSelect={handleConnectCalendar}>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Connect Calendar</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleNavigate('/')}>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Go to Calendar</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Settings">
                        <CommandItem onSelect={() => handleNavigate('/settings')}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                            <CommandShortcut>⌘P</CommandShortcut>
                        </CommandItem>
                        <CommandItem onSelect={() => handleNavigate('/settings')}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="AI Actions">
                        <CommandItem onSelect={handleAskAI}>
                            <Bot className="mr-2 h-4 w-4" />
                            <span>Ask AI...</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );

}
