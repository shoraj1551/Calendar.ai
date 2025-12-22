
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SettingsHeaderProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    className?: string;
}

export function SettingsHeader({ title, description, icon: Icon, className }: SettingsHeaderProps) {
    return (
        <div className={cn("mb-8 border-b pb-6", className)}>
            <div className="flex items-center gap-3 mb-2">
                {Icon && <div className="p-2 bg-primary/10 rounded-lg text-primary"><Icon className="w-5 h-5" /></div>}
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    {title}
                </h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {description}
            </p>
        </div>
    );
}
