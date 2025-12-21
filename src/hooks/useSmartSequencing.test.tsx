import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: [], error: null })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })), update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: null, error: null })) })) })) },
}));

import { useSmartSequencing } from './useSmartSequencing';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('useSmartSequencing', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should provide optimized sequence', async () => {
    const { result } = renderHook(() => useSmartSequencing(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.optimizedSequence).toBeDefined());
  });

  it('should calculate estimated savings', async () => {
    const { result } = renderHook(() => useSmartSequencing(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.estimatedSavings).toBeDefined());
  });

  it('should have applySequence function', () => {
    const { result } = renderHook(() => useSmartSequencing(), { wrapper: createWrapper() });
    expect(typeof result.current.applySequence).toBe('function');
  });

  it('should have reoptimize function', () => {
    const { result } = renderHook(() => useSmartSequencing(), { wrapper: createWrapper() });
    expect(typeof result.current.reoptimize).toBe('function');
  });
});
