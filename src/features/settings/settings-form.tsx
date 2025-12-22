"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/actions/settings";

// New Layout Components
import { SettingsSidebar } from "@/features/settings/settings-sidebar";
import { SettingsHome } from "@/features/settings/settings-home";
import { GlobalKillSwitch } from "@/features/settings/global-kill-switch";

// Section Components
import { AccountsSection } from "@/features/settings/accounts-section";
import { CommunicationSettings } from "@/features/settings/communication-settings";
import { PersonalTimeSettings } from "@/features/settings/personal-time-settings";
import { MeetingPrivacySettings } from "@/features/settings/meeting-privacy-settings";
import { TaskAccountabilitySettings } from "@/features/settings/task-accountability-settings";
import { FocusSettings } from "@/features/settings/focus-settings";
import { DashboardSettings } from "@/features/settings/dashboard-settings";
import { AppearanceSettings } from "@/features/settings/appearance-settings";
import { SecurityDataSettings } from "@/features/settings/security-data-settings";
import { AutomationSettings } from "@/features/settings/automation-settings";

const DEFAULT_SETTINGS = {
    // Communication
    dailySummary: true,
    weeklyInsights: true,
    urgentOnly: false,
    commChannel: 'email', // Default to email as push is "OFF initially"
    quietHours: true, // 10 PM – 8 AM
    quietStart: '22:00',
    quietEnd: '08:00',

    // Personal Time
    lunch: true,
    breaks: true,
    exercise: false, // Not specified in table, keeping default
    focusTime: true, // "Focus time auto-block: ON"
    conflictRule: 'ask', // "Allow meetings over personal time: Ask me"

    // Privacy
    allowRecording: false, // "Recording: OFF"
    autoTranscribe: true,
    autoSummarize: false, // "AI summaries: OFF"
    alwaysAsk: true, // Implied by philosophy
    joinBot: false, // "Join as Assistant"
    meetingRecording: false, // "Recording: OFF"
    transcribe: false, // "Transcription: OFF"

    // Accountability
    tone: 'gentle', // "Reminder tone: Gentle"
    allowEscalation: true, // "Escalation: ON"
    missedTaskLogic: 'ask', // "Missed-task behavior: Ask"

    // Focus
    focusDuration: [45],
    silenceNotifications: true, // "Silence notifications: ON"
    blockMeetings: false,
    breakReminders: true,

    // Dashboard
    showScore: false, // "Productivity score: OFF"
    showCategories: true, // "Time usage breakdown: ON"
    showTrends: true, // "Weekly trend view: ON"

    // Appearance
    theme: 'system', // "Theme: System default"
    fontSize: 'medium',
    weekStart: 'monday', // "Based on locale" (Defaulting to Monday)
    timeFormat: '24', // "Based on locale"

    // General / Automation
    workStart: "09:00",
    workEnd: "17:00",
    prompts: true, // "Smart nudges: ON"
    scheduling: true, // "Reschedule suggestions: ON"
    briefing: true, // "Daily summary: ON"

    // Global Kill Switch
    aiEnabled: true
};

export function SettingsForm() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState("home");

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getSettings();
                // Merge data carefully so we respect defaults if keys are missing
                setSettings(prev => ({ ...prev, ...data }));
            } catch (err) {
                console.error("Failed to load settings", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const save = useCallback(async (newSettings: any) => {
        try {
            await updateSettings(newSettings);
        } catch (err) {
            toast.error("Failed to save settings");
        }
    }, []);

    const update = (key: string, val: any) => {
        // 1. Optimistic update
        setSettings(prev => {
            const next = { ...prev, [key]: val };
            // 2. Trigger save (asynchronously to avoid React "update during render" warning)
            setTimeout(() => save(next), 0);
            return next;
        });
    };

    const renderContent = () => {
        switch (activeSection) {
            case "home":
                return <SettingsHome onNavigate={setActiveSection} />;
            case "accounts":
                return <AccountsSection />;
            case "communication":
                return <CommunicationSettings settings={settings} update={update} />;
            case "personal-time":
                return <PersonalTimeSettings settings={settings} update={update} />;
            case "meeting-privacy":
                return <MeetingPrivacySettings settings={settings} update={update} />;
            case "task-accountability":
                return <TaskAccountabilitySettings settings={settings} update={update} />;
            case "focus":
                return <FocusSettings settings={settings} update={update} />;
            case "dashboard":
                return <DashboardSettings settings={settings} update={update} />;
            case "appearance":
                return <AppearanceSettings settings={settings} update={update} />;
            case "security":
                return <SecurityDataSettings />;
            case "automation":
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Global Control</h3>
                            <GlobalKillSwitch
                                enabled={settings.aiEnabled !== false}
                                onToggle={() => update('aiEnabled', !settings.aiEnabled)}
                            />
                        </div>
                        <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />
                        <AutomationSettings settings={settings} update={update} />
                    </div>
                );
            default:
                return <SettingsHome onNavigate={setActiveSection} />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-[600px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-[600px] gap-8">
            {/* Sidebar Navigation - Desktop Only */}
            <aside className="shrink-0 border-r border-gray-100 dark:border-gray-800 pr-0 lg:pr-8 hidden lg:block">
                <SettingsSidebar activeSection={activeSection} onSelect={setActiveSection} />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
                {/* Mobile Header with Back Button */}
                {activeSection !== "home" && (
                    <div className="lg:hidden mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer transition-colors" onClick={() => setActiveSection("home")}>
                        <div className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                            <span className="text-lg">←</span>
                        </div>
                        <span className="font-medium text-sm">Back to Settings</span>
                    </div>
                )}

                {renderContent()}
            </main>
        </div>
    );
}
