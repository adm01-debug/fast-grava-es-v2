import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: [], error: null })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })), insert: vi.fn(() => Promise.resolve({ data: null, error: null })), update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })) })) },
}));

import { usePushSubscription } from './usePushSubscription';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('usePushSubscription', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should initialize correctly', async () => {
    const { result } = renderHook(() => usePushSubscription(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
  });

  it('should track loading state', () => {
    const { result } = renderHook(() => usePushSubscription(), { wrapper: createWrapper() });
    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('should have refetch function', () => {
    const { result } = renderHook(() => usePushSubscription(), { wrapper: createWrapper() });
    expect(typeof result.current.refetch).toBe('function');
  });
});
