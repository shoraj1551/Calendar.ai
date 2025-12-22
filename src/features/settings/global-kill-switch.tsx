"use client";

import { Switch } from "@/components/ui/switch";
import { AlertTriangle } from "lucide-react";

interface GlobalKillSwitchProps {
    enabled: boolean;
    onToggle: () => void;
}

export function GlobalKillSwitch({ enabled, onToggle }: GlobalKillSwitchProps) {
    return (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg p-4 flex items-center justify-between mb-6">
            <div className="flex gap-3">
                <div className="mt-1">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Global AI Kill Switch</h4>
                    <p className="text-sm text-gray-500">
                        {enabled
                            ? "All AI features are currently ACTIVE."
                            : "AI is completely DISABLED. No data will be processed."}
                    </p>
                </div>
            </div>
            <Switch
                checked={enabled}
                onCheckedChange={onToggle}
                className="data-[state=checked]:bg-red-600"
            />
        </div>
    );
}
