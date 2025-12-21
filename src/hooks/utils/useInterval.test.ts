import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInterval } from './useInterval';

describe('useInterval', () => {
  it('should be defined', () => {
    expect(useInterval).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useInterval());
    expect(result.current).toBeDefined();
  });
});
