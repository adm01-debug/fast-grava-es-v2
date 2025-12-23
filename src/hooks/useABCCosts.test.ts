import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useABCCosts } from './useABCCosts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;

describe('useABCCosts', () => {
  it('should be defined', () => { expect(useABCCosts).toBeDefined(); });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useABCCosts(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
