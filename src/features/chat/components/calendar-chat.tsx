'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export function CalendarChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const suggestedQueries = [
        "What's my day look like?",
        "When am I free today?",
        "Summarize my week",
        "Do I have time for a 30-min meeting?",
    ];

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            if (!response.ok) throw new Error('Failed to get response');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            const assistantId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, {
                id: assistantId,
                role: 'assistant',
                content: ''
            }]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    assistantMessage += chunk;

                    setMessages(prev => prev.map(m =>
                        m.id === assistantId ? { ...m, content: assistantMessage } : m
                    ));
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please make sure the OpenRouter API key is configured in .env.local'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestedQuery = (query: string) => {
        setInput(query);
        setTimeout(() => {
            const form = document.querySelector('form');
            form?.requestSubmit();
        }, 0);
    };

    return (
        <Card className="flex flex-col h-[600px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <Sparkles className="h-12 w-12 text-primary mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Ask about your calendar</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            I can help you understand your schedule, find free time, and plan your day.
                        </p>
                        <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                            {suggestedQueries.map(q => (
                                <Button
                                    key={q}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => handleSuggestedQuery(q)}
                                >
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    {q}
                                </Button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map(m => (
                        <div
                            key={m.id}
                            className={cn(
                                "flex",
                                m.role === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[80%] rounded-lg px-4 py-2",
                                    m.role === 'user'
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted"
                                )}
                            >
                                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-4 py-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                        placeholder="Ask about your calendar..."
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </Card>
    );
}
