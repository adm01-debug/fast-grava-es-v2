import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMap } from './useMap';

describe('useMap', () => {
  it('should be defined', () => {
    expect(useMap).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useMap());
    expect(result.current).toBeDefined();
  });
});
