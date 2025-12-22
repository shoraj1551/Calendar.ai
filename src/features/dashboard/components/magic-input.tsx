"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, X, Check, Loader2, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProposedChange {
    id: string;
    type: "create" | "update" | "delete";
    summary: string;
    original?: string;
}

export function MagicInput() {
    const [input, setInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [preview, setPreview] = useState<ProposedChange[] | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setIsThinking(true);
        try {
            const res = await fetch("/api/ai/preview", {
                method: "POST",
                body: JSON.stringify({ prompt: input })
            });
            const data = await res.json();
            setPreview(data.changes);
        } catch (e) {
            toast.error("Process failed. Try again.");
        } finally {
            setIsThinking(false);
        }
    };

    const handleConfirm = () => {
        toast.success("Changes applied successfully.");
        setPreview(null);
        setInput("");
    };

    const handleCancel = () => {
        setPreview(null);
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-8 relative z-20">
            <form onSubmit={handleSubmit} className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl transition-opacity duration-500 ${isThinking ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
                <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg flex items-center p-2 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
                    <div className="pl-3 pr-2 text-blue-500">
                        {isThinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Tell AI to manage your time (e.g., 'Clear my afternoon')..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-lg px-2 h-10 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                        disabled={isThinking || !!preview}
                    />
                    {!preview && input && (
                        <Button type="submit" size="sm" className="rounded-lg h-9 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </form>

            {/* Preview Card */}
            {preview && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-4 z-30">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-500" /> Proposed Changes
                        </h4>
                        <span className="text-xs text-gray-400">Preview Mode</span>
                    </div>

                    <div className="space-y-3 mb-4">
                        {preview.map((change) => (
                            <div key={change.id} className="flex items-start gap-3 text-sm p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className={`p-1.5 rounded-full mt-0.5 ${change.type === 'delete' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {change.type === 'update' ? <ArrowRightLeft className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">{change.summary}</div>
                                    {change.original && (
                                        <div className="text-gray-500 line-through text-xs mt-1">{change.original}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <Button className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-black hover:opacity-90" onClick={handleConfirm}>
                            <Check className="w-4 h-4 mr-2" /> Confirm Changes
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
