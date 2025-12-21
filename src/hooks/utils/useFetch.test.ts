import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFetch } from './useFetch';

describe('useFetch', () => {
  it('should be defined', () => {
    expect(useFetch).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useFetch());
    expect(result.current).toBeDefined();
  });
});
