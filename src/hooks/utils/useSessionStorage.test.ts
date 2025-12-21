import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSessionStorage } from './useSessionStorage';

describe('useSessionStorage', () => {
  it('should be defined', () => {
    expect(useSessionStorage).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useSessionStorage());
    expect(result.current).toBeDefined();
  });
});
