import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTimeout } from './useTimeout';

describe('useTimeout', () => {
  it('should be defined', () => {
    expect(useTimeout).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useTimeout());
    expect(result.current).toBeDefined();
  });
});
