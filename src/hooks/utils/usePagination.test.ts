import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePagination } from './usePagination';

describe('usePagination', () => {
  it('should be defined', () => {
    expect(usePagination).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => usePagination());
    expect(result.current).toBeDefined();
  });
});
