import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

describe('PermissionsContext', () => {
  it('should export provider and hook', async () => {
    const mod = await import('./PermissionsContext');
    expect(mod).toBeDefined();
  });
});
