import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNetworkStatus } from './useNetworkStatus';

describe('useNetworkStatus', () => {
  it('should be defined', () => {
    expect(useNetworkStatus).toBeDefined();
  });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current).toBeDefined();
  });
});
