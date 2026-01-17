
import { UnifiedEvent } from "./types";

export interface EventContext {
    tags: string[]; // '#focus', '#1:1', '#team'
    category: 'deep_work' | 'collaboration' | 'admin' | 'social' | 'unknown';
    urgency: 'high' | 'medium' | 'low';
}

export class ContextService {
    static analyze(event: UnifiedEvent): EventContext {
        const text = (event.title + " " + (event.description || "")).toLowerCase();
        const tags: string[] = [];
        let category: EventContext['category'] = 'unknown';

        // 1. Tagging Logic
        if (text.includes("1:1") || text.includes("one-on-one") || text.includes("sync with")) {
            tags.push("#1:1");
            category = 'collaboration';
        }

        if (text.includes("standup") || text.includes("daily") || text.includes("check-in")) {
            tags.push("#routine");
            category = 'admin'; // Routine meetings are often admin/maintenance
        }

        if (text.includes("brainstorm") || text.includes("workshop") || text.includes("strategy")) {
            tags.push("#creative");
            category = 'collaboration';
        }

        if (text.includes("focus") || text.includes("blocked") || text.includes("deep work")) {
            tags.push("#focus");
            category = 'deep_work';
        }

        if (text.includes("lunch") || text.includes("coffee") || text.includes("dinner")) {
            tags.push("#social");
            category = 'social';
        }

        // 2. Category Fallback
        if (category === 'unknown') {
            if (event.attendees && event.attendees.length > 2) category = 'collaboration';
            else if (event.attendees && event.attendees.length === 0) category = 'deep_work'; // Solo usually means work
            else category = 'collaboration';
        }

        return {
            tags,
            category,
            urgency: 'medium' // placeholder
        };
    }
}
