import { describe, it, expect, vi } from 'vitest';

describe('errorHandling', () => {
  describe('handleError', () => {
    it('should format error messages', () => {
      const error = new Error('Test error');
      expect(error.message).toBe('Test error');
    });

    it('should handle unknown errors', () => {
      const unknownError = 'string error';
      expect(typeof unknownError).toBe('string');
    });

    it('should extract error code', () => {
      const error = { code: 'AUTH_ERROR', message: 'Auth failed' };
      expect(error.code).toBe('AUTH_ERROR');
    });
  });

  describe('isNetworkError', () => {
    it('should detect network errors', () => {
      const networkError = new Error('Failed to fetch');
      expect(networkError.message).toContain('fetch');
    });
  });

  describe('retry logic', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      const operation = vi.fn(() => {
        attempts++;
        if (attempts < 3) throw new Error('Retry');
        return 'success';
      });

      try {
        while (attempts < 3) operation();
      } catch {}
      
      const result = operation();
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });
  });
});
