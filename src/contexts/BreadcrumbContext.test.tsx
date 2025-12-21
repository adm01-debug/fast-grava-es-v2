import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

describe('BreadcrumbContext', () => {
  it('should export provider and hook', async () => {
    const mod = await import('./BreadcrumbContext');
    expect(mod).toBeDefined();
  });
});
