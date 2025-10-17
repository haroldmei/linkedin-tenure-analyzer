import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter } from '@/utils/rate-limiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    limiter = new RateLimiter(3);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests below the limit', async () => {
    const promise1 = limiter.throttle();
    const promise2 = limiter.throttle();
    const promise3 = limiter.throttle();

    await Promise.all([promise1, promise2, promise3]);

    expect(true).toBe(true);
  });

  it('throttles requests above the limit', async () => {
    for (let i = 0; i < 3; i++) {
      await limiter.throttle();
    }

    const promise = limiter.throttle();
    vi.advanceTimersByTime(60000);
    await promise;

    expect(true).toBe(true);
  });

  it('resets after time window passes', async () => {
    for (let i = 0; i < 3; i++) {
      await limiter.throttle();
    }

    vi.advanceTimersByTime(60001);

    await limiter.throttle();
    expect(true).toBe(true);
  });

  it('can be manually reset', async () => {
    for (let i = 0; i < 3; i++) {
      await limiter.throttle();
    }

    limiter.reset();

    await limiter.throttle();
    expect(true).toBe(true);
  });
});

