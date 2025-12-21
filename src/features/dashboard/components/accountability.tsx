"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, TrendingUp, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
    id: string;
    title: string;
    priority: "low" | "medium" | "high";
    dueDate?: string;
}

export function AccountabilityWidget() {
    const [score, setScore] = useState(85); // Mock start score
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch pending tasks from API
        fetch("/api/tasks?status=todo")
            .then(res => res.json())
            .then(data => {
                setTasks(data.slice(0, 3)); // Top 3
                setIsLoading(false);
            })
            .catch(e => setIsLoading(false));
    }, []);

    const getScoreColor = (s: number) => {
        if (s >= 90) return "text-green-600 dark:text-green-400";
        if (s >= 70) return "text-blue-600 dark:text-blue-400";
        return "text-orange-600 dark:text-orange-400";
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    Accountability
                </h3>
            </div>

            <div className="flex items-center gap-6 mb-8">
                {/* Score Ring (Simple SVG) */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-gray-800" />
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - score / 100)} className={cn("transition-all duration-1000 ease-out", getScoreColor(score))} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={cn("text-2xl font-bold", getScoreColor(score))}>{score}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Score</span>
                    </div>
                </div>

                <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">You're doing great!</h4>
                    <p className="text-sm text-gray-500 leading-snug">
                        Your focus time is up 12% this week. Clear these tasks to hit 90+.
                    </p>
                </div>
            </div>

            <div className="flex-1">
                <h5 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    Smart Nudges
                </h5>

                <div className="space-y-3">
                    {isLoading ? (
                        <div className="h-20 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse" />
                    ) : tasks.length === 0 ? (
                        <div className="text-sm text-gray-500 italic">No pending tasks. You are free!</div>
                    ) : (
                        tasks.map(task => (
                            <div key={task.id} className="group flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-2 h-2 rounded-full", task.priority === 'high' ? 'bg-red-500' : 'bg-blue-500')} />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{task.title}</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
