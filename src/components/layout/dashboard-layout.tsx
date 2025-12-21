import React from 'react';
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/lib/utils";

// Minimalist shell for the application
// Prioritizes content visibility and reduces peripheral clutter
export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 overflow-hidden">
            {/* Sidebar: Navigation & Context */}
            <Sidebar className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800" />

            {/* Main Content Area: Focus Zone */}
            <main className="flex-1 overflow-auto relative flex flex-col">
                {/* Top Header can go here if needed, but keeping it clean for now */}
                <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
