'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, Zap, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { getFocusSuggestionsAction, bookFocusSessionAction } from '@/app/actions/focus';
import { toast } from 'sonner';

interface FocusSlot {
    start: Date;
    end: Date;
    duration: number;
    qualityScore: number;
    energyLevel: 'high' | 'medium' | 'low';
    reason: string;
}

export function FocusSuggestions() {
    const [slots, setSlots] = useState<FocusSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState<string | null>(null);

    useEffect(() => {
        loadSuggestions();
    }, []);

    const loadSuggestions = async () => {
        setLoading(true);
        const result = await getFocusSuggestionsAction();
        if (result.success && result.slots) {
            // Convert date strings to Date objects
            const slotsWithDates = result.slots.map((slot: any) => ({
                ...slot,
                start: new Date(slot.start),
                end: new Date(slot.end)
            }));
            setSlots(slotsWithDates);
        }
        setLoading(false);
    };

    const handleBookSlot = async (slot: FocusSlot) => {
        const slotKey = slot.start.toISOString();
        setBooking(slotKey);

        const result = await bookFocusSessionAction(
            slot.start.toISOString(),
            slot.end.toISOString()
        );

        if (result.success) {
            toast.success('Focus session booked!');
            loadSuggestions(); // Refresh suggestions
        } else {
            toast.error(result.error || 'Failed to book focus session');
        }

        setBooking(null);
    };

    const getEnergyBadge = (level: string) => {
        const colors = {
            high: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
        };
        return colors[level as keyof typeof colors] || colors.medium;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                    <span>Finding optimal focus slots...</span>
                </CardContent>
            </Card>
        );
    }

    if (slots.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Focus Slots Available</CardTitle>
                    <CardDescription>
                        Your calendar is fully booked. Consider rescheduling some meetings to create focus time.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">AI-Recommended Focus Sessions</h3>
            </div>

            {slots.slice(0, 3).map((slot) => (
                <Card key={slot.start.toISOString()} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <Badge variant="outline" className={getEnergyBadge(slot.energyLevel)}>
                                        <Zap className="h-3 w-3 mr-1" />
                                        {slot.energyLevel} energy
                                    </Badge>
                                    <Badge variant="secondary">
                                        Score: {slot.qualityScore}/100
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <Calendar className="h-4 w-4" />
                                    {format(slot.start, 'EEEE, MMM d')}
                                </div>

                                <div className="flex items-center gap-2 font-medium mb-2">
                                    <Clock className="h-4 w-4" />
                                    {format(slot.start, 'h:mm a')} - {format(slot.end, 'h:mm a')}
                                    <span className="text-muted-foreground text-sm">
                                        ({slot.duration} min)
                                    </span>
                                </div>

                                <p className="text-sm text-muted-foreground">{slot.reason}</p>
                            </div>

                            <Button
                                onClick={() => handleBookSlot(slot)}
                                disabled={booking === slot.start.toISOString()}
                                size="sm"
                                className="shrink-0"
                            >
                                {booking === slot.start.toISOString() ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        Booking...
                                    </>
                                ) : (
                                    'Book'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
