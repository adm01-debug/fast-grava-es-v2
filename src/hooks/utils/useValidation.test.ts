import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useValidation } from './useValidation';

describe('useValidation', () => {
  it('should be defined', () => {
    expect(useValidation).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useValidation());
    expect(result.current).toBeDefined();
  });
});
