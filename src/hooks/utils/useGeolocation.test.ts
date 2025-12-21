import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from './useGeolocation';

describe('useGeolocation', () => {
  it('should be defined', () => {
    expect(useGeolocation).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useGeolocation());
    expect(result.current).toBeDefined();
  });
});
