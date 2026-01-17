import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

export interface ExtractedActionItem {
    description: string;
    assignee?: string;
    dueDate?: string;
    priority: 'low' | 'medium' | 'high';
    confidence: number;
}

export interface MeetingSummary {
    summary: string;
    keyPoints: string[];
    decisions: string[];
    actionItems: ExtractedActionItem[];
}

export class ActionItemExtractor {
    /**
     * Extract action items and generate summary from meeting notes
     */
    static async extract(notes: string, meetingContext?: {
        title: string;
        date: Date;
        attendees?: string[];
    }): Promise<MeetingSummary> {
        const prompt = `You are an expert at analyzing meeting notes and extracting actionable items.

Meeting Context:
${meetingContext ? `
- Title: ${meetingContext.title}
- Date: ${meetingContext.date.toLocaleDateString()}
${meetingContext.attendees ? `- Attendees: ${meetingContext.attendees.join(', ')}` : ''}
` : ''}

Meeting Notes:
${notes}

Extract the following from these notes:

1. **Action Items**: Specific tasks that need to be done
   - Include who is responsible (if mentioned)
   - Include deadline (if mentioned)
   - Assign priority (high/medium/low)
   - Rate your confidence (0-1)

2. **Key Points**: Main discussion topics (3-5 bullet points)

3. **Decisions**: Important decisions made

4. **Summary**: 2-3 sentence overview of the meeting

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "summary": "Brief 2-3 sentence summary",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "decisions": ["Decision 1", "Decision 2"],
  "actionItems": [
    {
      "description": "Task description",
      "assignee": "Person name or null",
      "dueDate": "YYYY-MM-DD or null",
      "priority": "high|medium|low",
      "confidence": 0.95
    }
  ]
}

Example:
Input: "Team discussed Q1 roadmap. Sarah will prepare design mockups by next Friday. John to review API docs by Wednesday."

Output:
{
  "summary": "Team aligned on Q1 roadmap priorities and assigned initial tasks for design and documentation review.",
  "keyPoints": ["Q1 roadmap discussion", "Design mockups needed", "API documentation review"],
  "decisions": ["Proceed with current roadmap"],
  "actionItems": [
    {
      "description": "Prepare design mockups",
      "assignee": "Sarah",
      "dueDate": "2026-01-24",
      "priority": "high",
      "confidence": 0.95
    },
    {
      "description": "Review API documentation",
      "assignee": "John",
      "dueDate": "2026-01-22",
      "priority": "medium",
      "confidence": 0.90
    }
  ]
}`;

        try {
            const response = await openai.chat.completions.create({
                model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
            });

            const content = response.choices[0].message.content || '{}';
            const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(cleanContent);

            return {
                summary: parsed.summary || '',
                keyPoints: parsed.keyPoints || [],
                decisions: parsed.decisions || [],
                actionItems: parsed.actionItems || [],
            };
        } catch (error) {
            console.error('[ActionExtractor] Extraction failed:', error);
            throw error;
        }
    }

    /**
     * Fallback: Simple extraction using keywords
     */
    static extractSimple(notes: string): MeetingSummary {
        const lines = notes.split('\n').filter(line => line.trim());

        // Look for action-oriented keywords
        const actionKeywords = ['will', 'should', 'needs to', 'must', 'todo', 'action', 'task', 'to do'];
        const actionItems: ExtractedActionItem[] = [];

        lines.forEach(line => {
            const lowerLine = line.toLowerCase();
            if (actionKeywords.some(keyword => lowerLine.includes(keyword))) {
                // Try to extract assignee (name before "will" or "to")
                let assignee: string | undefined;
                const assigneeMatch = line.match(/(\w+)\s+(will|to|should)/i);
                if (assigneeMatch) {
                    assignee = assigneeMatch[1];
                }

                actionItems.push({
                    description: line.trim().replace(/^[-*•]\s*/, ''),
                    assignee,
                    priority: 'medium',
                    confidence: 0.6,
                });
            }
        });

        return {
            summary: lines.slice(0, 2).join(' ').substring(0, 200),
            keyPoints: lines.slice(0, 5).map(l => l.replace(/^[-*•]\s*/, '')),
            decisions: [],
            actionItems,
        };
    }
}
