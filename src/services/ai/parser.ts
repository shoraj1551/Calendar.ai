import OpenAI from "openai";
import { AICommandResult } from "./types";

const openai = new OpenAI({
    apiKey: process.env.AI_API_KEY || "ollama",
    baseURL: process.env.AI_BASE_URL || "http://localhost:11434/v1",
});

const SYSTEM_PROMPT = `
You are a Calendar Assistant. Your job is to extract structured scheduling actions from natural language.
Today's date is: {{DATE}}.
Timezone: {{TIMEZONE}}.

Supported Intents:
1. create_event: Schedule a new meeting.
2. reschedule_event: Change time of existing meeting.
3. query_schedule: Ask about availability.

Output Format: JSON only. No markdown.
Structure:
{
  "intent": "create_event" | "reschedule_event" | "query_schedule",
  "params": { ... },
  "confidence": 0-1,
  "confirmationParams": { "message": "Confirming..." }
}

Examples:
Input: "Book a meeting with John tomorrow at 2pm for 1 hour"
Output: {
  "intent": "create_event",
  "params": {
    "title": "Meeting with John",
    "start": "2024-01-02T14:00:00",
    "end": "2024-01-02T15:00:00",
    "attendees": ["John"]
  },
  "confidence": 0.95
}
`;

export const parseCommand = async (text: string, userTimezone: string = "local"): Promise<AICommandResult> => {
    const today = new Date().toISOString();
    const prompt = SYSTEM_PROMPT.replace("{{DATE}}", today).replace("{{TIMEZONE}}", userTimezone);
    const model = process.env.AI_MODEL || "llama3";

    try {
        const response = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: text }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No response from AI");

        return JSON.parse(content) as AICommandResult;

    } catch (error) {
        console.error("AI Parse Error:", error);
        return {
            intent: "unknown",
            confidence: 0,
            rawText: text
        };
    }
};
