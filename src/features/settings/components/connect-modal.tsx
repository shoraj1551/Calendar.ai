
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cloud, Mail, Calendar, ArrowRight, Lock, AlertCircle, Loader2 } from "lucide-react";

interface ConnectAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    provider: 'google' | 'outlook' | 'ical' | null;
    onConnect: (email: string) => Promise<void>;
}

export function ConnectAccountModal({ isOpen, onClose, provider, onConnect }: ConnectAccountModalProps) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    if (!provider) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email || !email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }

        setIsLoading(true);
        try {
            await onConnect(email);
        } catch (err: any) {
            setError(err.message || "Failed to initiate connection.");
        } finally {
            setIsLoading(false);
        }
    };

    const providerConfig = {
        google: {
            name: "Google Calendar",
            icon: Cloud,
            color: "text-red-500",
            bg: "bg-red-50 dark:bg-red-900/10",
            border: "border-red-100 dark:border-red-900/30",
            desc: "Connect your Gmail or G-Suite account to sync events, meetings, and Google Meet links."
        },
        outlook: {
            name: "Outlook / Office 365",
            icon: Mail,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/10",
            border: "border-blue-100 dark:border-blue-900/30",
            desc: "Sync with Microsoft Outlook or Microsoft 365 work accounts for improved schedule coordination."
        },
        ical: {
            name: "iCloud Calendar",
            icon: Calendar,
            color: "text-gray-500",
            bg: "bg-gray-50 dark:bg-gray-900/10",
            border: "border-gray-100 dark:border-gray-800",
            desc: "Read-only sync via public WebCal URL. Good for public holiday calendars or shared sport schedules."
        }
    };

    const config = providerConfig[provider];
    const Icon = config.icon;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center mb-4 border ${config.border}`}>
                        <Icon className={`w-6 h-6 ${config.color}`} />
                    </div>
                    <DialogTitle>Connect {config.name}</DialogTitle>
                    <DialogDescription className="pt-2">
                        {config.desc}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={provider === 'google' ? "example@gmail.com" : "user@company.com"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            className="h-11"
                            autoFocus
                        />
                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-xs mt-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-xs text-gray-500 flex items-start gap-2">
                        <Lock className="w-3 h-3 mt-0.5" />
                        <p>
                            We'll redirect you to {config.name.split(' ')[0]} to verify your identity.
                            We only request access to read and edit your calendar events.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="gap-2">
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Continue to Login"
                            )}
                            {!isLoading && <ArrowRight className="w-4 h-4" />}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
