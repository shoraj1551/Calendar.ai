"use client";

import { useState, useEffect } from "react";
import { Cloud, RefreshCw, Trash2, Mail, MoreHorizontal, PauseCircle, PlayCircle, Plus, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConnectAccountModal } from "./components/connect-modal";

interface CalendarSource {
    id: string;
    provider: 'google' | 'outlook' | 'exchange' | 'ical';
    name: string;
    email: string;
    status: 'active' | 'paused' | 'error';
    lastSynced: string;
    color: string;
    priority: 'work' | 'personal' | 'optional';
    enabled: boolean;
    isPrimary?: boolean;
}

export function AccountsSection() {
    const [sources, setSources] = useState<CalendarSource[]>([]);
    const [loading, setLoading] = useState(true);

    // Helper to enrich DB data with UI defaults
    const mapAccountData = (account: any): CalendarSource => ({
        ...account,
        // Default UI properties if missing from DB
        color: account.provider === 'google' ? 'bg-green-500' :
            account.provider === 'outlook' ? 'bg-blue-500' :
                account.provider === 'ical' ? 'bg-gray-500' : 'bg-indigo-500',
        priority: account.priority || 'personal',
        lastSynced: account.lastSynced || 'Just now', // optimize later
        enabled: account.status === 'active'
    });

    const fetchAccounts = async () => {
        try {
            const res = await fetch("/api/accounts");
            if (res.ok) {
                const data = await res.json();
                setSources(data.accounts.map(mapAccountData));
            }
        } catch (error) {
            console.error("Failed to fetch accounts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const [sourceToDelete, setSourceToDelete] = useState<string | null>(null);

    const toggleSource = async (id: string, currentEnabled: boolean) => {
        // Optimistic Update
        const newStatus = currentEnabled ? 'paused' : 'active';
        setSources(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as any, enabled: !currentEnabled } : s));

        try {
            await fetch("/api/accounts", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus })
            });
            // Background sync could be triggered here if we wanted to be robust
        } catch (error) {
            toast.error("Failed to update status");
            // Revert
            setSources(prev => prev.map(s => s.id === id ? { ...s, status: currentEnabled ? 'active' : 'paused' as any, enabled: currentEnabled } : s));
        }
    };

    const togglePause = (id: string) => {
        const source = sources.find(s => s.id === id);
        if (source) toggleSource(id, source.enabled);
    };

    const handleDeleteClick = (id: string) => {
        setSourceToDelete(id);
    };

    const confirmDelete = async () => {
        if (!sourceToDelete) return;

        try {
            const res = await fetch(`/api/accounts?id=${sourceToDelete}`, { method: "DELETE" });
            if (res.ok) {
                setSources(prev => prev.filter(s => s.id !== sourceToDelete));
                toast.success("Account removed successfully");
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to remove account");
            }
        } catch (error) {
            toast.error("Error removing account");
        } finally {
            setSourceToDelete(null);
        }
    };


    const [isAddingOpen, setIsAddingOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<CalendarSource['provider'] | null>(null);

    const handleAddAccountClick = (provider: CalendarSource['provider']) => {
        setIsAddingOpen(false);
        setSelectedProvider(provider);
    };

    const handleConnect = async (email: string) => {
        if (!selectedProvider) return;

        try {
            // 1. Get Auth URL from Backend
            const res = await fetch("/api/integrations/auth-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: selectedProvider,
                    email
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to initiate connection");
            }

            const { url } = await res.json();

            // 2. Redirect to Provider
            // Currently simulated/mocked if keys are missing, or real if keys present
            // If the URL is just a string message (e.g. "Simulated..."), we treat it as an error or handle it?
            // The backend returns a real URL or throws.

            window.location.href = url;

        } catch (error: any) {
            toast.error(error.message);
            // Don't close modal so user can retry
            throw error;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                    <Cloud className="w-5 h-5 text-blue-500" />
                    Accounts & Calendars
                </h3>
                <p className="text-sm text-gray-500">
                    Control which calendars the assistant uses to plan your day.
                    <span className="font-medium text-gray-700 dark:text-gray-300 ml-1">
                        We never connect new accounts without your explicit permission.
                    </span>
                </p>
            </div>

            <div className="space-y-4">
                {/* Primary Account Header */}
                <div className="p-5 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-900 rounded-xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-lg font-bold border-2 border-white dark:border-gray-800 shadow-sm">
                                ST
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">Shoraj Tomer</h4>
                                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                                        Primary Identity
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-500 mt-0.5">shoraj.tomer@gmail.com</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Used for login & daily summaries</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="hidden sm:flex" asChild>
                            <a href="https://myaccount.google.com/" target="_blank" rel="noopener noreferrer">
                                Manage Profile
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Connected Sources List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Connected Calendars</h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 gap-1.5"
                            onClick={() => setIsAddingOpen(true)}
                        >
                            <Plus className="w-4 h-4" />
                            Connect New
                        </Button>
                    </div>

                    {sources.map(source => (
                        <div key={source.id} className={cn(
                            "group p-4 rounded-xl border transition-all duration-200 hover:shadow-sm",
                            source.enabled
                                ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                                : "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-80"
                        )}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {/* Provider Icon/Color */}
                                    <div className="relative">
                                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 border", source.enabled ? "border-gray-200 dark:border-gray-700" : "border-transparent")}>
                                            <span className={cn("text-xs font-bold uppercase", source.color.replace('bg-', 'text-'))}>
                                                {source.provider.slice(0, 2)}
                                            </span>
                                        </div>
                                        {source.status === 'active' && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />}
                                        {source.status === 'paused' && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white dark:border-gray-900" />}
                                        {source.status === 'error' && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-gray-900" />}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className={cn("font-medium", source.enabled ? "text-gray-900 dark:text-gray-100" : "text-gray-500")}>
                                                {source.name}
                                            </h4>
                                            {source.isPrimary && (
                                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-indigo-50 text-indigo-600 border-indigo-100">Primary</Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "text-[10px] h-5 px-1.5 border-0 font-medium",
                                                    source.priority === 'work' ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" :
                                                        source.priority === 'personal' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" :
                                                            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                                )}
                                            >
                                                {source.priority}
                                            </Badge>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500">{source.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    {/* Sync Info */}
                                    <div className="text-right hidden sm:block">
                                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                                            {source.status}
                                        </div>
                                        <div className="text-[10px] text-gray-400 flex items-center gap-1 justify-end">
                                            <RefreshCw className="w-3 h-3" />
                                            {source.lastSynced}
                                        </div>
                                    </div>

                                    <div className="h-8 w-px bg-gray-100 dark:bg-gray-800 hidden sm:block" />

                                    {/* Actions */}
                                    <div className="flex items-center gap-3">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={source.enabled}
                                                            onCheckedChange={() => toggleSource(source.id, source.enabled)}
                                                            disabled={source.isPrimary}
                                                        />
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    {source.isPrimary ? (
                                                        <p>Primary account cannot be disabled.</p>
                                                    ) : (
                                                        <p>Turn off to hide all events from this calendar.</p>
                                                    )}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        {source.enabled && !source.isPrimary && (
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    onClick={() => togglePause(source.id)}
                                                >
                                                    {source.status === 'paused' ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                                    onClick={() => handleDeleteClick(source.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Removal Confirmation Dialog */}
            <AlertDialog open={!!sourceToDelete} onOpenChange={() => setSourceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove this calendar?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will stop syncing events from this account.
                            Any historical data processed by the AI for this calendar will be retained for 30 days before deletion.
                            You can reconnect it at any time.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
                            Remove Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Add Account Selection Dialog */}
            <AlertDialog open={isAddingOpen} onOpenChange={setIsAddingOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Connect a new calendar</AlertDialogTitle>
                        <AlertDialogDescription>
                            Select a provider to connect. We'll sync your events and look for conflicts.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid grid-cols-1 gap-2 py-4">
                        <Button variant="outline" className="justify-start h-12 gap-3" onClick={() => handleAddAccountClick('google')}>
                            <Cloud className="w-4 h-4 text-green-500" />
                            Google Calendar
                        </Button>
                        <Button variant="outline" className="justify-start h-12 gap-3" onClick={() => handleAddAccountClick('outlook')}>
                            <Mail className="w-4 h-4 text-blue-500" />
                            Outlook / Office 365
                        </Button>
                        <Button variant="outline" className="justify-start h-12 gap-3" onClick={() => handleAddAccountClick('ical')}>
                            <CalendarSourceIcon className="w-4 h-4 text-gray-500" />
                            iCloud / WebCal
                        </Button>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Email Prompt Modal */}
            <ConnectAccountModal
                isOpen={!!selectedProvider}
                onClose={() => setSelectedProvider(null)}
                provider={selectedProvider as any}
                onConnect={handleConnect}
            />
        </div>
    );
}

// Helper icon
function CalendarSourceIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}
