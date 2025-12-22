"use client";

import { useState } from "react";
import { Mic, FileText, Lock, Download, Trash2, Eye, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function MeetingPrivacySettings({ settings, update }: { settings: any, update: (k: string, v: any) => void }) {
    const [recordings, setRecordings] = useState([
        { id: 1, title: 'Weekly Team Sync', date: 'Oct 24, 10:00 AM', duration: '45m', size: '12MB' },
        { id: 2, title: 'Client Discovery Call', date: 'Oct 23, 02:00 PM', duration: '30m', size: '8MB' },
        { id: 3, title: 'Project Kickoff', date: 'Oct 21, 11:30 AM', duration: '1h 15m', size: '24MB' },
    ]);
    const [recordingToDelete, setRecordingToDelete] = useState<number | null>(null);

    const deleteRecording = () => {
        if (recordingToDelete) {
            setRecordings(prev => prev.filter(r => r.id !== recordingToDelete));
            setRecordingToDelete(null);
        }
    };

    const toggle = (key: string) => {
        update(key, !settings[key]);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-indigo-500" />
                    Meeting Intelligence & Privacy
                </h3>
                <p className="text-sm text-gray-500 max-w-2xl">
                    Strict controls over how the AI listens and learns.
                    <span className="block mt-1 font-medium text-indigo-600 dark:text-indigo-400">
                        We prioritize your privacy. Recording features are OFF by default.
                    </span>
                </p>
            </div>

            {/* Privacy Controls */}
            <div className="grid gap-6">

                {/* 1. Recording Toggle (High Sensitivity) */}
                <div className={cn(
                    "p-5 rounded-xl border transition-all duration-200",
                    settings.meetingRecording
                        ? "bg-white dark:bg-gray-900 border-indigo-100 dark:border-indigo-900/30 shadow-sm"
                        : "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-90"
                )}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className={cn("mt-1 p-2 rounded-lg", settings.meetingRecording ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-500")}>
                                <Mic className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Meeting Recording</h4>
                                    {!settings.meetingRecording && <Badge variant="outline" className="text-[10px] border-gray-300 text-gray-500">Off by default</Badge>}
                                </div>
                                <p className="text-sm text-gray-500 max-w-md">
                                    Allow the AI to record audio from meetings to generate transcripts and summaries.
                                </p>

                                {/* "Ask Every Time" Sub-option */}
                                {settings.meetingRecording && (
                                    <div className="mt-4 flex items-center gap-2">
                                        <Switch
                                            checked={settings.alwaysAsk}
                                            onCheckedChange={() => toggle('alwaysAsk')}
                                            className="scale-75 origin-left"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Ask for permission before <u>every</u> meeting?
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Switch checked={settings.meetingRecording} onCheckedChange={() => toggle('meetingRecording')} />
                    </div>
                </div>

                {/* 2. Join Bot */}
                <div className="p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">Join as Separate Participant</h4>
                                <p className="text-sm text-gray-500 max-w-md mt-1">
                                    Should the AI join calls (Zoom/Meet) as a visible participant named "AI Notetaker"?
                                </p>
                            </div>
                        </div>
                        <Switch checked={settings.joinBot} onCheckedChange={() => toggle('joinBot')} />
                    </div>
                </div>
            </div>

            {/* Stored Recordings List */}
            <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-500" />
                        Stored Recordings & Transcripts
                    </h4>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        {recordings.length} files stored
                    </span>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
                    {recordings.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Lock className="w-5 h-5 text-gray-300" />
                            </div>
                            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">No recordings stored</h5>
                            <p className="text-xs text-gray-500 mt-1">Recordings are automatically deleted after 30 days.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {recordings.map((rec) => (
                                <div key={rec.id} className="p-4 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">{rec.title}</h5>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-gray-500">{rec.date}</span>
                                                <span className="text-xs text-gray-300">•</span>
                                                <span className="text-xs text-gray-500">{rec.duration}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-gray-600">
                                            <Download className="w-3.5 h-3.5" />
                                            Export
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                                                    onClick={() => setRecordingToDelete(rec.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete recording?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete the audio and transcript for "{rec.title}". This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel onClick={() => setRecordingToDelete(null)}>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={deleteRecording} className="bg-red-500 hover:bg-red-600">
                                                        Permanently Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
