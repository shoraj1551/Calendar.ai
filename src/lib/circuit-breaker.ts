export class CircuitBreaker {
    private invalid = false;
    private failureCount = 0;
    private lastFailureTime = 0;

    constructor(
        private threshold: number = 3,
        private timeout: number = 30000 // 30s cooldown
    ) { }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.invalid) {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                // Try recovery
                this.invalid = false;
                this.failureCount = 0;
            } else {
                throw new Error("Circuit Breaker Open: Service Unavailable");
            }
        }

        try {
            const result = await fn();
            this.failureCount = 0; // Reset on success
            return result;
        } catch (error) {
            this.failureCount++;
            this.lastFailureTime = Date.now();
            if (this.failureCount >= this.threshold) {
                this.invalid = true;
                console.warn("Circuit Breaker Tripped!");
            }
            throw error;
        }
    }
}
