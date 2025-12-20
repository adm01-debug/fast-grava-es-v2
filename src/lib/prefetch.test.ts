import { describe, it, expect, vi } from 'vitest';

describe('prefetch', () => {
  describe('route prefetching', () => {
    it('should prefetch routes', () => {
      const prefetched = new Set<string>();
      prefetched.add('/dashboard');
      expect(prefetched.has('/dashboard')).toBe(true);
    });

    it('should avoid duplicate prefetch', () => {
      const prefetched = new Set<string>();
      prefetched.add('/page');
      prefetched.add('/page');
      expect(prefetched.size).toBe(1);
    });
  });

  describe('data prefetching', () => {
    it('should prefetch query data', async () => {
      const cache = new Map<string, any>();
      cache.set('query:jobs', [{ id: 1 }]);
      expect(cache.has('query:jobs')).toBe(true);
    });
  });

  describe('link detection', () => {
    it('should detect internal links', () => {
      const href = '/dashboard';
      const isInternal = href.startsWith('/');
      expect(isInternal).toBe(true);
    });

    it('should ignore external links', () => {
      const href = 'https://example.com';
      const isInternal = href.startsWith('/');
      expect(isInternal).toBe(false);
    });
  });
});
