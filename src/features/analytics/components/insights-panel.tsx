'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lightbulb, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Insight {
    id: string;
    type: 'warning' | 'suggestion' | 'achievement';
    title: string;
    description: string;
    priority: number;
}

interface InsightsPanelProps {
    insights: Insight[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
    const getIcon = (type: Insight['type']) => {
        switch (type) {
            case 'warning':
                return <AlertTriangle className="h-5 w-5" />;
            case 'suggestion':
                return <Lightbulb className="h-5 w-5" />;
            case 'achievement':
                return <Trophy className="h-5 w-5" />;
        }
    };

    const getStyles = (type: Insight['type']) => {
        switch (type) {
            case 'warning':
                return {
                    card: 'border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
                    icon: 'text-yellow-600 dark:text-yellow-500'
                };
            case 'suggestion':
                return {
                    card: 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20',
                    icon: 'text-blue-600 dark:text-blue-500'
                };
            case 'achievement':
                return {
                    card: 'border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20',
                    icon: 'text-green-600 dark:text-green-500'
                };
        }
    };

    if (insights.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Insights</CardTitle>
                    <CardDescription>No insights available yet</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        We need at least a week of calendar data to generate meaningful insights.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Insights & Recommendations</CardTitle>
                <CardDescription>AI-powered analysis of your calendar patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {insights.map(insight => {
                    const styles = getStyles(insight.type);
                    return (
                        <div
                            key={insight.id}
                            className={cn("p-4 rounded-lg", styles.card)}
                        >
                            <div className="flex items-start gap-3">
                                <div className={cn("mt-0.5", styles.icon)}>
                                    {getIcon(insight.type)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
