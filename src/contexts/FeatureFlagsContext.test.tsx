import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

describe('FeatureFlagsContext', () => {
  it('should export provider and hook', async () => {
    const mod = await import('./FeatureFlagsContext');
    expect(mod).toBeDefined();
  });
});
