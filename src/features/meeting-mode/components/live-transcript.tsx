"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LiveTranscriptProps {
    segments: string[];
}

export function LiveTranscript({ segments }: LiveTranscriptProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [segments]);

    return (
        <div className="h-[400px] w-full max-w-2xl mx-auto mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
            <div className="h-full overflow-y-auto custom-scrollbar space-y-3 p-2">
                {segments.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 italic">
                        Waiting for speech...
                    </div>
                ) : (
                    segments.map((text, i) => (
                        <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                            <span className="text-xs font-mono text-gray-400 mt-1 shrink-0">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                                {text}
                            </p>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
