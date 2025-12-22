"use client";

import { Shield, User, Bell, Clock, Cpu, Mic, Activity, Zap, LayoutDashboard, Palette, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsHomeProps {
    onNavigate: (section: string) => void;
}

export function SettingsHome({ onNavigate }: SettingsHomeProps) {
    const sections = [
        {
            id: "accounts",
            title: "Accounts & Calendars",
            description: "Manage connected Google/Outlook accounts and calendar sync status.",
            icon: User,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            id: "communication",
            title: "Notifications & Communication",
            description: "Choose how and when the assistant contacts you.",
            icon: Bell,
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-900/20"
        },
        {
            id: "personal-time",
            title: "Personal Time Rules",
            description: "Define your protected hours, lunch breaks, and work boundaries.",
            icon: Clock,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/20"
        },
        {
            id: "automation",
            title: "Automation & AI",
            description: "Control global kill-switches and what the AI is allowed to do.",
            icon: Cpu,
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-900/20"
        },
        {
            id: "meeting-privacy",
            title: "Meetings & Privacy",
            description: "Manage recording, transcription, and bot joining preferences.",
            icon: Mic,
            color: "text-indigo-500",
            bg: "bg-indigo-50 dark:bg-indigo-900/20"
        },
        {
            id: "task-accountability",
            title: "Tasks & Accountability",
            description: "Set the coaching tone and pressure level for your goals.",
            icon: Activity,
            color: "text-pink-500",
            bg: "bg-pink-50 dark:bg-pink-900/20"
        },
        {
            id: "focus",
            title: "Focus & Deep Work",
            description: "Configure how the assistant protects your deep work sessions.",
            icon: Zap,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/20"
        },
        {
            id: "dashboard",
            title: "Dashboard & Insights",
            description: "Customize what you see on your daily command center.",
            icon: LayoutDashboard,
            color: "text-cyan-500",
            bg: "bg-cyan-50 dark:bg-cyan-900/20"
        },
        {
            id: "appearance",
            title: "Appearance",
            description: "Theme settings, font sizes, and accessibility options.",
            icon: Palette,
            color: "text-slate-500",
            bg: "bg-slate-50 dark:bg-slate-900/20"
        },
        {
            id: "security",
            title: "Security & Data",
            description: "View audit logs, export data, and manage privacy.",
            icon: Lock,
            color: "text-red-500",
            bg: "bg-red-50 dark:bg-red-900/20"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Trust Header */}
            <div className="text-center space-y-2 py-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Shield className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    Trusted Command Center
                </h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    You’re in control of what the assistant can see and do.
                    Manage your trust levels below.
                </p>
            </div>

            {/* Section List */}
            <div className="grid grid-cols-1 gap-4">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => onNavigate(section.id)}
                        className="flex items-center gap-4 p-4 text-left bg-white dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl transition-all group"
                    >
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors", section.bg)}>
                            <section.icon className={cn("w-6 h-6", section.color)} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {section.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-1">
                                {section.description}
                            </p>
                        </div>
                        <div className="text-gray-300 group-hover:text-blue-500 transition-colors">
                            →
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
