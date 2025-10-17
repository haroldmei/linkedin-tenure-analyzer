export class RateLimiter {
    constructor(maxRequestsPerMinute = 20) {
        this.requestTimes = [];
        this.maxRequestsPerMinute = maxRequestsPerMinute;
    }
    async throttle() {
        const now = Date.now();
        this.requestTimes = this.requestTimes.filter((t) => now - t < 60000);
        if (this.requestTimes.length >= this.maxRequestsPerMinute) {
            const oldestRequest = this.requestTimes[0];
            const waitTime = 60000 - (now - oldestRequest);
            if (waitTime > 0) {
                await new Promise((resolve) => setTimeout(resolve, waitTime));
            }
        }
        this.requestTimes.push(Date.now());
    }
    reset() {
        this.requestTimes = [];
    }
}
