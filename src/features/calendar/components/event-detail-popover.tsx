"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Mail } from "lucide-react";
import { UnifiedEvent } from "@/services/calendar/types";
import { format } from "date-fns";
import { generateRescheduleRequestAction } from "@/app/actions/calendar";
import { RescheduleDialog } from "./reschedule-dialog";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { MeetingNotesModal } from '@/features/meeting/components/meeting-notes-modal';

interface EventDetailPopoverProps {
    event: UnifiedEvent;
    children: React.ReactNode;
}

export function EventDetailPopover({ event, children }: EventDetailPopoverProps) {
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [emailDraft, setEmailDraft] = useState<any>(null);
    const [alternatives, setAlternatives] = useState<any[]>([]);
    const { data: session } = useSession();

    const handleRequestReschedule = async () => {
        if (!session?.user?.name) {
            toast.error("User name not found");
            return;
        }

        toast.loading("Generating reschedule request...");

        try {
            const result = await generateRescheduleRequestAction(
                event.id,
                session.user.name
            );

            toast.dismiss();

            if (result.success && result.draft) {
                setEmailDraft(result.draft);
                setAlternatives(result.alternatives || []);
                setIsRescheduleOpen(true);
            } else {
                toast.error(result.error || "Failed to generate request");
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to generate reschedule request");
        }
    };

    // Check if event has attendees (is a meeting)
    const hasAttendees = (event as any).attendees && (event as any).attendees.length > 0;

    return (
        <>
            <Popover>
                <PopoverTrigger asChild>
                    {children}
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                    <div className="space-y-3">
                        <div>
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            {event.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {event.description}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>
                                    {format(event.start, "MMM d, h:mm a")} - {format(event.end, "h:mm a")}
                                </span>
                            </div>

                            {event.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{event.location}</span>
                                </div>
                            )}

                            {hasAttendees && (
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>{(event as any).attendees.length} attendees</span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        {hasAttendees && (
                            <div className="flex gap-2 pt-2 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setNotesOpen(true)}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Add Notes
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setRescheduleOpen(true)}
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Reschedule
                                </Button>
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            <RescheduleDialog
                open={rescheduleOpen}
                onOpenChange={setRescheduleOpen}
                event={event}
            />

            <MeetingNotesModal
                open={notesOpen}
                onOpenChange={setNotesOpen}
                event={event}
            />
        </>
    );
}
