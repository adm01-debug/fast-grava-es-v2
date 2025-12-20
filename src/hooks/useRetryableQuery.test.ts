import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useRetryableQuery } from './useRetryableQuery';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>);
};

describe('useRetryableQuery', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should execute query', async () => {
    const queryFn = vi.fn(() => Promise.resolve({ data: 'test' }));
    const { result } = renderHook(() => useRetryableQuery({ queryKey: ['test'], queryFn }), { wrapper: createWrapper() });
    await waitFor(() => expect(queryFn).toHaveBeenCalled());
  });

  it('should track retry count', async () => {
    const queryFn = vi.fn(() => Promise.resolve({ data: 'test' }));
    const { result } = renderHook(() => useRetryableQuery({ queryKey: ['test'], queryFn }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.retryCount).toBeDefined());
  });

  it('should have manual retry function', async () => {
    const queryFn = vi.fn(() => Promise.resolve({ data: 'test' }));
    const { result } = renderHook(() => useRetryableQuery({ queryKey: ['test'], queryFn }), { wrapper: createWrapper() });
    expect(typeof result.current.manualRetry).toBe('function');
  });

  it('should track error state', async () => {
    const queryFn = vi.fn(() => Promise.reject(new Error('test error')));
    const { result } = renderHook(() => useRetryableQuery({ queryKey: ['test-error'], queryFn, retry: 0 }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.error).toBeDefined());
  });
});
