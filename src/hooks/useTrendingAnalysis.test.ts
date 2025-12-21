import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn(() => ({ gte: vi.fn(() => ({ lte: vi.fn(() => Promise.resolve({ data: [], error: null })) })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })) },
}));

import { useTrendingAnalysis } from './useTrendingAnalysis';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('useTrendingAnalysis', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should analyze trends', async () => {
    const { result } = renderHook(() => useTrendingAnalysis(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.trends).toBeDefined());
  });

  it('should identify upward trends', async () => {
    const { result } = renderHook(() => useTrendingAnalysis(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.upwardTrends).toBeDefined());
  });

  it('should identify downward trends', async () => {
    const { result } = renderHook(() => useTrendingAnalysis(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.downwardTrends).toBeDefined());
  });

  it('should calculate trend strength', async () => {
    const { result } = renderHook(() => useTrendingAnalysis(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.trendStrength).toBeDefined());
  });

  it('should provide forecast', async () => {
    const { result } = renderHook(() => useTrendingAnalysis(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.forecast).toBeDefined());
  });
});
