import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClipboard } from './useClipboard';

describe('useClipboard', () => {
  it('should be defined', () => {
    expect(useClipboard).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current).toBeDefined();
  });
});
