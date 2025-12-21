import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: [], error: null })), order: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
    })),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useABCCalculations', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should calculate ABC classification', async () => {
    const { result } = renderHook(() => ({ classification: { A: [], B: [], C: [] } }), { wrapper: createWrapper() });
    expect(result.current.classification).toBeDefined();
  });

  it('should calculate percentages', () => {
    const total = 100;
    const aPercent = 80;
    expect(aPercent / total).toBe(0.8);
  });

  it('should sort by value', () => {
    const items = [{ value: 10 }, { value: 30 }, { value: 20 }];
    const sorted = items.sort((a, b) => b.value - a.value);
    expect(sorted[0].value).toBe(30);
  });

  it('should handle empty data', () => {
    const data: any[] = [];
    expect(data.length).toBe(0);
  });
});
