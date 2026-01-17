'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Loader2, CheckCircle2, Calendar, Clock, Users, FileText } from 'lucide-react';
import { extractActionItemsAction, saveMeetingNotesAction } from '@/app/actions/meeting-notes';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface MeetingNotesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: {
        id: string;
        title: string;
        startTime: Date;
        endTime: Date;
    };
}

export function MeetingNotesModal({ open, onOpenChange, event }: MeetingNotesModalProps) {
    const [notes, setNotes] = useState('');
    const [extracting, setExtracting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [extracted, setExtracted] = useState<any>(null);
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

    const handleExtract = async () => {
        if (!notes.trim()) {
            toast.error('Please enter some notes first');
            return;
        }

        setExtracting(true);
        const result = await extractActionItemsAction(notes, {
            title: event.title,
            date: event.startTime,
        });

        if (result.success && result.data) {
            setExtracted(result.data);
            // Select all items by default
            setSelectedItems(new Set(result.data.actionItems.map((_: any, i: number) => i)));
            toast.success(`Found ${result.data.actionItems.length} action items!`);
        } else {
            toast.error(result.error || 'Failed to extract action items');
        }

        setExtracting(false);
    };

    const handleSave = async () => {
        setSaving(true);

        const selectedActionItems = extracted?.actionItems.filter((_: any, i: number) =>
            selectedItems.has(i)
        ) || [];

        const result = await saveMeetingNotesAction({
            eventId: event.id,
            rawNotes: notes,
            summary: extracted?.summary,
            keyPoints: extracted?.keyPoints,
            decisions: extracted?.decisions,
            actionItems: selectedActionItems,
        });

        if (result.success) {
            toast.success(`Meeting notes saved! ${result.tasksCreated} tasks created.`);
            onOpenChange(false);
            setNotes('');
            setExtracted(null);
            setSelectedItems(new Set());
        } else {
            toast.error(result.error || 'Failed to save notes');
        }

        setSaving(false);
    };

    const toggleItem = (index: number) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedItems(newSelected);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Meeting Notes & Action Items
                    </DialogTitle>
                    <DialogDescription>
                        Add notes and let AI extract action items automatically
                    </DialogDescription>
                </DialogHeader>

                {/* Meeting Context */}
                <Card className="bg-muted/50">
                    <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{event.title}</h3>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(event.startTime, 'MMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {format(event.startTime, 'h:mm a')} - {format(event.endTime, 'h:mm a')}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Meeting Notes</label>
                    <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Paste your meeting transcript or type notes here...

Example:
- Discussed Q1 roadmap priorities
- Sarah will prepare design mockups by Friday
- John to review API documentation by Wednesday
- Decided to proceed with Option B for database migration"
                        className="min-h-[200px] font-mono text-sm"
                        disabled={extracting || saving}
                    />
                    <Button
                        onClick={handleExtract}
                        disabled={!notes.trim() || extracting || saving}
                        className="w-full"
                    >
                        {extracting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Extracting Action Items...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Extract Action Items with AI
                            </>
                        )}
                    </Button>
                </div>

                {/* Extracted Results */}
                {extracted && (
                    <div className="space-y-4">
                        {/* Summary */}
                        {extracted.summary && (
                            <Card>
                                <CardContent className="p-4">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        AI Summary
                                    </h4>
                                    <p className="text-sm text-muted-foreground">{extracted.summary}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Key Points */}
                        {extracted.keyPoints && extracted.keyPoints.length > 0 && (
                            <Card>
                                <CardContent className="p-4">
                                    <h4 className="font-semibold mb-2">Key Points</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                        {extracted.keyPoints.map((point: string, i: number) => (
                                            <li key={i}>{point}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Action Items */}
                        {extracted.actionItems && extracted.actionItems.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-3">
                                    Action Items ({selectedItems.size} selected)
                                </h4>
                                <div className="space-y-2">
                                    {extracted.actionItems.map((item: any, index: number) => (
                                        <Card key={index} className={selectedItems.has(index) ? 'border-primary' : ''}>
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-3">
                                                    <Checkbox
                                                        checked={selectedItems.has(index)}
                                                        onCheckedChange={() => toggleItem(index)}
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium">{item.description}</p>
                                                        <div className="flex gap-2 mt-2 flex-wrap">
                                                            {item.assignee && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Users className="h-3 w-3 mr-1" />
                                                                    {item.assignee}
                                                                </Badge>
                                                            )}
                                                            {item.dueDate && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Calendar className="h-3 w-3 mr-1" />
                                                                    {format(new Date(item.dueDate), 'MMM d')}
                                                                </Badge>
                                                            )}
                                                            <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                                                                {item.priority}
                                                            </Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                                {Math.round(item.confidence * 100)}% confident
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <Button
                            onClick={handleSave}
                            disabled={saving || selectedItems.size === 0}
                            className="w-full"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Save Notes & Create {selectedItems.size} Tasks
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
