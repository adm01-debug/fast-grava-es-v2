import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInfiniteScroll } from './useInfiniteScroll';

describe('useInfiniteScroll', () => {
  it('should be defined', () => {
    expect(useInfiniteScroll).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useInfiniteScroll());
    expect(result.current).toBeDefined();
  });
});
