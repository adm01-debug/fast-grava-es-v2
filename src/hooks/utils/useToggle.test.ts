import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useToggle } from './useToggle';

describe('useToggle', () => {
  it('should be defined', () => {
    expect(useToggle).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current).toBeDefined();
  });
});
