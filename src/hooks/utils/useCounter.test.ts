import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should be defined', () => {
    expect(useCounter).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current).toBeDefined();
  });
});
