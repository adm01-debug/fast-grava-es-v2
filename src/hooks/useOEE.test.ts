import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: [], error: null })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })) },
}));

import { useOEE } from './useOEE';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('useOEE', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should calculate overall OEE', async () => {
    const { result } = renderHook(() => useOEE(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.overallOEE).toBeDefined());
  });

  it('should calculate availability', async () => {
    const { result } = renderHook(() => useOEE(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.availability).toBeDefined());
  });

  it('should calculate performance', async () => {
    const { result } = renderHook(() => useOEE(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.performance).toBeDefined());
  });

  it('should calculate quality', async () => {
    const { result } = renderHook(() => useOEE(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.quality).toBeDefined());
  });

  it('should provide OEE by machine', async () => {
    const { result } = renderHook(() => useOEE(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.oeeByMachine).toBeDefined());
  });

  it('should provide OEE trends', async () => {
    const { result } = renderHook(() => useOEE(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.trends).toBeDefined());
  });

  it('should identify losses', async () => {
    const { result } = renderHook(() => useOEE(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.losses).toBeDefined());
  });
});
