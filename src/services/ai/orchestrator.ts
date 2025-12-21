import OpenAI from "openai";
import { ContextAssembler } from "./context";
import { SYSTEM_PROMPTS } from "./prompts";
import { CircuitBreaker } from "@/lib/circuit-breaker";
import { backgroundQueue } from "@/lib/queue";

const openai = new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env.AI_BASE_URL,
});

const breaker = new CircuitBreaker();

export const AIOrchestrator = {
    // Main Entry: Process User Natural Language Command
    // Protected by Circuit Breaker
    async processCommand(userId: string, userQuery: string) {
        return await breaker.execute(async () => {
            // 1. Assemble Context (The "Brain")
            const context = await ContextAssembler.assemble(userId);

            // 2. Format Prompt
            const systemPrompt = SYSTEM_PROMPTS.COMMAND_PARSER.replace("{{CONTEXT}}", context);

            // 3. Call AI
            const response = await openai.chat.completions.create({
                model: process.env.AI_MODEL || "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userQuery }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error("No response from AI");

            return JSON.parse(content);
        });
    },

    // Feature: Generate Daily Briefing
    async generateDailyBrief(userId: string) {
        return await breaker.execute(async () => {
            const context = await ContextAssembler.assemble(userId);
            const systemPrompt = SYSTEM_PROMPTS.DAILY_BRIEF.replace("{{CONTEXT}}", context);

            const response = await openai.chat.completions.create({
                model: process.env.AI_MODEL || "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: "Generate my daily briefing." }
                ]
            });

            return response.choices[0].message.content;
        });
    },

    // Background Task: Deep Analysis
    // Uses Async Queue
    async scheduleDeepAnalysis(userId: string) {
        backgroundQueue.enqueue(async () => {
            console.log(`Starting deep analysis for ${userId}...`);
            // Mocking a heavy task (e.g., retrieving last 30 days of events and summarizing)
            await new Promise(resolve => setTimeout(resolve, 2000));
            // In real app: save result to DB or send notification
            console.log(`Deep analysis for ${userId} complete.`);
        });
        return { status: "queued" };
    }
};
