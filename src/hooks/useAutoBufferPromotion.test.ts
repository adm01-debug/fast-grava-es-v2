import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAutoBufferPromotion } from './useAutoBufferPromotion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: any) => <QueryClientProvider client={qc}>{children}</QueryClientProvider>;

describe('useAutoBufferPromotion', () => {
  it('should be defined', () => { expect(useAutoBufferPromotion).toBeDefined(); });
  it('should return expected interface', () => {
    const { result } = renderHook(() => useAutoBufferPromotion(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
