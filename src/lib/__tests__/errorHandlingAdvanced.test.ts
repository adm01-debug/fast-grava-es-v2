import { describe, it, expect, vi } from 'vitest';
import {
  categorizeError,
  createAppError,
  ErrorCodes,
  withErrorHandling,
} from '../../lib/errorHandling';

// ===== EDGE CASES FOR ERROR HANDLING =====
describe('Error Handling Edge Cases', () => {
  it('handles Error objects with various message formats', () => {
    expect(categorizeError(new Error('HTTP 401'))).toBe(ErrorCodes.UNAUTHORIZED);
    expect(categorizeError(new Error('Error: 403 access denied'))).toBe(ErrorCodes.FORBIDDEN);
    expect(categorizeError(new Error('NetworkError when attempting to fetch'))).toBe(ErrorCodes.NETWORK_ERROR);
  });

  it('handles non-Error objects', () => {
    expect(categorizeError({ message: 'network error' })).toBe(ErrorCodes.UNKNOWN_ERROR);
    expect(categorizeError(42)).toBe(ErrorCodes.UNKNOWN_ERROR);
    expect(categorizeError(true)).toBe(ErrorCodes.UNKNOWN_ERROR);
  });

  it('handles empty string', () => {
    expect(categorizeError('')).toBe(ErrorCodes.UNKNOWN_ERROR);
  });

  it('handles undefined', () => {
    expect(categorizeError(undefined)).toBe(ErrorCodes.UNKNOWN_ERROR);
  });

  it('case insensitive matching', () => {
    expect(categorizeError('NETWORK ERROR')).toBe(ErrorCodes.NETWORK_ERROR);
    expect(categorizeError('TIMEOUT occurred')).toBe(ErrorCodes.TIMEOUT);
    expect(categorizeError('Too Many Requests')).toBe(ErrorCodes.RATE_LIMITED);
  });
});

describe('withErrorHandling', () => {
  it('returns value on success', async () => {
    const result = await withErrorHandling(async () => 42, { showToast: false });
    expect(result).toBe(42);
  });

  it('returns null on error', async () => {
    const result = await withErrorHandling(
      async () => { throw new Error('fail'); },
      { showToast: false }
    );
    expect(result).toBeNull();
  });

  it('calls onError callback', async () => {
    const onError = vi.fn();
    await withErrorHandling(
      async () => { throw new Error('network error'); },
      { showToast: false, onError }
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].code).toBe(ErrorCodes.NETWORK_ERROR);
  });

  it('preserves context in error', async () => {
    const onError = vi.fn();
    const ctx = { page: 'dashboard', action: 'load' };
    await withErrorHandling(
      async () => { throw new Error('500 error'); },
      { showToast: false, onError, context: ctx }
    );
    expect(onError.mock.calls[0][0].context).toEqual(ctx);
  });
});

// ===== APP ERROR RETRYABILITY =====
describe('AppError retryability mapping', () => {
  const retryableCodes = [
    ErrorCodes.NETWORK_ERROR,
    ErrorCodes.TIMEOUT,
    ErrorCodes.RATE_LIMITED,
    ErrorCodes.SERVER_ERROR,
    ErrorCodes.SERVICE_UNAVAILABLE,
  ];

  const nonRetryableCodes = [
    ErrorCodes.UNAUTHORIZED,
    ErrorCodes.FORBIDDEN,
    ErrorCodes.SESSION_EXPIRED,
    ErrorCodes.NOT_FOUND,
    ErrorCodes.VALIDATION_ERROR,
    ErrorCodes.CONFLICT,
    ErrorCodes.UNKNOWN_ERROR,
  ];

  retryableCodes.forEach(code => {
    it(`marks ${code} as retryable`, () => {
      const errorMessages: Record<string, string> = {
        NETWORK_ERROR: 'network error',
        TIMEOUT: 'timeout',
        RATE_LIMITED: 'rate limit',
        SERVER_ERROR: '500 internal server',
        SERVICE_UNAVAILABLE: '503 unavailable',
      };
      const err = createAppError(new Error(errorMessages[code] || code));
      expect(err.retryable).toBe(true);
    });
  });

  nonRetryableCodes.forEach(code => {
    it(`marks ${code} as non-retryable`, () => {
      const errorMessages: Record<string, string> = {
        UNAUTHORIZED: '401 unauthorized',
        FORBIDDEN: '403 forbidden',
        SESSION_EXPIRED: 'jwt token expired',
        NOT_FOUND: '404 not found',
        VALIDATION_ERROR: '422 validation',
        CONFLICT: '409 conflict',
        UNKNOWN_ERROR: 'something weird',
      };
      const err = createAppError(new Error(errorMessages[code] || code));
      expect(err.retryable).toBe(false);
    });
  });
});

// ===== SEVERITY MAPPING =====
describe('Error severity mapping', () => {
  it('auth errors are warnings', () => {
    expect(createAppError(new Error('401')).severity).toBe('warning');
    expect(createAppError(new Error('jwt expired')).severity).toBe('warning');
  });

  it('server errors are critical', () => {
    expect(createAppError(new Error('500')).severity).toBe('critical');
    expect(createAppError(new Error('503 unavailable')).severity).toBe('critical');
  });

  it('rate limiting is info', () => {
    expect(createAppError(new Error('rate limit')).severity).toBe('info');
  });

  it('other errors are error severity', () => {
    expect(createAppError(new Error('404 not found')).severity).toBe('error');
    expect(createAppError(new Error('409 conflict')).severity).toBe('error');
  });
});
