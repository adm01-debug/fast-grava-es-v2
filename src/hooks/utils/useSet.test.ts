import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSet } from './useSet';

describe('useSet', () => {
  it('should be defined', () => {
    expect(useSet).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useSet());
    expect(result.current).toBeDefined();
  });
});
