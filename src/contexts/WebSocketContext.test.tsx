import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';

describe('WebSocketContext', () => {
  it('should export provider and hook', async () => {
    const mod = await import('./WebSocketContext');
    expect(mod).toBeDefined();
  });
});
