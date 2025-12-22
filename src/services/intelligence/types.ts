import { UnifiedEvent } from "../calendar/types";

export type SuggestionType = "move_event" | "add_break" | "focus_block" | "shorten_event";

export interface Suggestion {
    id: string;
    type: SuggestionType;
    title: string;
    description: string;
    score: number; // Confidence/Impact score (0-100)
    reason?: string; // Explanation for the suggestion
    time?: string; // Human readable time context (e.g. "Tomorrow 10 AM")
    action: {
        type: "create" | "update" | "delete";
        event?: Partial<UnifiedEvent>; // The payload to apply
        targetEventId?: string;
    };
}

export interface DayMetrics {
    date: Date;
    totalMeetingMinutes: number;
    focusMinutes: number;
    longestFocusBlock: number;
    meetingCount: number;
    overloadScore: number; // 0-100 (100 = burned out)
    fragmentationScore: number; // 0-100 (100 = swiss cheese)
    lateWorkMinutes: number; // minutes of meetings after 5pm
    lunchBreak: boolean; // true if gap > 30m exists between 11:30 - 14:30
}

export interface AnalysisResult {
    period: {
        start: Date;
        end: Date;
    };
    metrics: DayMetrics[];
    suggestions: Suggestion[];
    overallScore: number; // Health score
}
