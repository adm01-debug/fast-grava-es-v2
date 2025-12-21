import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePrevious } from './usePrevious';

describe('usePrevious', () => {
  it('should be defined', () => {
    expect(usePrevious).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => usePrevious());
    expect(result.current).toBeDefined();
  });
});
