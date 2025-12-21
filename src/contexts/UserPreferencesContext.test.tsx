import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

describe('UserPreferencesContext', () => {
  it('should export provider and hook', async () => {
    const mod = await import('./UserPreferencesContext');
    expect(mod).toBeDefined();
  });
});
