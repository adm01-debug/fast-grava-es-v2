import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: [], error: null })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })) },
}));

import { useMTBFMTTR } from './useMTBFMTTR';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('useMTBFMTTR', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should calculate MTBF', async () => {
    const { result } = renderHook(() => useMTBFMTTR(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.mtbf).toBeDefined());
  });

  it('should calculate MTTR', async () => {
    const { result } = renderHook(() => useMTBFMTTR(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.mttr).toBeDefined());
  });

  it('should calculate availability', async () => {
    const { result } = renderHook(() => useMTBFMTTR(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.availability).toBeDefined());
  });

  it('should provide by machine', async () => {
    const { result } = renderHook(() => useMTBFMTTR(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.byMachine).toBeDefined());
  });

  it('should provide trends', async () => {
    const { result } = renderHook(() => useMTBFMTTR(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.trends).toBeDefined());
  });
});
