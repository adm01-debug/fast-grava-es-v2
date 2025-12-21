import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm } from './useForm';

describe('useForm', () => {
  it('should be defined', () => {
    expect(useForm).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useForm());
    expect(result.current).toBeDefined();
  });
});
