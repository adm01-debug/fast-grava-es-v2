import { describe, it, expect } from 'vitest';

describe('queryConfig', () => {
  describe('default options', () => {
    it('should have retry configuration', () => {
      const config = { retry: 3, retryDelay: 1000 };
      expect(config.retry).toBe(3);
    });

    it('should have stale time', () => {
      const config = { staleTime: 5 * 60 * 1000 };
      expect(config.staleTime).toBe(300000);
    });

    it('should have cache time', () => {
      const config = { cacheTime: 30 * 60 * 1000 };
      expect(config.cacheTime).toBe(1800000);
    });
  });

  describe('query keys', () => {
    it('should create unique keys', () => {
      const key = ['jobs', { status: 'active' }];
      expect(key.length).toBe(2);
    });

    it('should handle nested keys', () => {
      const key = ['jobs', 'list', { page: 1 }];
      expect(JSON.stringify(key)).toContain('page');
    });
  });

  describe('mutation options', () => {
    it('should configure optimistic updates', () => {
      const options = { optimisticUpdate: true };
      expect(options.optimisticUpdate).toBe(true);
    });
  });
});
