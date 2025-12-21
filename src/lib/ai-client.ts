import { AICommandResult } from "@/services/ai/types";

export interface AIClientResponse {
    success: boolean;
    data?: AICommandResult;
    error?: string;
}

export const processAICommand = async (text: string): Promise<AIClientResponse> => {
    try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const response = await fetch("/api/ai/command", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, timezone }),
        });

        if (!response.ok) {
            throw new Error("Failed to process command");
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("AI Client Error:", error);
        return { success: false, error: "Failed to connect to AI" };
    }
};
