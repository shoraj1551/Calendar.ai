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
        router.push("/integrations"); // Assuming this is the intended route for calendar integration
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
                // Determine start/end from params or defaults
                // Params from AI are strings, need to verify
                // Real app would show a "Confirm" dialog here.
                // For now, auto-create.
                try {
                    const response = await fetch("/api/calendar/events", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(params),
                    });
                    if (response.ok) {
                        alert(`Success! Created event: ${(params as any).title}`);
                        window.location.reload(); // Quick dirty refresh
                    } else {
                        alert("Failed to save event.");
                    }
                } catch (e) {
                    alert("Error saving event.");
                }
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
                            <span>Calendar</span>
                        </CommandItem>
                        <CommandItem>
                            <Smile className="mr-2 h-4 w-4" />
                            <span>Search Emoji</span>
                        </CommandItem>
                        <CommandItem>
                            <Calculator className="mr-2 h-4 w-4" />
                            <span>Calculator</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Settings">
                        <CommandItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                            <CommandShortcut>⌘P</CommandShortcut>
                        </CommandItem>
                        <CommandItem>
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Billing</span>
                            <CommandShortcut>⌘B</CommandShortcut>
                        </CommandItem>
                        <CommandItem>
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
