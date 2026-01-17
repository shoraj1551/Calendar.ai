'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { WeeklyOverview } from "@/features/analytics/components/weekly-overview";
import { FocusTrends } from "@/features/analytics/components/focus-trends";
import { InsightsPanel } from "@/features/analytics/components/insights-panel";
import { CalendarChat } from "@/features/chat/components/calendar-chat";
import { getWeeklyMetricsAction, getInsightsAction } from "@/app/actions/analytics";
import { subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { Loader2, BarChart3, TrendingUp, Lightbulb, MessageSquare } from 'lucide-react';

export default function AnalyticsPage() {
    const { data: session } = useSession();
    const [metrics, setMetrics] = useState<any>(null);
    const [insights, setInsights] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.id) {
            loadData();
        }
    }, [session]);

    const loadData = async () => {
        if (!session?.user?.id) return;

        setLoading(true);
        try {
            const endDate = new Date();
            const startDate = subWeeks(endDate, 1);

            const [metricsRes, insightsRes] = await Promise.all([
                getWeeklyMetricsAction(session.user.id, startDate, endDate),
                getInsightsAction(session.user.id)
            ]);

            if (metricsRes.success) {
                setMetrics(metricsRes.metrics);
            }
            if (insightsRes.success) {
                setInsights(insightsRes.insights || []);
            }
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!session) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <Card className="w-96">
                        <CardHeader>
                            <CardTitle>Sign In Required</CardTitle>
                            <CardDescription>Please sign in to view analytics</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Analytics & Insights</h1>
                    <p className="text-muted-foreground">
                        Understand your calendar patterns and optimize your time
                    </p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                            <TabsTrigger value="overview" className="gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="focus" className="gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Focus
                            </TabsTrigger>
                            <TabsTrigger value="insights" className="gap-2">
                                <Lightbulb className="h-4 w-4" />
                                Insights
                            </TabsTrigger>
                            <TabsTrigger value="chat" className="gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Ask AI
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            {metrics?.dailyBreakdown && metrics.dailyBreakdown.length > 0 ? (
                                <>
                                    <WeeklyOverview data={metrics.dailyBreakdown} />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardDescription>Total Hours</CardDescription>
                                                <CardTitle className="text-3xl">{Math.round(metrics.totalHours)}</CardTitle>
                                            </CardHeader>
                                        </Card>
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardDescription>Meeting Load</CardDescription>
                                                <CardTitle className="text-3xl">{Math.round(metrics.meetingLoad)}%</CardTitle>
                                            </CardHeader>
                                        </Card>
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardDescription>Focus Blocks</CardDescription>
                                                <CardTitle className="text-3xl">{metrics.focusBlocks}</CardTitle>
                                            </CardHeader>
                                        </Card>
                                    </div>
                                </>
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>No Data Available</CardTitle>
                                        <CardDescription>
                                            Add events to your calendar to see analytics
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="focus">
                            {metrics?.dailyBreakdown && metrics.dailyBreakdown.length > 0 ? (
                                <FocusTrends data={metrics.dailyBreakdown.map((d: any) => ({
                                    date: d.date,
                                    focusHours: d.focus
                                }))} />
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>No Focus Data</CardTitle>
                                        <CardDescription>
                                            Use "Shield Up" to create focus blocks
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="insights">
                            <InsightsPanel insights={insights} />
                        </TabsContent>

                        <TabsContent value="chat">
                            <CalendarChat />
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </DashboardLayout>
    );
}
