import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RateLimiter } from '@/lib/rateLimiter';

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests up to max tokens', () => {
    const limiter = new RateLimiter({ maxTokens: 3, refillRate: 1 });
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(false); // exhausted
  });

  it('refills tokens over time', () => {
    const limiter = new RateLimiter({ maxTokens: 2, refillRate: 1 });
    limiter.tryAcquire();
    limiter.tryAcquire();
    expect(limiter.tryAcquire()).toBe(false);

    vi.advanceTimersByTime(1000); // 1 second = +1 token
    expect(limiter.tryAcquire()).toBe(true);
  });

  it('does not exceed maxTokens on refill', () => {
    const limiter = new RateLimiter({ maxTokens: 5, refillRate: 10 });
    vi.advanceTimersByTime(10_000); // would add 100 tokens but capped at 5
    expect(limiter.availableTokens).toBe(5);
  });

  it('reset restores full capacity', () => {
    const limiter = new RateLimiter({ maxTokens: 3, refillRate: 1 });
    limiter.tryAcquire();
    limiter.tryAcquire();
    limiter.tryAcquire();
    expect(limiter.tryAcquire()).toBe(false);

    limiter.reset();
    expect(limiter.tryAcquire()).toBe(true);
  });

  it('getWaitTime returns 0 when tokens available', () => {
    const limiter = new RateLimiter({ maxTokens: 5, refillRate: 1 });
    expect(limiter.getWaitTime()).toBe(0);
  });

  it('getWaitTime returns positive ms when exhausted', () => {
    const limiter = new RateLimiter({ maxTokens: 1, refillRate: 1 });
    limiter.tryAcquire();
    const wait = limiter.getWaitTime();
    expect(wait).toBeGreaterThan(0);
    expect(wait).toBeLessThanOrEqual(1000);
  });
});
