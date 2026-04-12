/**
 * Client-side rate limiter using the Token Bucket algorithm.
 * Prevents excessive API calls from the browser.
 */

interface RateLimiterOptions {
  /** Max tokens (burst capacity) */
  maxTokens: number;
  /** Tokens added per second */
  refillRate: number;
}

export class RateLimiter {
  private tokens: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;
  private lastRefill: number;

  constructor(options: RateLimiterOptions) {
    this.maxTokens = options.maxTokens;
    this.refillRate = options.refillRate;
    this.tokens = options.maxTokens;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }

  /** Try to consume a token. Returns true if allowed, false if rate-limited. */
  tryAcquire(): boolean {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }

  /** Returns time in ms until the next token is available. */
  getWaitTime(): number {
    this.refill();
    if (this.tokens >= 1) return 0;
    const deficit = 1 - this.tokens;
    return Math.ceil((deficit / this.refillRate) * 1000);
  }

  /** Reset the limiter to full capacity. */
  reset(): void {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }

  /** Current available tokens (for monitoring). */
  get availableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}

// ── Pre-configured instances ──

/** General API calls: 30 requests/min burst, 1/sec refill */
export const apiLimiter = new RateLimiter({ maxTokens: 30, refillRate: 1 });

/** Search/autocomplete: 10 requests burst, 2/sec refill */
export const searchLimiter = new RateLimiter({ maxTokens: 10, refillRate: 2 });

/** Auth attempts: 5 burst, 0.1/sec refill (1 every 10s) */
export const authLimiter = new RateLimiter({ maxTokens: 5, refillRate: 0.1 });
