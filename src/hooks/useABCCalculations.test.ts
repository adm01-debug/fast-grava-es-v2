import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useABCCalculations } from './useABCCalculations';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;

describe('useABCCalculations', () => {
  it('should be defined', () => { expect(useABCCalculations).toBeDefined(); });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useABCCalculations(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
