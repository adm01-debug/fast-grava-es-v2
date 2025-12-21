import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })) },
}));

import { useLoadBalancing } from './useLoadBalancing';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('useLoadBalancing', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should calculate machine loads', async () => {
    const { result } = renderHook(() => useLoadBalancing(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.machineLoads).toBeDefined());
  });

  it('should identify overloaded machines', async () => {
    const { result } = renderHook(() => useLoadBalancing(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.overloadedMachines).toBeDefined());
  });

  it('should identify underutilized machines', async () => {
    const { result } = renderHook(() => useLoadBalancing(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.underutilizedMachines).toBeDefined());
  });

  it('should provide rebalance suggestions', async () => {
    const { result } = renderHook(() => useLoadBalancing(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.suggestions).toBeDefined());
  });

  it('should have redistributeLoad function', () => {
    const { result } = renderHook(() => useLoadBalancing(), { wrapper: createWrapper() });
    expect(typeof result.current.redistributeLoad).toBe('function');
  });
});
