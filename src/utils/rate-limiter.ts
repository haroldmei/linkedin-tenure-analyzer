export class RateLimiter {
  private requestTimes: number[] = [];
  private readonly maxRequestsPerMinute: number;

  constructor(maxRequestsPerMinute = 20) {
    this.maxRequestsPerMinute = maxRequestsPerMinute;
  }

  async throttle(): Promise<void> {
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

  reset(): void {
    this.requestTimes = [];
  }
}

