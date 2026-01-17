import OpenAI from 'openai';
import { addDays, setHours, setMinutes, startOfDay, nextMonday, nextTuesday, nextWednesday, nextThursday, nextFriday, nextSaturday, nextSunday } from 'date-fns';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

export interface ParsedEvent {
    title: string;
    startTime: Date;
    endTime: Date;
    description?: string;
    location?: string;
    confidence: number;
}

export class EventParser {
    /**
     * Parse natural language input into structured event
     */
    static async parse(input: string, referenceDate: Date = new Date()): Promise<ParsedEvent> {
        const prompt = `You are an expert at parsing natural language into calendar events.

Current date and time: ${referenceDate.toISOString()}
Current day of week: ${referenceDate.toLocaleDateString('en-US', { weekday: 'long' })}

Parse this input into a structured event: "${input}"

Extract:
1. Title (the main event description)
2. Date (relative to current date if needed)
3. Start time
4. Duration or end time (default 1 hour if not specified)
5. Location (if mentioned)
6. Any additional notes

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{
  "title": "Event title",
  "date": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "durationMinutes": 60,
  "location": "",
  "notes": "",
  "confidence": 0.95
}

Examples:
Input: "Lunch with Sarah tomorrow at noon"
Output: {"title":"Lunch with Sarah","date":"2026-01-18","startTime":"12:00","durationMinutes":60,"location":"","notes":"","confidence":0.95}

Input: "Team meeting next Monday 2pm for 1 hour"
Output: {"title":"Team meeting","date":"2026-01-20","startTime":"14:00","durationMinutes":60,"location":"","notes":"","confidence":0.98}

Input: "Coffee at Starbucks Friday morning"
Output: {"title":"Coffee","date":"2026-01-24","startTime":"09:00","durationMinutes":30,"location":"Starbucks","notes":"","confidence":0.85}`;

        try {
            const response = await openai.chat.completions.create({
                model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
            });

            const content = response.choices[0].message.content || '{}';

            // Remove markdown code blocks if present
            const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(cleanContent);

            // Convert to Date objects
            const [year, month, day] = parsed.date.split('-').map(Number);
            const [hours, minutes] = parsed.startTime.split(':').map(Number);

            const startTime = new Date(year, month - 1, day, hours, minutes);
            const endTime = new Date(startTime.getTime() + parsed.durationMinutes * 60000);

            return {
                title: parsed.title,
                startTime,
                endTime,
                description: parsed.notes || undefined,
                location: parsed.location || undefined,
                confidence: parsed.confidence,
            };
        } catch (error) {
            console.error('[EventParser] LLM parse failed:', error);
            throw error;
        }
    }

    /**
     * Fallback parser using regex patterns (no LLM)
     */
    static parseSimple(input: string, referenceDate: Date = new Date()): ParsedEvent | null {
        try {
            // Simple patterns for common cases
            const patterns = {
                tomorrow: /tomorrow/i,
                today: /today/i,
                nextWeek: /next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
                time: /(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
                noon: /noon/i,
                morning: /morning/i,
                afternoon: /afternoon/i,
                evening: /evening/i,
                duration: /for (\d+)\s*(hour|hr|minute|min)s?/i,
            };

            let date = startOfDay(referenceDate);

            // Parse date
            if (patterns.tomorrow.test(input)) {
                date = addDays(date, 1);
            } else if (patterns.today.test(input)) {
                date = startOfDay(referenceDate);
            } else if (patterns.nextWeek.test(input)) {
                const match = input.match(patterns.nextWeek);
                const dayMap: any = {
                    monday: nextMonday,
                    tuesday: nextTuesday,
                    wednesday: nextWednesday,
                    thursday: nextThursday,
                    friday: nextFriday,
                    saturday: nextSaturday,
                    sunday: nextSunday,
                };
                const dayFn = dayMap[match![1].toLowerCase()];
                date = dayFn(referenceDate);
            }

            // Parse time
            let hour = 12;
            let minute = 0;

            if (patterns.noon.test(input)) {
                hour = 12;
            } else if (patterns.morning.test(input)) {
                hour = 9;
            } else if (patterns.afternoon.test(input)) {
                hour = 14;
            } else if (patterns.evening.test(input)) {
                hour = 18;
            } else {
                const timeMatch = input.match(patterns.time);
                if (timeMatch) {
                    hour = parseInt(timeMatch[1]);
                    minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;

                    if (timeMatch[3]?.toLowerCase() === 'pm' && hour < 12) {
                        hour += 12;
                    } else if (timeMatch[3]?.toLowerCase() === 'am' && hour === 12) {
                        hour = 0;
                    }
                }
            }

            const startTime = setMinutes(setHours(date, hour), minute);

            // Parse duration (default 1 hour)
            let durationMinutes = 60;
            const durationMatch = input.match(patterns.duration);
            if (durationMatch) {
                const value = parseInt(durationMatch[1]);
                const unit = durationMatch[2].toLowerCase();
                durationMinutes = unit.startsWith('hour') ? value * 60 : value;
            }

            const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

            // Extract title (remove date/time keywords)
            let title = input
                .replace(patterns.tomorrow, '')
                .replace(patterns.today, '')
                .replace(patterns.nextWeek, '')
                .replace(patterns.time, '')
                .replace(patterns.noon, '')
                .replace(patterns.morning, '')
                .replace(patterns.afternoon, '')
                .replace(patterns.evening, '')
                .replace(patterns.duration, '')
                .replace(/\bat\b/gi, '')
                .replace(/\s+/g, ' ')
                .trim();

            return {
                title: title || 'New Event',
                startTime,
                endTime,
                confidence: 0.7,
            };
        } catch (error) {
            console.error('[EventParser] Simple parse failed:', error);
            return null;
        }
    }
}
