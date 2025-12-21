import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScrollPosition } from './useScrollPosition';

describe('useScrollPosition', () => {
  it('should be defined', () => {
    expect(useScrollPosition).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useScrollPosition());
    expect(result.current).toBeDefined();
  });
});
