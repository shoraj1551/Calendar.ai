"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2, Info, Compass, Clock } from "lucide-react";

export default function AnalyticsPage() {
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            // Mocking "Truthful" data patterns
            // Showing variance between Plan and Reality without judgment
            const mockHistory = [
                { name: "Mon", planned: 6.5, actual: 4.2 },
                { name: "Tue", planned: 5.0, actual: 5.5 }, // Worked more than planned
                { name: "Wed", planned: 7.0, actual: 5.0 }, // Drift
                { name: "Thu", planned: 6.0, actual: 5.8 }, // Close alignment
                { name: "Fri", planned: 4.0, actual: 3.5 },
            ];
            setData(mockHistory);
            setIsLoading(false);
        }
        loadData();
    }, []);

    if (isLoading) return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        </DashboardLayout>
    );

    const totalPlanned = data.reduce((acc, curr) => acc + curr.planned, 0);
    const totalActual = data.reduce((acc, curr) => acc + curr.actual, 0);
    // Alignment is not "Good/Bad", just a percentage match
    const alignment = Math.round((totalActual / totalPlanned) * 100);
    const drift = (totalPlanned - totalActual).toFixed(1);

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <Compass className="w-8 h-8 text-indigo-500" />
                        Time Patterns
                    </h1>
                    <p className="text-gray-500">Observing how reality compared to your plan this week.</p>
                </div>

                {/* Insight Cards (Neutral) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-l-4 border-l-indigo-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Schedule Alignment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">{alignment}%</div>
                            <p className="text-xs text-gray-500 mt-1">
                                {alignment < 80 ? "Reality diverged from the plan." : "You largely stuck to the plan."}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-amber-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Unplanned Drift</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">{Math.abs(Number(drift))}h</div>
                            <p className="text-xs text-gray-500 mt-1">
                                {Number(drift) > 0 ? "Time spent on ad-hoc tasks." : "More time spent than planned."}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-emerald-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Deep Work</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">{totalActual.toFixed(1)}h</div>
                            <p className="text-xs text-gray-500 mt-1">Recorded focus sessions.</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Reality Check Chart */}
                <Card className="p-6">
                    <CardHeader className="px-0 pt-0 mb-6">
                        <CardTitle className="text-lg font-medium text-gray-700 dark:text-gray-300">Planned vs. Reality</CardTitle>
                        <p className="text-sm text-gray-500">A comparison of scheduled hours versus actual logged activity.</p>
                    </CardHeader>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} barGap={0}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tooltip-bg, white)' }}
                                    cursor={{ fill: '#F9FAFB' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="planned" name="Scheduled Intent" fill="#E5E7EB" radius={[4, 4, 0, 0]} barSize={40} />
                                <Bar dataKey="actual" name="Actual Reality" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Pattern Recognition (Mock AI Insight) */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl flex gap-4 items-start">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-indigo-900 dark:text-indigo-200">Weekly Pattern Detected</h4>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                            You tend to overestimate your available time on Wednesdays.
                            Consider scheduling 20% less on mid-week days to reduce drift.
                        </p>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
