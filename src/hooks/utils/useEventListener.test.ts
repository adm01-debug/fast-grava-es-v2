import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEventListener } from './useEventListener';

describe('useEventListener', () => {
  it('should be defined', () => {
    expect(useEventListener).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useEventListener());
    expect(result.current).toBeDefined();
  });
});
