import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })), single: vi.fn(() => Promise.resolve({ data: null, error: null })) })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })), insert: vi.fn(() => Promise.resolve({ data: null, error: null })) })) },
}));

import { useTraceability } from './useTraceability';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('useTraceability', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should fetch lots', async () => {
    const { result } = renderHook(() => useTraceability(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.lots).toBeDefined());
  });

  it('should track lot by id', async () => {
    const { result } = renderHook(() => useTraceability(), { wrapper: createWrapper() });
    expect(typeof result.current.trackLot).toBe('function');
  });

  it('should get lot history', async () => {
    const { result } = renderHook(() => useTraceability(), { wrapper: createWrapper() });
    expect(typeof result.current.getLotHistory).toBe('function');
  });

  it('should have createLot function', () => {
    const { result } = renderHook(() => useTraceability(), { wrapper: createWrapper() });
    expect(typeof result.current.createLot).toBe('function');
  });

  it('should have addMovement function', () => {
    const { result } = renderHook(() => useTraceability(), { wrapper: createWrapper() });
    expect(typeof result.current.addMovement).toBe('function');
  });
});
