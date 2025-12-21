import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUndo } from './useUndo';

describe('useUndo', () => {
  it('should be defined', () => {
    expect(useUndo).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useUndo());
    expect(result.current).toBeDefined();
  });
});
