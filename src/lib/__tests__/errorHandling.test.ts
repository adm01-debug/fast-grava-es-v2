import { describe, it, expect } from 'vitest';
import {
  categorizeError,
  createAppError,
  isNetworkError,
  isAuthError,
  isErrorCode,
  ErrorCodes,
} from '../errorHandling';

describe('categorizeError', () => {
  it('returns NETWORK_ERROR for fetch failures', () => {
    expect(categorizeError(new Error('Failed to fetch'))).toBe(ErrorCodes.NETWORK_ERROR);
  });

  it('returns TIMEOUT for timeout errors', () => {
    expect(categorizeError(new Error('Request timeout'))).toBe(ErrorCodes.TIMEOUT);
  });

  it('returns RATE_LIMITED for 429 errors', () => {
    expect(categorizeError(new Error('429 Too Many Requests'))).toBe(ErrorCodes.RATE_LIMITED);
  });

  it('returns UNAUTHORIZED for 401', () => {
    expect(categorizeError(new Error('401 Unauthorized'))).toBe(ErrorCodes.UNAUTHORIZED);
  });

  it('returns FORBIDDEN for 403', () => {
    expect(categorizeError(new Error('403 Forbidden'))).toBe(ErrorCodes.FORBIDDEN);
  });

  it('returns SESSION_EXPIRED for JWT errors', () => {
    expect(categorizeError(new Error('JWT token expired'))).toBe(ErrorCodes.SESSION_EXPIRED);
  });

  it('returns NOT_FOUND for 404', () => {
    expect(categorizeError(new Error('404 Not Found'))).toBe(ErrorCodes.NOT_FOUND);
  });

  it('returns VALIDATION_ERROR for 422', () => {
    expect(categorizeError(new Error('422 validation failed'))).toBe(ErrorCodes.VALIDATION_ERROR);
  });

  it('returns CONFLICT for 409', () => {
    expect(categorizeError(new Error('409 Conflict duplicate'))).toBe(ErrorCodes.CONFLICT);
  });

  it('returns SERVER_ERROR for 500', () => {
    expect(categorizeError(new Error('500 Internal Server Error'))).toBe(ErrorCodes.SERVER_ERROR);
  });

  it('returns SERVICE_UNAVAILABLE for 503', () => {
    expect(categorizeError(new Error('503 Service Unavailable'))).toBe(ErrorCodes.SERVICE_UNAVAILABLE);
  });

  it('returns UNKNOWN_ERROR for null', () => {
    expect(categorizeError(null)).toBe(ErrorCodes.UNKNOWN_ERROR);
  });

  it('returns UNKNOWN_ERROR for unrecognized error', () => {
    expect(categorizeError(new Error('something weird'))).toBe(ErrorCodes.UNKNOWN_ERROR);
  });

  it('handles string errors', () => {
    expect(categorizeError('network error occurred')).toBe(ErrorCodes.NETWORK_ERROR);
  });
});

describe('createAppError', () => {
  it('creates AppError with correct severity for auth errors', () => {
    const err = createAppError(new Error('401 Unauthorized'));
    expect(err.severity).toBe('warning');
    expect(err.retryable).toBe(false);
    expect(err.code).toBe(ErrorCodes.UNAUTHORIZED);
  });

  it('creates AppError with critical severity for server errors', () => {
    const err = createAppError(new Error('500 Internal Server'));
    expect(err.severity).toBe('critical');
    expect(err.retryable).toBe(true);
  });

  it('marks network errors as retryable', () => {
    const err = createAppError(new Error('Failed to fetch'));
    expect(err.retryable).toBe(true);
  });

  it('includes context', () => {
    const ctx = { page: 'dashboard' };
    const err = createAppError(new Error('error'), ctx);
    expect(err.context).toEqual(ctx);
  });

  it('includes timestamp', () => {
    const err = createAppError(new Error('error'));
    expect(err.timestamp).toBeInstanceOf(Date);
  });

  it('marks rate limit as info severity', () => {
    const err = createAppError(new Error('rate limit exceeded'));
    expect(err.severity).toBe('info');
  });
});

describe('isNetworkError', () => {
  it('returns true for network errors', () => {
    expect(isNetworkError(new Error('Failed to fetch'))).toBe(true);
  });

  it('returns true for timeout errors', () => {
    expect(isNetworkError(new Error('Request timeout'))).toBe(true);
  });

  it('returns false for auth errors', () => {
    expect(isNetworkError(new Error('401 Unauthorized'))).toBe(false);
  });
});

describe('isAuthError', () => {
  it('returns true for unauthorized', () => {
    expect(isAuthError(new Error('401 Unauthorized'))).toBe(true);
  });

  it('returns true for forbidden', () => {
    expect(isAuthError(new Error('403 Forbidden'))).toBe(true);
  });

  it('returns true for session expired', () => {
    expect(isAuthError(new Error('JWT token expired'))).toBe(true);
  });

  it('returns false for network errors', () => {
    expect(isAuthError(new Error('Failed to fetch'))).toBe(false);
  });
});

describe('isErrorCode', () => {
  it('matches correct error code', () => {
    expect(isErrorCode(new Error('404 Not Found'), ErrorCodes.NOT_FOUND)).toBe(true);
  });

  it('does not match wrong code', () => {
    expect(isErrorCode(new Error('404 Not Found'), ErrorCodes.SERVER_ERROR)).toBe(false);
  });
});
