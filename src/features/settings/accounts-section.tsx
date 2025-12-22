"use client";

import { useState } from "react";
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
    const [sources, setSources] = useState<CalendarSource[]>([
        {
            id: '1',
            provider: 'exchange',
            name: 'Corporate Exchange',
            email: 'shoraj@work-corp.com',
            status: 'active',
            lastSynced: '2 mins ago',
            color: 'bg-blue-500',
            priority: 'work',
            enabled: true
        },
        {
            id: '2',
            provider: 'google',
            name: 'Personal Gmail',
            email: 'shoraj.tomer@gmail.com',
            status: 'paused',
            lastSynced: '1 hour ago',
            color: 'bg-green-500',
            priority: 'personal',
            enabled: true,
            isPrimary: true
        },
        {
            id: '3',
            provider: 'outlook',
            name: 'Freelance Projects',
            email: 'projects@studio.com',
            status: 'error',
            lastSynced: 'Failed 1d ago',
            color: 'bg-purple-500',
            priority: 'optional',
            enabled: false
        }
    ]);

    const [sourceToDelete, setSourceToDelete] = useState<string | null>(null);

    const toggleSource = (id: string, currentEnabled: boolean) => {
        // If enabling, no confirmation needed (or could ask for re-auth)
        if (!currentEnabled) {
            setSources(prev => prev.map(s => s.id === id ? { ...s, enabled: true } : s));
            toast.success("Calendar enabled");
            return;
        }

        // If disabling, explain impact
        // For simplicity using a toast/confirmation here, but could be a modal if strictly enforced
        setSources(prev => prev.map(s => s.id === id ? { ...s, enabled: false } : s));
        toast.info("Calendar disabled. Events from this source will be hidden.");
    };

    const togglePause = (id: string) => {
        setSources(prev => prev.map(s => s.id === id ? {
            ...s,
            status: s.status === 'paused' ? 'active' : 'paused'
        } : s));
    };

    const handleDeleteClick = (id: string) => {
        setSourceToDelete(id);
    };

    const confirmDelete = () => {
        if (sourceToDelete) {
            setSources(prev => prev.filter(s => s.id !== sourceToDelete));
            setSourceToDelete(null);
            toast.success("Account removed successfully");
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
                        <Button variant="outline" size="sm" className="hidden sm:flex">
                            Manage Profile
                        </Button>
                    </div>
                </div>

                {/* Connected Sources List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Connected Calendars</h4>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 gap-1.5">
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
        </div>
    );
}
