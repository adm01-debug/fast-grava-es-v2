import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWindowSize } from './useWindowSize';

describe('useWindowSize', () => {
  it('should be defined', () => {
    expect(useWindowSize).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useWindowSize());
    expect(result.current).toBeDefined();
  });
});
