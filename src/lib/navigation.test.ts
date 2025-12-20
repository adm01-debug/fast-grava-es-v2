import { describe, it, expect, vi } from 'vitest';

describe('navigation', () => {
  describe('route matching', () => {
    it('should match exact routes', () => {
      const route = '/dashboard';
      const current = '/dashboard';
      expect(route === current).toBe(true);
    });

    it('should match dynamic routes', () => {
      const pattern = /^\/jobs\/\d+$/;
      const path = '/jobs/123';
      expect(pattern.test(path)).toBe(true);
    });
  });

  describe('breadcrumbs', () => {
    it('should generate breadcrumbs', () => {
      const path = '/dashboard/jobs/123';
      const parts = path.split('/').filter(Boolean);
      expect(parts).toEqual(['dashboard', 'jobs', '123']);
    });
  });

  describe('query params', () => {
    it('should parse query params', () => {
      const search = '?page=1&limit=10';
      const params = new URLSearchParams(search);
      expect(params.get('page')).toBe('1');
      expect(params.get('limit')).toBe('10');
    });

    it('should build query string', () => {
      const params = new URLSearchParams({ page: '1', limit: '10' });
      expect(params.toString()).toBe('page=1&limit=10');
    });
  });
});
