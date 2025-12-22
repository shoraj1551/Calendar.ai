"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ArrowRight, X, Moon, Sunrise, Coffee, Sparkles } from "lucide-react";
import { useCalendarEvents } from "@/features/calendar/hooks/use-calendar-events";
import { format } from "date-fns";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

type Step = "loading" | "intro" | "achievements" | "triage" | "reflection" | "summary";

export function BriefingModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<Step>("intro");
    const { events } = useCalendarEvents();
    const [reflection, setReflection] = useState("");

    // Derived Data
    const completedEvents = events.filter(e => e.end < new Date());
    // Mock pending for UX demo
    const [pendingTasks, setPendingTasks] = useState([
        { id: "1", title: "Review Q3 Report", due: "Today" },
        { id: "2", title: "Email Sarah", due: "Today" }
    ]);

    const handleOpen = () => {
        setIsOpen(true);
        setStep("intro");
    };

    const handleStart = () => {
        setStep("loading");
        setTimeout(() => setStep("achievements"), 1500);
    };

    const handleTriage = (id: string, action: "done" | "move") => {
        setPendingTasks(prev => prev.filter(t => t.id !== id));
        toast(action === "done" ? "Marked as done" : "Moved to tomorrow", {
            icon: action === "done" ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Sunrise className="w-4 h-4 text-orange-500" />
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2" onClick={handleOpen}>
                    <Moon className="w-4 h-4 text-indigo-500" />
                    Wind Down
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl min-h-[500px] flex flex-col justify-center bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 shadow-2xl transition-all duration-500">
                {step === "intro" && (
                    <div className="text-center space-y-6 animate-in fade-in zoom-in-95">
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Moon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ready to close the day?</h2>
                        <p className="text-gray-500 max-w-md mx-auto">
                            Take a moment to celebrate your wins, clear your head, and set yourself up for a calm morning.
                        </p>
                        <Button size="lg" className="w-full max-w-xs mx-auto bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleStart}>
                            Start Wind Down
                        </Button>
                    </div>
                )}

                {step === "loading" && (
                    <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                        <p className="text-sm font-medium text-gray-500">Analyzing your day...</p>
                    </div>
                )}

                {step === "achievements" && (
                    <div className="space-y-6 animate-in slide-in-from-right-8">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Today's Wins</h3>
                            <p className="text-sm text-gray-500">You completed {completedEvents.length} events today.</p>
                        </div>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {completedEvents.map(e => (
                                <div key={e.id} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{e.title}</span>
                                    <span className="ml-auto text-xs text-green-600/70">{format(e.end, "h:mm a")}</span>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full" onClick={() => setStep("triage")}>
                            Next: Clear the Deck <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}

                {step === "triage" && (
                    <div className="space-y-6 animate-in slide-in-from-right-8">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">What's Left?</h3>
                            <p className="text-sm text-gray-500">Decide now, don't worry later.</p>
                        </div>

                        {pendingTasks.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <Sparkles className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                                <p className="font-medium">All clear! Nothing pending.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingTasks.map(task => (
                                    <div key={task.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
                                        <span className="font-medium">{task.title}</span>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="text-orange-500 hover:text-orange-600" onClick={() => handleTriage(task.id, "move")}>
                                                <Sunrise className="w-4 h-4 mr-1" /> Tomorrow
                                            </Button>
                                            <Button size="sm" variant="outline" className="text-green-500 hover:text-green-600" onClick={() => handleTriage(task.id, "done")}>
                                                <CheckCircle2 className="w-4 h-4 mr-1" /> Done
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Button className="w-full" onClick={() => setStep("reflection")} disabled={pendingTasks.length > 0}>
                            {pendingTasks.length > 0 ? "Clear all to continue" : "Next: Reflect"} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}

                {step === "reflection" && (
                    <div className="space-y-6 animate-in slide-in-from-right-8">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Note to Self</h3>
                            <p className="text-sm text-gray-500">Clear your mind. What should you remember for tomorrow?</p>
                        </div>
                        <Textarea
                            placeholder="Tomorrow, remember to..."
                            className="min-h-[150px] text-lg p-4 resize-none bg-gray-50 dark:bg-gray-900/50"
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                        />
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setStep("summary")}>
                            Finish Day <CheckCircle2 className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}

                {step === "summary" && (
                    <div className="text-center space-y-8 animate-in zoom-in-95 duration-700">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto animate-bounce">
                            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Day Complete!</h2>
                            <p className="text-lg text-gray-500 mt-2">You accomplished {completedEvents.length} things today.</p>
                        </div>
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl max-w-md mx-auto">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2">My Note</h4>
                            <p className="italic text-gray-700 dark:text-gray-300">"{reflection || "No notes today, just vibes."}"</p>
                        </div>
                        <Button variant="ghost" className="text-gray-400 hover:text-gray-600" onClick={() => setIsOpen(false)}>
                            Close & Rest
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
