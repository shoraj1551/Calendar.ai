import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { CalendarContextBuilder } from '@/services/llm/context';
import { auth } from '@/auth';

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

        const result = await streamText({
            model: openai('gpt-4-turbo'),
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages,
            ],
            temperature: 0.7,
            maxTokens: 500,
        });

        return result.toDataStreamResponse();
    } catch (error: any) {
        console.error('[Chat API] Error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Failed to process chat' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

