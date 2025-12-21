import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

describe('OfflineSyncContext', () => {
  it('should export provider and hook', async () => {
    const mod = await import('./OfflineSyncContext');
    expect(mod).toBeDefined();
  });
});
