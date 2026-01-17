'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WeeklyOverviewProps {
    data: Array<{
        date: string;
        work: number;
        meetings: number;
        focus: number;
        personal: number;
    }>;
}

export function WeeklyOverview({ data }: WeeklyOverviewProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Weekly Time Allocation</CardTitle>
                <CardDescription>Hours spent by category each day</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="date"
                            className="text-xs"
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                        />
                        <YAxis
                            label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                            className="text-xs"
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                            labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        />
                        <Legend />
                        <Bar dataKey="work" stackId="a" fill="#3b82f6" name="Work" />
                        <Bar dataKey="meetings" stackId="a" fill="#8b5cf6" name="Meetings" />
                        <Bar dataKey="focus" stackId="a" fill="#10b981" name="Focus" />
                        <Bar dataKey="personal" stackId="a" fill="#f59e0b" name="Personal" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
