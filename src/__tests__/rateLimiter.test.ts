import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from '@/lib/rateLimiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({ maxTokens: 3, refillRate: 1 });
  });

  it('allows requests up to burst capacity', () => {
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(true);
  });

  it('blocks requests when tokens are exhausted', () => {
    limiter.tryAcquire();
    limiter.tryAcquire();
    limiter.tryAcquire();
    expect(limiter.tryAcquire()).toBe(false);
  });

  it('reports wait time when exhausted', () => {
    limiter.tryAcquire();
    limiter.tryAcquire();
    limiter.tryAcquire();
    expect(limiter.getWaitTime()).toBeGreaterThan(0);
  });

  it('reports zero wait time when tokens available', () => {
    expect(limiter.getWaitTime()).toBe(0);
  });

  it('resets to full capacity', () => {
    limiter.tryAcquire();
    limiter.tryAcquire();
    limiter.tryAcquire();
    limiter.reset();
    expect(limiter.availableTokens).toBe(3);
  });

  it('tracks available tokens', () => {
    expect(limiter.availableTokens).toBe(3);
    limiter.tryAcquire();
    expect(limiter.availableTokens).toBe(2);
  });
});
