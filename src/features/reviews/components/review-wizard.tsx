"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Compass, Infinity, ArrowRight, CheckCircle2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type ReviewType = "weekly" | "monthly" | "yearly";

type Step = "intro" | "data" | "reflection" | "planning" | "closing";

interface ReviewConfig {
    title: string;
    subtitle: string;
    icon: any;
    color: string;
    questions: string[];
}

const CONFIGS: Record<ReviewType, ReviewConfig> = {
    weekly: {
        title: "Weekly Reset",
        subtitle: "Clear the clutter. Plan the attack.",
        icon: Calendar,
        color: "text-indigo-600 dark:text-indigo-400",
        questions: ["What was your biggest win?", "What got stuck?", "One goal for next week?"]
    },
    monthly: {
        title: "Monthly Compass",
        subtitle: "Check your direction. Adjust course.",
        icon: Compass,
        color: "text-purple-600 dark:text-purple-400",
        questions: ["Are you happy with your time allocation?", "What gave you energy?", "What drained you?"]
    },
    yearly: {
        title: "Yearly Odyssey",
        subtitle: "The big picture. Your legacy.",
        icon: Infinity,
        color: "text-yellow-600 dark:text-yellow-400",
        questions: ["What defined this year?", "What did you learn?", "Who do you want to be next year?"]
    }
};

export function ReviewWizard({ type }: { type: ReviewType }) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<Step>("intro");
    const config = CONFIGS[type];
    const Icon = config.icon;

    // Reflection Answers
    const [answers, setAnswers] = useState<string[]>(["", "", ""]);

    const handleOpen = () => {
        setIsOpen(true);
        setStep("intro");
    };

    const updateAnswer = (index: number, val: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = val;
        setAnswers(newAnswers);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div onClick={handleOpen} className="cursor-pointer group flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span>{type.charAt(0).toUpperCase() + type.slice(1)} Review</span>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl min-h-[500px] flex flex-col justify-center bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800 shadow-2xl">

                {step === "intro" && (
                    <div className="text-center space-y-6 animate-in fade-in zoom-in-95">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gray-100 dark:bg-gray-900`}>
                            <Icon className={`w-8 h-8 ${config.color}`} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{config.title}</h2>
                        <p className="text-gray-500 max-w-md mx-auto">{config.subtitle}</p>
                        <Button size="lg" className="w-full max-w-xs mx-auto" onClick={() => setStep("data")}>
                            Begin Ritual
                        </Button>
                    </div>
                )}

                {step === "data" && (
                    <div className="space-y-6 animate-in slide-in-from-right-8">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">The Data</h3>
                            <p className="text-sm text-gray-500">A look back at the numbers.</p>
                        </div>
                        {/* Mock Data Visualization */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                                <div className="text-2xl font-bold">85%</div>
                                <div className="text-xs text-gray-500">Focus Score</div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                                <div className="text-2xl font-bold">12h</div>
                                <div className="text-xs text-gray-500">Deep Work</div>
                            </div>
                        </div>
                        <Button className="w-full" onClick={() => setStep("reflection")}>
                            Next: Reflection <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}

                {step === "reflection" && (
                    <div className="space-y-6 animate-in slide-in-from-right-8">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Reflect</h3>
                            <p className="text-sm text-gray-500">Deep thoughts only.</p>
                        </div>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {config.questions.map((q, i) => (
                                <div key={i} className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{q}</label>
                                    <Textarea
                                        value={answers[i]}
                                        onChange={(e) => updateAnswer(i, e.target.value)}
                                        className="bg-gray-50 dark:bg-gray-900/50 min-h-[80px]"
                                    />
                                </div>
                            ))}
                        </div>
                        <Button className="w-full" onClick={() => setStep("closing")}>
                            Finish Review <CheckCircle2 className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}

                {step === "closing" && (
                    <div className="text-center space-y-8 animate-in zoom-in-95 duration-700">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto animate-bounce">
                            <Icon className={`w-10 h-10 ${config.color}`} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cycle Complete</h2>
                            <p className="text-lg text-gray-500 mt-2">You are ready for the next chapter.</p>
                        </div>
                        <Button variant="ghost" className="text-gray-400 hover:text-gray-600" onClick={() => setIsOpen(false)}>
                            Close
                        </Button>
                    </div>
                )}

            </DialogContent>
        </Dialog>
    );
}
