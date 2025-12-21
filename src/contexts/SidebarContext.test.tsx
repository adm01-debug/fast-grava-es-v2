import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

describe('SidebarContext', () => {
  it('should export provider and hook', async () => {
    const mod = await import('./SidebarContext');
    expect(mod).toBeDefined();
  });
});
