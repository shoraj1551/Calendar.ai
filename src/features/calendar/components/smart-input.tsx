'use client';

import { useState, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Calendar, Clock, MapPin, Loader2, X } from 'lucide-react';
import { parseEventAction, createEventFromNLAction } from '@/app/actions/smart-input';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function SmartInput() {
    const [input, setInput] = useState('');
    const [parsing, setParsing] = useState(false);
    const [preview, setPreview] = useState<any>(null);
    const [creating, setCreating] = useState(false);

    const handleParse = async () => {
        if (!input.trim()) return;

        setParsing(true);
        const result = await parseEventAction(input);

        if (result.success && result.event) {
            setPreview(result.event);
        } else {
            toast.error(result.error || 'Could not parse event. Try being more specific.');
        }

        setParsing(false);
    };

    const handleCreate = async () => {
        if (!preview) return;

        setCreating(true);
        const result = await createEventFromNLAction(preview);

        if (result.success) {
            toast.success('Event created!');
            setInput('');
            setPreview(null);
        } else {
            toast.error(result.error || 'Failed to create event');
        }

        setCreating(false);
    };

    const handleCancel = () => {
        setPreview(null);
        setInput('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !parsing && !preview) {
            handleParse();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder='Try "Lunch with Sarah tomorrow at noon" or "Team meeting next Monday 2pm"...'
                        className="pl-10"
                        disabled={parsing || !!preview}
                    />
                </div>
                {!preview && (
                    <Button
                        onClick={handleParse}
                        disabled={!input.trim() || parsing}
                    >
                        {parsing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Parsing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Parse
                            </>
                        )}
                    </Button>
                )}
            </div>

            {preview && (
                <Card className="border-primary bg-primary/5">
                    <CardContent className="p-4">
                        <div className="space-y-3">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{preview.title}</h3>
                                        <span className="text-xs px-2 py-1 bg-primary/10 rounded-full">
                                            {Math.round(preview.confidence * 100)}% confident
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        {format(new Date(preview.startTime), 'EEEE, MMMM d, yyyy')}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        {format(new Date(preview.startTime), 'h:mm a')} - {format(new Date(preview.endTime), 'h:mm a')}
                                        <span className="text-xs">
                                            ({Math.round((new Date(preview.endTime).getTime() - new Date(preview.startTime).getTime()) / 60000)} min)
                                        </span>
                                    </div>

                                    {preview.location && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4" />
                                            {preview.location}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleCancel}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreate}
                                        disabled={creating}
                                        size="sm"
                                    >
                                        {creating ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Event'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Example suggestions */}
            {!preview && !input && (
                <div className="text-xs text-muted-foreground">
                    <p className="mb-1">Try these examples:</p>
                    <div className="flex flex-wrap gap-2">
                        {[
                            "Lunch tomorrow at noon",
                            "Team meeting next Monday 2pm",
                            "Coffee Friday morning",
                        ].map((example) => (
                            <button
                                key={example}
                                onClick={() => setInput(example)}
                                className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs transition-colors"
                            >
                                {example}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
