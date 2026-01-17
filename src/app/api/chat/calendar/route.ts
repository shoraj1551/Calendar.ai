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

        // Use OpenRouter API directly
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages,
                ],
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.statusText}`);
        }

        const data = await response.json();
        const assistantMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

        return new Response(
            JSON.stringify({ message: assistantMessage }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error: any) {
        console.error('[Chat API] Error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Failed to process chat' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
