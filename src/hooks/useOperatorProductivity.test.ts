import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ gte: vi.fn(() => ({ lte: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })) },
}));

import { useOperatorProductivity } from './useOperatorProductivity';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('useOperatorProductivity', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should calculate productivity', async () => {
    const { result } = renderHook(() => useOperatorProductivity('op-1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.productivity).toBeDefined());
  });

  it('should track jobs completed', async () => {
    const { result } = renderHook(() => useOperatorProductivity('op-1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.jobsCompleted).toBeDefined());
  });

  it('should calculate efficiency', async () => {
    const { result } = renderHook(() => useOperatorProductivity('op-1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.efficiency).toBeDefined());
  });

  it('should provide trends', async () => {
    const { result } = renderHook(() => useOperatorProductivity('op-1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.trends).toBeDefined());
  });

  it('should compare to average', async () => {
    const { result } = renderHook(() => useOperatorProductivity('op-1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.comparedToAverage).toBeDefined());
  });
});
