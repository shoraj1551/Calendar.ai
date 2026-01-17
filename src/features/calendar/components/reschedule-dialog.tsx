
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Mail, Check } from "lucide-react";
import { toast } from "sonner";

interface RescheduleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    eventTitle: string;
    emailDraft: {
        subject: string;
        body: string;
        mailto: string;
    } | null;
    alternatives: Array<{ formatted: string }>;
}

export function RescheduleDialog({
    isOpen,
    onClose,
    eventTitle,
    emailDraft,
    alternatives
}: RescheduleDialogProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!emailDraft) return;

        const fullText = `Subject: ${emailDraft.subject}\n\n${emailDraft.body}`;
        await navigator.clipboard.writeText(fullText);
        setCopied(true);
        toast.success("Copied to clipboard!");

        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenEmail = () => {
        if (!emailDraft) return;
        window.location.href = emailDraft.mailto;
    };

    if (!emailDraft) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Request Reschedule</DialogTitle>
                    <DialogDescription>
                        Email draft for rescheduling "{eventTitle}"
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Subject</Label>
                        <Input value={emailDraft.subject} readOnly className="mt-1" />
                    </div>

                    <div>
                        <Label>Alternative Time Slots</Label>
                        <div className="mt-2 space-y-1">
                            {alternatives.map((alt, idx) => (
                                <div key={idx} className="text-sm p-2 bg-muted rounded">
                                    • {alt.formatted}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <Label>Email Body</Label>
                        <Textarea
                            value={emailDraft.body}
                            readOnly
                            className="mt-1 min-h-[200px] font-mono text-sm"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="outline" onClick={handleCopy}>
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy to Clipboard
                            </>
                        )}
                    </Button>
                    <Button onClick={handleOpenEmail}>
                        <Mail className="h-4 w-4 mr-2" />
                        Open in Email Client
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
