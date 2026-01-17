
import { SmartSlotService } from "./smart-slots";
import { UnifiedEvent } from "./types";
import { format, addDays, startOfDay, endOfDay, differenceInMinutes } from "date-fns";

export interface AlternativeSlot {
    start: Date;
    end: Date;
    formatted: string; // "Monday, Jan 22 at 2:00 PM"
}

export class NegotiationService {
    /**
     * Find 2-3 alternative time slots for rescheduling
     */
    static findAlternativeSlots(
        originalEvent: UnifiedEvent,
        allEvents: UnifiedEvent[],
        chronotype: 'bear' | 'wolf' | 'lion' | 'dolphin' = 'bear'
    ): AlternativeSlot[] {
        const duration = differenceInMinutes(originalEvent.end, originalEvent.start);
        const alternatives: AlternativeSlot[] = [];

        // Search for slots in the next 7 days
        const searchStart = startOfDay(new Date());

        for (let dayOffset = 0; dayOffset < 7 && alternatives.length < 3; dayOffset++) {
            const searchDate = addDays(searchStart, dayOffset);

            // Find focus slots for this day
            const slots = SmartSlotService.findFocusSlots(searchDate, allEvents, chronotype);

            // Filter slots that match the required duration
            for (const slot of slots) {
                if (alternatives.length >= 3) break;

                const slotDuration = differenceInMinutes(slot.end, slot.start);
                if (slotDuration >= duration) {
                    // Use the first portion of the slot
                    const end = new Date(slot.start.getTime() + duration * 60000);

                    alternatives.push({
                        start: slot.start,
                        end,
                        formatted: format(slot.start, "EEEE, MMM d 'at' h:mm a")
                    });
                }
            }
        }

        return alternatives;
    }

    /**
     * Generate professional reschedule email draft
     */
    static generateRescheduleEmail(
        event: UnifiedEvent,
        alternatives: AlternativeSlot[],
        userName: string,
        reason?: string
    ): { subject: string; body: string; mailto: string } {
        const organizerName = event.organizer?.displayName || event.organizer?.email || "there";
        const eventTitle = event.title;
        const originalTime = format(event.start, "EEEE, MMMM d 'at' h:mm a");

        const subject = `Request to Reschedule: ${eventTitle}`;

        let body = `Hi ${organizerName},\n\n`;
        body += `I hope this message finds you well. `;

        if (reason) {
            body += `${reason}\n\n`;
        } else {
            body += `I have a scheduling conflict with our meeting "${eventTitle}" currently scheduled for ${originalTime}.\n\n`;
        }

        body += `Would any of these alternative times work for you?\n`;
        alternatives.forEach((alt, idx) => {
            body += `• ${alt.formatted}\n`;
        });

        body += `\nPlease let me know what works best for your schedule.\n\n`;
        body += `Best regards,\n${userName}`;

        // Create mailto link
        const attendeeEmails = event.attendees?.map(a => a.email).filter(Boolean).join(',') || '';
        const mailto = `mailto:${attendeeEmails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        return { subject, body, mailto };
    }
}
