import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  categorizeError,
  createAppError,
  isErrorCode,
  isNetworkError,
  isAuthError,
  ErrorCodes,
  withErrorHandling,
} from '@/lib/errorHandling';

vi.mock('sonner', () => ({ toast: { error: vi.fn(), warning: vi.fn(), info: vi.fn(), success: vi.fn() } }));

describe('categorizeError', () => {
  it.each([
    ['network error', ErrorCodes.NETWORK_ERROR],
    ['failed to fetch', ErrorCodes.NETWORK_ERROR],
    ['timeout exceeded', ErrorCodes.TIMEOUT],
    ['408 request timeout', ErrorCodes.TIMEOUT],
    ['rate limit exceeded', ErrorCodes.RATE_LIMITED],
    ['429 too many requests', ErrorCodes.RATE_LIMITED],
    ['401 unauthorized', ErrorCodes.UNAUTHORIZED],
    ['403 forbidden', ErrorCodes.FORBIDDEN],
    ['access denied', ErrorCodes.FORBIDDEN],
    ['jwt expired', ErrorCodes.SESSION_EXPIRED],
    ['token expired', ErrorCodes.SESSION_EXPIRED],
    ['404 not found', ErrorCodes.NOT_FOUND],
    ['400 bad request validation failed', ErrorCodes.VALIDATION_ERROR],
    ['422 invalid data', ErrorCodes.VALIDATION_ERROR],
    ['409 conflict duplicate', ErrorCodes.CONFLICT],
    ['500 internal server error', ErrorCodes.SERVER_ERROR],
    ['503 service unavailable', ErrorCodes.SERVICE_UNAVAILABLE],
    ['502 bad gateway', ErrorCodes.SERVICE_UNAVAILABLE],
  ])('maps "%s" → %s', (msg, expected) => {
    expect(categorizeError(new Error(msg))).toBe(expected);
  });

  it('returns UNKNOWN_ERROR for null/undefined', () => {
    expect(categorizeError(null)).toBe(ErrorCodes.UNKNOWN_ERROR);
    expect(categorizeError(undefined)).toBe(ErrorCodes.UNKNOWN_ERROR);
  });

  it('handles non-Error objects', () => {
    expect(categorizeError('fetch failed')).toBe(ErrorCodes.NETWORK_ERROR);
    expect(categorizeError(42)).toBe(ErrorCodes.UNKNOWN_ERROR);
  });
});

describe('createAppError', () => {
  it('creates an AppError with correct fields', () => {
    const err = createAppError(new Error('500 internal server error'), { page: 'dashboard' });
    expect(err.code).toBe(ErrorCodes.SERVER_ERROR);
    expect(err.severity).toBe('critical');
    expect(err.retryable).toBe(true);
    expect(err.context).toEqual({ page: 'dashboard' });
    expect(err.timestamp).toBeInstanceOf(Date);
    expect(err.message).toContain('servidor');
  });

  it('marks auth errors as warning severity', () => {
    const err = createAppError(new Error('401 unauthorized'));
    expect(err.severity).toBe('warning');
    expect(err.retryable).toBe(false);
  });

  it('marks rate-limited as info severity', () => {
    const err = createAppError(new Error('rate limit'));
    expect(err.severity).toBe('info');
    expect(err.retryable).toBe(true);
  });

  it('marks validation errors as not retryable', () => {
    const err = createAppError(new Error('validation error'));
    expect(err.retryable).toBe(false);
  });
});

describe('isErrorCode / isNetworkError / isAuthError', () => {
  it('isErrorCode checks correctly', () => {
    expect(isErrorCode(new Error('fetch failed'), ErrorCodes.NETWORK_ERROR)).toBe(true);
    expect(isErrorCode(new Error('fetch failed'), ErrorCodes.TIMEOUT)).toBe(false);
  });

  it('isNetworkError detects network/timeout', () => {
    expect(isNetworkError(new Error('network error'))).toBe(true);
    expect(isNetworkError(new Error('timeout'))).toBe(true);
    expect(isNetworkError(new Error('forbidden'))).toBe(false);
  });

  it('isAuthError detects auth errors', () => {
    expect(isAuthError(new Error('unauthorized'))).toBe(true);
    expect(isAuthError(new Error('forbidden'))).toBe(true);
    expect(isAuthError(new Error('session expired'))).toBe(true);
    expect(isAuthError(new Error('network'))).toBe(false);
  });
});

describe('withErrorHandling', () => {
  it('returns result on success', async () => {
    const result = await withErrorHandling(() => Promise.resolve(42), { showToast: false });
    expect(result).toBe(42);
  });

  it('returns null on failure', async () => {
    const result = await withErrorHandling(() => Promise.reject(new Error('fail')), { showToast: false });
    expect(result).toBeNull();
  });

  it('calls onError callback on failure', async () => {
    const onError = vi.fn();
    await withErrorHandling(() => Promise.reject(new Error('fail')), { showToast: false, onError });
    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0][0].code).toBe(ErrorCodes.UNKNOWN_ERROR);
  });
});
