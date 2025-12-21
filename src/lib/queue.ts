type TaskFn = () => Promise<void>;

// Simple In-Memory Queue (MVP)
// In production, replace with Redis/BullMQ
export class TaskQueue {
    private queue: TaskFn[] = [];
    private isProcessing = false;

    constructor(private concurrency: number = 2) { }

    enqueue(task: TaskFn) {
        this.queue.push(task);
        this.process();
    }

    private async process() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const batch = this.queue.splice(0, this.concurrency);
            await Promise.all(batch.map(task =>
                task().catch(e => console.error("Task failed", e))
            ));
        }

        this.isProcessing = false;
    }
}

export const backgroundQueue = new TaskQueue();
