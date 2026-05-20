import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { retryWithBackoff, isNetworkRetryable } from '@/lib/retryWithBackoff';

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('resolves immediately on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await retryWithBackoff(fn, { maxRetries: 3 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries after failure and eventually succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success');

    const promise = retryWithBackoff(fn, { maxRetries: 3, baseDelay: 100, jitter: false });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws after exhausting all retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));

    const promise = retryWithBackoff(fn, { maxRetries: 2, baseDelay: 100, jitter: false });
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('does not retry when isRetryable returns false', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('non-retryable'));
    const isRetryable = vi.fn().mockReturnValue(false);

    await expect(
      retryWithBackoff(fn, { maxRetries: 3, isRetryable })
    ).rejects.toThrow('non-retryable');

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls onRetry callback with correct attempt and delay', async () => {
    const onRetry = vi.fn();
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('e1'))
      .mockRejectedValueOnce(new Error('e2'))
      .mockResolvedValue('done');

    const promise = retryWithBackoff(fn, {
      maxRetries: 3,
      baseDelay: 1000,
      factor: 2,
      jitter: false,
      onRetry,
    });
    await vi.runAllTimersAsync();
    await promise;

    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onRetry.mock.calls[0][0]).toBe(1); // attempt 1
    expect(onRetry.mock.calls[1][0]).toBe(2); // attempt 2
    expect(onRetry.mock.calls[0][1]).toBe(1000); // 1000ms delay
    expect(onRetry.mock.calls[1][1]).toBe(2000); // 2000ms delay (exponential)
  });

  it('respects maxDelay cap', async () => {
    const onRetry = vi.fn();
    const fn = vi.fn().mockRejectedValue(new Error('e'));

    const promise = retryWithBackoff(fn, {
      maxRetries: 1,
      baseDelay: 10_000,
      factor: 10,
      maxDelay: 5000,
      jitter: false,
      onRetry,
    });
    await vi.runAllTimersAsync();
    await promise.catch(() => {});

    expect(onRetry.mock.calls[0][1]).toBe(5000); // capped
  });

  it('maxRetries: 0 means single attempt only', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(retryWithBackoff(fn, { maxRetries: 0 })).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('jitter produces values within [0, baseDelay] range', async () => {
    const delays: number[] = [];
    const fn = vi.fn().mockRejectedValue(new Error('e'));

    for (let i = 0; i < 20; i++) {
      const onRetry = (attempt: number, delay: number) => delays.push(delay);
      const p = retryWithBackoff(fn, {
        maxRetries: 1,
        baseDelay: 1000,
        factor: 1,
        jitter: true,
        onRetry,
      });
      await vi.runAllTimersAsync();
      await p.catch(() => {});
    }

    expect(delays.every(d => d >= 0 && d <= 1000)).toBe(true);
    // jitter should produce different values
    const unique = new Set(delays);
    expect(unique.size).toBeGreaterThan(1);
  });
});

describe('isNetworkRetryable', () => {
  const cases: [string, boolean][] = [
    ['network error', true],
    ['fetch failed', true],
    ['timeout exceeded', true],
    ['econnrefused', true],
    ['429 too many requests', true],
    ['rate limit exceeded', true],
    ['500 internal server error', true],
    ['502 bad gateway', true],
    ['503 service unavailable', true],
    ['504 gateway timeout', true],
    ['401 unauthorized', false],
    ['400 bad request', false],
    ['not found', false],
    ['validation error', false],
  ];

  it.each(cases)('"%s" → retryable=%s', (msg, expected) => {
    expect(isNetworkRetryable(new Error(msg))).toBe(expected);
  });

  it('returns false for non-Error values', () => {
    expect(isNetworkRetryable('string error')).toBe(false);
    expect(isNetworkRetryable(null)).toBe(false);
    expect(isNetworkRetryable(42)).toBe(false);
  });
});
