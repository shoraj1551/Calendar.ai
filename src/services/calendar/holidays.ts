import { UnifiedEvent } from "./types";

export const HolidayService = {
    getHolidays(year: number, ignoredHolidays: string[] = []): UnifiedEvent[] {
        // Indian Holidays (Comprehensive List for 2024-2025)
        // In a real production app, this should fetch from an external API (Google Calendar API / Nager.Date)
        // For this MVP, we use a robust static list.

        let holidaysData: { date: string; title: string; type: "public" | "festival" }[] = [];

        if (year === 2024) {
            holidaysData = [
                { date: "2024-01-01", title: "New Year's Day", type: "public" },
                { date: "2024-01-15", title: "Makar Sankranti / Pongal", type: "festival" },
                { date: "2024-01-26", title: "Republic Day", type: "public" },
                { date: "2024-03-08", title: "Maha Shivaratri", type: "festival" },
                { date: "2024-03-25", title: "Holi", type: "festival" },
                { date: "2024-03-29", title: "Good Friday", type: "public" },
                { date: "2024-04-09", title: "Ugadi / Gudi Padwa", type: "festival" },
                { date: "2024-04-11", title: "Eid-ul-Fitr", type: "festival" },
                { date: "2024-04-14", title: "Dr. Ambedkar Jayanti", type: "public" },
                { date: "2024-04-17", title: "Ram Navami", type: "festival" },
                { date: "2024-06-17", title: "Bakrid / Eid al-Adha", type: "festival" },
                { date: "2024-07-17", title: "Muharram", type: "festival" },
                { date: "2024-08-15", title: "Independence Day", type: "public" },
                { date: "2024-08-19", title: "Raksha Bandhan", type: "festival" },
                { date: "2024-08-26", title: "Janmashtami", type: "festival" },
                { date: "2024-09-07", title: "Ganesh Chaturthi", type: "festival" },
                { date: "2024-10-02", title: "Gandhi Jayanti", type: "public" },
                { date: "2024-10-12", title: "Dussehra", type: "festival" },
                { date: "2024-10-31", title: "Diwali", type: "festival" },
                { date: "2024-11-15", title: "Guru Nanak Jayanti", type: "festival" },
                { date: "2024-12-25", title: "Christmas", type: "public" },
            ];
        } else if (year === 2025) {
            holidaysData = [
                { date: "2025-01-01", title: "New Year's Day", type: "public" },
                { date: "2025-01-14", title: "Makar Sankranti / Pongal", type: "festival" },
                { date: "2025-01-26", title: "Republic Day", type: "public" },
                { date: "2025-02-26", title: "Maha Shivaratri", type: "festival" },
                { date: "2025-03-14", title: "Holi", type: "festival" },
                { date: "2025-03-31", title: "Eid-ul-Fitr", type: "festival" },
                { date: "2025-04-06", title: "Ram Navami", type: "festival" },
                { date: "2025-04-14", title: "Dr. Ambedkar Jayanti", type: "public" },
                { date: "2025-04-18", title: "Good Friday", type: "public" },
                { date: "2025-06-07", title: "Bakrid / Eid al-Adha", type: "festival" },
                { date: "2025-08-15", title: "Independence Day", type: "public" },
                { date: "2025-08-16", title: "Janmashtami", type: "festival" },
                { date: "2025-08-27", title: "Ganesh Chaturthi", type: "festival" },
                { date: "2025-10-02", title: "Gandhi Jayanti", type: "public" },
                { date: "2025-10-02", title: "Dussehra", type: "festival" },
                { date: "2025-10-20", title: "Diwali", type: "festival" },
                { date: "2025-11-05", title: "Guru Nanak Jayanti", type: "festival" },
                { date: "2025-12-25", title: "Christmas", type: "public" },
            ];
        }

        return holidaysData
            .filter(h => !ignoredHolidays.includes(h.title)) // Basic title match for MVP
            .map(h => {
                const d = new Date(h.date);
                const endD = new Date(h.date);
                endD.setHours(23, 59, 59, 999);
                return {
                    id: `holiday-${h.date}`,
                    title: h.title,
                    start: d,
                    end: endD,
                    allDay: true,
                    provider: "local",
                    status: "confirmed",
                    type: "holiday", // Explicit 'holiday' type is preferred over 'recovery' for UI clarity, but it ACTS as recovery.
                    description: `${h.type === 'public' ? 'Public Holiday' : 'Festival'} - Protected time for celebration and rest.`,
                };
            });
    }
};
