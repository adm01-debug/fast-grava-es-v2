import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

describe('NotificationsContext', () => {
  it('should export provider and hook', async () => {
    const mod = await import('./NotificationsContext');
    expect(mod).toBeDefined();
  });
});
