import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useQueue } from './useQueue';

describe('useQueue', () => {
  it('should be defined', () => {
    expect(useQueue).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useQueue());
    expect(result.current).toBeDefined();
  });
});
