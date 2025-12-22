"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/actions/settings";
import { Menu } from "lucide-react";

// Components
import { SettingsSidebar } from "@/features/settings/settings-sidebar";
import { SettingsHome } from "@/features/settings/settings-home";
import { GlobalKillSwitch } from "@/features/settings/global-kill-switch";

// Sections
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
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const DEFAULT_SETTINGS = {
    // Communication
    dailySummary: true,
    weeklyInsights: true,
    urgentOnly: false,
    commChannel: 'email',
    quietHours: true,
    quietStart: '22:00',
    quietEnd: '08:00',
    // Personal Time
    lunch: true,
    breaks: true,
    exercise: false,
    focusTime: true,
    conflictRule: 'ask',
    // Privacy
    allowRecording: false,
    autoTranscribe: true,
    autoSummarize: false,
    alwaysAsk: true,
    joinBot: false,
    meetingRecording: false,
    transcribe: false,
    // Accountability
    tone: 'gentle',
    allowEscalation: true,
    missedTaskLogic: 'ask',
    // Focus
    focusDuration: [45],
    silenceNotifications: true,
    blockMeetings: false,
    breakReminders: true,
    // Dashboard
    showScore: false,
    showCategories: true,
    showTrends: true,
    // Appearance
    theme: 'system',
    fontSize: 'medium',
    weekStart: 'monday',
    timeFormat: '24',
    // General
    workStart: "09:00",
    workEnd: "17:00",
    prompts: true,
    scheduling: true,
    briefing: true,
    // Kill Switch
    aiEnabled: true
};

export function SettingsForm() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState("home");
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getSettings();
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
        setSettings(prev => {
            const next = { ...prev, [key]: val };
            setTimeout(() => save(next), 0);
            return next;
        });
    };

    const handleNavigate = (section: string) => {
        setActiveSection(section);
        setIsMobileOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderContent = () => {
        switch (activeSection) {
            case "home": return <SettingsHome onNavigate={handleNavigate} />;
            case "accounts": return <AccountsSection />;
            case "communication": return <CommunicationSettings settings={settings} update={update} />;
            case "personal-time": return <PersonalTimeSettings settings={settings} update={update} />;
            case "meeting-privacy": return <MeetingPrivacySettings settings={settings} update={update} />;
            case "task-accountability": return <TaskAccountabilitySettings settings={settings} update={update} />;
            case "focus": return <FocusSettings settings={settings} update={update} />;
            case "dashboard": return <DashboardSettings settings={settings} update={update} />;
            case "appearance": return <AppearanceSettings settings={settings} update={update} />;
            case "security": return <SecurityDataSettings />;
            case "automation":
                return (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <AutomationSettings settings={settings} update={update} />
                        <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4">Danger Zone</h3>
                            <GlobalKillSwitch
                                enabled={settings.aiEnabled !== false}
                                onToggle={() => update('aiEnabled', !settings.aiEnabled)}
                            />
                        </div>
                    </div>
                );
            default: return <SettingsHome onNavigate={handleNavigate} />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] gap-8">
            {/* Mobile Sidebar Trigger */}
            <div className="lg:hidden mb-4">
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            Menu
                            <Menu className="w-4 h-4 ml-2" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 p-0 pt-6">
                        <SettingsSidebar activeSection={activeSection} onSelect={handleNavigate} />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar - Sticky */}
            <aside className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-6">
                    <SettingsSidebar activeSection={activeSection} onSelect={handleNavigate} />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 pb-16">
                {renderContent()}
            </main>
        </div>
    );
}
