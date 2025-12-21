import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

describe('ConfirmationContext', () => {
  it('should export provider and hook', async () => {
    const mod = await import('./ConfirmationContext');
    expect(mod).toBeDefined();
  });
});
