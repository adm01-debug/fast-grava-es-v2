import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useArray } from './useArray';

describe('useArray', () => {
  it('should be defined', () => {
    expect(useArray).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useArray());
    expect(result.current).toBeDefined();
  });
});
