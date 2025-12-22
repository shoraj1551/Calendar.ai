"use client";

import { cn } from "@/lib/utils";
import {
    User, Bell, Clock, Cpu, Mic, Activity, Zap,
    LayoutDashboard, Palette, Lock, Home, Shield
} from "lucide-react";

interface SettingsSidebarProps {
    activeSection: string;
    onSelect: (section: string) => void;
}

export function SettingsSidebar({ activeSection, onSelect }: SettingsSidebarProps) {
    const navItems = [
        { id: "home", label: "Overview", icon: Home },
        { type: "divider" },
        { id: "accounts", label: "Accounts", icon: User },
        { id: "communication", label: "Communication", icon: Bell },
        { id: "personal-time", label: "Personal Time", icon: Clock },
        { id: "automation", label: "Automation", icon: Cpu },
        { id: "meeting-privacy", label: "Meeting Privacy", icon: Mic },
        { id: "task-accountability", label: "Accountability", icon: Activity },
        { id: "focus", label: "Focus Work", icon: Zap },
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "appearance", label: "Appearance", icon: Palette },
        { id: "security", label: "Security", icon: Lock },
    ];

    return (
        <nav className="w-full lg:w-64 space-y-1 lg:block hidden">
            <div className="mb-6 px-4">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Trust & Controls
                </h2>
            </div>

            {navItems.map((item, idx) => {
                if (item.type === "divider") {
                    return <div key={idx} className="h-px bg-gray-100 dark:bg-gray-800 my-2 mx-4" />;
                }

                const Icon = item.icon!;
                const isActive = activeSection === item.id;

                return (
                    <button
                        key={item.id}
                        onClick={() => onSelect(item.id!)}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                            isActive
                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                        )}
                    >
                        <Icon className={cn("w-4 h-4", isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500")} />
                        {item.label}
                    </button>
                );
            })}

            <div className="mt-8 px-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-lg p-3 flex items-start gap-3">
                    <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                            Encryption Active
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                            Your data is encrypted at rest and in transit.
                        </p>
                    </div>
                </div>
            </div>
        </nav>
    );
}
