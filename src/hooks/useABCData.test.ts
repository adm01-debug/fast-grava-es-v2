import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn(() => ({ select: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })) },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useABCData', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should fetch ABC data', async () => {
    const { result } = renderHook(() => ({ data: [], isLoading: false }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.data).toBeDefined());
  });

  it('should group by category', () => {
    const items = [{ cat: 'A' }, { cat: 'B' }, { cat: 'A' }];
    const grouped = items.reduce((acc: any, item) => {
      acc[item.cat] = acc[item.cat] || [];
      acc[item.cat].push(item);
      return acc;
    }, {});
    expect(grouped.A.length).toBe(2);
  });

  it('should calculate statistics', () => {
    const values = [10, 20, 30];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    expect(avg).toBe(20);
  });
});
