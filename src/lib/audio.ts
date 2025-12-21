// Basic Audio Recorder using MediaRecorder API + Web Speech API for Realtime Text

export class MeetingRecorder {
    private mediaRecorder: MediaRecorder | null = null;
    private recognition: any | null = null;
    private chunks: Blob[] = [];
    private onTranscriptUpdate: (text: string) => void;

    constructor(onTranscriptUpdate: (text: string) => void) {
        this.onTranscriptUpdate = onTranscriptUpdate;
    }

    async start() {
        if (typeof window === "undefined") return;

        // 1. Audio Recording (Blob)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.chunks = [];

        this.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) this.chunks.push(e.data);
        };

        this.mediaRecorder.start();

        // 2. Speech Transcription (Web Speech API)
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = "en-US";

            this.recognition.onresult = (event: any) => {
                let finalTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + " ";
                    }
                }
                if (finalTranscript) {
                    this.onTranscriptUpdate(finalTranscript);
                }
            };

            this.recognition.start();
        } else {
            console.warn("Speech Recognition not supported in this browser.");
        }
    }

    stop(): Promise<{ audioBlob: Blob }> {
        return new Promise((resolve) => {
            if (this.recognition) this.recognition.stop();

            if (this.mediaRecorder) {
                this.mediaRecorder.onstop = () => {
                    const blob = new Blob(this.chunks, { type: "audio/webm" });
                    resolve({ audioBlob: blob });
                };
                this.mediaRecorder.stop();
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            } else {
                resolve({ audioBlob: new Blob([]) });
            }
        });
    }
}
