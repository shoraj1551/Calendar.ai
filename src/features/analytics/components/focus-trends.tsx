'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FocusTrendsProps {
    data: Array<{
        date: string;
        focusHours: number;
    }>;
}

export function FocusTrends({ data }: FocusTrendsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Focus Time Trends</CardTitle>
                <CardDescription>Daily focus time over the past 4 weeks</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="date"
                            className="text-xs"
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis
                            label={{ value: 'Focus Hours', angle: -90, position: 'insideLeft' }}
                            className="text-xs"
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                            labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        />
                        <Area
                            type="monotone"
                            dataKey="focusHours"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#colorFocus)"
                            name="Focus Hours"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
