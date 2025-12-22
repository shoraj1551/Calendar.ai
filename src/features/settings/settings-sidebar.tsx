"use client";

import { cn } from "@/lib/utils";
import {
    User, Bell, Clock, Cpu, Mic, Activity, Zap,
    LayoutDashboard, Palette, Lock, Home, Shield, ChevronRight
} from "lucide-react";

interface SettingsSidebarProps {
    activeSection: string;
    onSelect: (section: string) => void;
}

export function SettingsSidebar({ activeSection, onSelect }: SettingsSidebarProps) {
    const navItems = [
        { id: "home", label: "Trust Center Overview", icon: Home },
        { type: "divider" },
        { id: "accounts", label: "Accounts & Calendars", icon: User },
        { id: "communication", label: "Communication", icon: Bell },
        { id: "personal-time", label: "Personal Time", icon: Clock },
        { id: "automation", label: "Automation & AI", icon: Cpu },
        { id: "meeting-privacy", label: "Meeting Privacy", icon: Mic },
        { id: "task-accountability", label: "Accountability", icon: Activity },
        { id: "focus", label: "Focus Work", icon: Zap },
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "appearance", label: "Appearance", icon: Palette },
        { id: "security", label: "Security & Data", icon: Lock },
    ];

    return (
        <nav className="w-full lg:w-72 space-y-1 lg:block hidden h-full flex flex-col">
            <div className="mb-6 px-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Settings
                </h2>
            </div>

            <div className="flex-1 space-y-1">
                {navItems.map((item, idx) => {
                    if (item.type === "divider") {
                        return <div key={idx} className="h-px bg-gray-100 dark:bg-gray-800 my-4 mx-4" />;
                    }

                    const Icon = item.icon!;
                    const isActive = activeSection === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item.id!)}
                            className={cn(
                                "w-full flex items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all group",
                                isActive
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className={cn("w-4.5 h-4.5 transition-colors", isActive ? "text-slate-900 dark:text-slate-100" : "text-gray-500 group-hover:text-gray-700")} />
                                {item.label}
                            </div>
                            {isActive && <ChevronRight className="w-3 h-3 text-slate-400" />}
                        </button>
                    );
                })}
            </div>

            <div className="mt-8 px-4 pb-4">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-4 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                            Trust Center Active
                        </p>
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400/80 mt-1 leading-relaxed">
                            Your data is end-to-end encrypted and never trained on without explicit consent.
                        </p>
                    </div>
                </div>
            </div>
        </nav>
    );
}
