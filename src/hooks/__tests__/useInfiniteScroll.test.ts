import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInfiniteScroll } from './useInfiniteScroll';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
        })),
      })),
    })),
  },
}));

const createWrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
};

describe('useInfiniteScroll', () => {
  it('should return empty data initially', async () => {
    const { result } = renderHook(() => useInfiniteScroll(['test'], { tableName: 'jobs' }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([]);
  });

  it('should have loadMoreRef function', () => {
    const { result } = renderHook(() => useInfiniteScroll(['test'], { tableName: 'jobs' }), { wrapper: createWrapper() });
    expect(result.current.loadMoreRef).toBeInstanceOf(Function);
  });

  it('should have fetchNextPage function', () => {
    const { result } = renderHook(() => useInfiniteScroll(['test'], { tableName: 'jobs' }), { wrapper: createWrapper() });
    expect(result.current.fetchNextPage).toBeInstanceOf(Function);
  });
});
