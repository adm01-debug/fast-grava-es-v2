import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFullscreen } from './useFullscreen';

describe('useFullscreen', () => {
  it('should be defined', () => {
    expect(useFullscreen).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useFullscreen());
    expect(result.current).toBeDefined();
  });
});
