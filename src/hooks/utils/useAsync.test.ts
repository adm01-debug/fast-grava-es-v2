import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsync } from './useAsync';

describe('useAsync', () => {
  it('should be defined', () => {
    expect(useAsync).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useAsync());
    expect(result.current).toBeDefined();
  });
});
