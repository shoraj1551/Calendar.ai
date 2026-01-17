import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { CalendarContextBuilder } from '@/services/llm/context';
import { auth } from '@/auth';

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY!,
    baseURL: 'https://openrouter.ai/api/v1',
});

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { messages } = await req.json();

        // Build calendar context for today
        const context = await CalendarContextBuilder.buildDayContext(
            session.user.id,
            new Date()
        );

        const systemPrompt = `You are a helpful calendar assistant for Calendar.ai. Use the following calendar data to answer questions:

${context}

Guidelines:
- Be concise, friendly, and actionable
- If asked about availability, suggest specific time slots
- Consider energy zones when recommending meeting times
- Mention pending tasks if relevant to the query
- Use a conversational tone

Answer the user's question based on this calendar data.`;

        const response = await openai.chat.completions.create({
            model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
            stream: true,
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages,
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        const stream = OpenAIStream(response);
        return new StreamingTextResponse(stream);
    } catch (error: any) {
        console.error('[Chat API] Error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Failed to process chat' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
