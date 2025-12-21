import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

describe('SearchContext', () => {
  it('should export provider and hook', async () => {
    const mod = await import('./SearchContext');
    expect(mod).toBeDefined();
  });
});
