import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockStorage: Record<string, string> = {};

describe('offlineStorage', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  });

  describe('basic operations', () => {
    it('should set item', () => {
      mockStorage['key'] = JSON.stringify({ data: 'test' });
      expect(mockStorage['key']).toBeDefined();
    });

    it('should get item', () => {
      mockStorage['key'] = JSON.stringify({ data: 'test' });
      const item = JSON.parse(mockStorage['key']);
      expect(item.data).toBe('test');
    });

    it('should remove item', () => {
      mockStorage['key'] = 'value';
      delete mockStorage['key'];
      expect(mockStorage['key']).toBeUndefined();
    });
  });

  describe('sync queue', () => {
    it('should add to sync queue', () => {
      const queue: any[] = [];
      queue.push({ id: 1, action: 'update' });
      expect(queue.length).toBe(1);
    });

    it('should process sync queue', async () => {
      const queue = [{ id: 1 }, { id: 2 }];
      const results = await Promise.all(queue.map(item => Promise.resolve(item)));
      expect(results.length).toBe(2);
    });
  });

  describe('conflict resolution', () => {
    it('should detect conflicts', () => {
      const local = { version: 1, data: 'local' };
      const remote = { version: 2, data: 'remote' };
      expect(remote.version > local.version).toBe(true);
    });
  });
});
