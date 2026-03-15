import { describe, it, expect } from 'vitest';
import {
  calculateRetryDelay,
  shouldRetry,
  calculateRange,
  createPaginatedResult,
  STALE_TIMES,
  RETRY_CONFIG,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '../../lib/queryConfig';

// ===== RETRY DELAY =====
describe('calculateRetryDelay', () => {
  it('first retry is ~1 second', () => {
    const delay = calculateRetryDelay(0);
    expect(delay).toBeGreaterThanOrEqual(750);
    expect(delay).toBeLessThanOrEqual(1250);
  });

  it('second retry is ~2 seconds', () => {
    const delay = calculateRetryDelay(1);
    expect(delay).toBeGreaterThanOrEqual(1500);
    expect(delay).toBeLessThanOrEqual(2500);
  });

  it('third retry is ~4 seconds', () => {
    const delay = calculateRetryDelay(2);
    expect(delay).toBeGreaterThanOrEqual(3000);
    expect(delay).toBeLessThanOrEqual(5000);
  });

  it('caps at max delay', () => {
    const delay = calculateRetryDelay(20);
    expect(delay).toBeLessThanOrEqual(RETRY_CONFIG.maxDelay * 1.25);
  });

  it('includes jitter (different results)', () => {
    const delays = new Set(Array.from({ length: 20 }, () => calculateRetryDelay(0)));
    expect(delays.size).toBeGreaterThan(1);
  });

  it('always returns positive number', () => {
    for (let i = 0; i < 10; i++) {
      expect(calculateRetryDelay(i)).toBeGreaterThan(0);
    }
  });
});

// ===== SHOULD RETRY =====
describe('shouldRetry', () => {
  // Retryable
  it('retries network errors', () => {
    expect(shouldRetry(new Error('Network Error'))).toBe(true);
    expect(shouldRetry(new Error('Failed to fetch'))).toBe(true);
  });

  it('retries timeout errors', () => {
    expect(shouldRetry(new Error('Request timeout'))).toBe(true);
    expect(shouldRetry(new Error('408 Request Timeout'))).toBe(true);
  });

  it('retries rate limiting', () => {
    expect(shouldRetry(new Error('429 Too Many Requests'))).toBe(true);
    expect(shouldRetry(new Error('rate limit exceeded'))).toBe(true);
  });

  it('retries server errors', () => {
    expect(shouldRetry(new Error('500 Internal Server Error'))).toBe(true);
    expect(shouldRetry(new Error('502 Bad Gateway'))).toBe(true);
    expect(shouldRetry(new Error('503 Service Unavailable'))).toBe(true);
    expect(shouldRetry(new Error('504 Gateway Timeout'))).toBe(true);
  });

  // Non-retryable
  it('does not retry auth errors', () => {
    expect(shouldRetry(new Error('401 Unauthorized'))).toBe(false);
    expect(shouldRetry(new Error('403 Forbidden'))).toBe(false);
  });

  it('does not retry not found', () => {
    expect(shouldRetry(new Error('404 Not Found'))).toBe(false);
  });

  it('does not retry validation errors', () => {
    expect(shouldRetry(new Error('400 Bad Request'))).toBe(false);
    expect(shouldRetry(new Error('422 Validation Error'))).toBe(false);
  });

  it('retries unknown errors by default', () => {
    expect(shouldRetry(new Error('Something went wrong'))).toBe(true);
    expect(shouldRetry('string error')).toBe(true);
    expect(shouldRetry(null)).toBe(true);
  });
});

// ===== STALE TIMES =====
describe('STALE_TIMES configuration', () => {
  it('static data has longer stale time', () => {
    expect(STALE_TIMES.STATIC).toBeGreaterThan(STALE_TIMES.DYNAMIC);
  });

  it('realtime has shortest stale time', () => {
    expect(STALE_TIMES.REALTIME).toBeLessThan(STALE_TIMES.DYNAMIC);
  });

  it('all stale times are positive', () => {
    Object.values(STALE_TIMES).forEach(time => {
      expect(time).toBeGreaterThan(0);
    });
  });
});

// ===== PAGINATION: calculateRange =====
describe('calculateRange', () => {
  it('first page starts at 0', () => {
    const { from, to } = calculateRange(1, 50);
    expect(from).toBe(0);
    expect(to).toBe(49);
  });

  it('second page starts at pageSize', () => {
    const { from, to } = calculateRange(2, 50);
    expect(from).toBe(50);
    expect(to).toBe(99);
  });

  it('clamps page to minimum 1', () => {
    const { from, to } = calculateRange(0, 50);
    expect(from).toBe(0);
    expect(to).toBe(49);
  });

  it('clamps negative page', () => {
    const { from, to } = calculateRange(-5, 50);
    expect(from).toBe(0);
  });

  it('clamps pageSize to MAX_PAGE_SIZE', () => {
    const { from, to } = calculateRange(1, 500);
    expect(to - from + 1).toBe(MAX_PAGE_SIZE);
  });

  it('clamps pageSize to minimum 1', () => {
    const { from, to } = calculateRange(1, 0);
    expect(to - from + 1).toBe(1);
  });

  it('handles large page numbers', () => {
    const { from, to } = calculateRange(100, 50);
    expect(from).toBe(4950);
    expect(to).toBe(4999);
  });
});

// ===== PAGINATION: createPaginatedResult =====
describe('createPaginatedResult', () => {
  it('creates correct result for first page', () => {
    const result = createPaginatedResult(['a', 'b', 'c'], 10, 1, 3);
    expect(result.data).toEqual(['a', 'b', 'c']);
    expect(result.totalCount).toBe(10);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(4); // ceil(10/3)
    expect(result.hasNextPage).toBe(true);
    expect(result.hasPreviousPage).toBe(false);
  });

  it('creates correct result for last page', () => {
    const result = createPaginatedResult(['j'], 10, 4, 3);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPreviousPage).toBe(true);
  });

  it('creates correct result for middle page', () => {
    const result = createPaginatedResult(['d', 'e', 'f'], 10, 2, 3);
    expect(result.hasNextPage).toBe(true);
    expect(result.hasPreviousPage).toBe(true);
  });

  it('handles single page', () => {
    const result = createPaginatedResult(['a', 'b'], 2, 1, 10);
    expect(result.totalPages).toBe(1);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPreviousPage).toBe(false);
  });

  it('handles empty data', () => {
    const result = createPaginatedResult([], 0, 1, 10);
    expect(result.totalPages).toBe(0);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPreviousPage).toBe(false);
  });

  it('calculates total pages correctly', () => {
    expect(createPaginatedResult([], 100, 1, 10).totalPages).toBe(10);
    expect(createPaginatedResult([], 101, 1, 10).totalPages).toBe(11);
    expect(createPaginatedResult([], 99, 1, 10).totalPages).toBe(10);
    expect(createPaginatedResult([], 1, 1, 10).totalPages).toBe(1);
  });
});

// ===== DEFAULT CONSTANTS =====
describe('Default constants', () => {
  it('DEFAULT_PAGE_SIZE is reasonable', () => {
    expect(DEFAULT_PAGE_SIZE).toBe(50);
    expect(DEFAULT_PAGE_SIZE).toBeGreaterThan(0);
    expect(DEFAULT_PAGE_SIZE).toBeLessThanOrEqual(MAX_PAGE_SIZE);
  });

  it('MAX_PAGE_SIZE prevents overload', () => {
    expect(MAX_PAGE_SIZE).toBe(200);
    expect(MAX_PAGE_SIZE).toBeLessThanOrEqual(1000); // Supabase limit
  });

  it('retry config is sensible', () => {
    expect(RETRY_CONFIG.maxRetries).toBe(3);
    expect(RETRY_CONFIG.baseDelay).toBe(1000);
    expect(RETRY_CONFIG.maxDelay).toBe(30000);
  });
});
