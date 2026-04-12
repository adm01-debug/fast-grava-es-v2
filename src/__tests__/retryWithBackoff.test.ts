import { describe, it, expect, vi } from 'vitest';
import { retryWithBackoff, isNetworkRetryable } from '@/lib/retryWithBackoff';

describe('retryWithBackoff', () => {
  it('returns on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure then succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    
    const result = await retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10, jitter: false });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('always fails'));
    
    await expect(
      retryWithBackoff(fn, { maxRetries: 2, baseDelay: 10, jitter: false })
    ).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('stops retrying when isRetryable returns false', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('permanent'));
    
    await expect(
      retryWithBackoff(fn, {
        maxRetries: 5,
        baseDelay: 10,
        isRetryable: () => false,
      })
    ).rejects.toThrow('permanent');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls onRetry callback', async () => {
    const onRetry = vi.fn();
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('temp'))
      .mockResolvedValue('ok');
    
    await retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10, onRetry, jitter: false });
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Number), expect.any(Error));
  });
});

describe('isNetworkRetryable', () => {
  it('returns true for network errors', () => {
    expect(isNetworkRetryable(new Error('network error'))).toBe(true);
    expect(isNetworkRetryable(new Error('timeout reached'))).toBe(true);
    expect(isNetworkRetryable(new Error('429 Too Many Requests'))).toBe(true);
    expect(isNetworkRetryable(new Error('503 Service Unavailable'))).toBe(true);
  });

  it('returns false for non-errors', () => {
    expect(isNetworkRetryable('string error')).toBe(false);
    expect(isNetworkRetryable(null)).toBe(false);
  });

  it('returns false for client errors', () => {
    expect(isNetworkRetryable(new Error('400 Bad Request'))).toBe(false);
    expect(isNetworkRetryable(new Error('404 Not Found'))).toBe(false);
  });
});
