import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useABCData } from './useABCData';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;

describe('useABCData', () => {
  it('should be defined', () => { expect(useABCData).toBeDefined(); });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useABCData(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
