import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        gte: vi.fn(() => ({ lte: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

import { useKPIs } from './useKPIs';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useKPIs', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('KPI Data', () => {
    it('should fetch KPIs', async () => {
      const { result } = renderHook(() => useKPIs(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.kpis).toBeDefined());
    });

    it('should calculate OEE', async () => {
      const { result } = renderHook(() => useKPIs(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.oee).toBeDefined());
    });

    it('should calculate availability', async () => {
      const { result } = renderHook(() => useKPIs(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.availability).toBeDefined());
    });

    it('should calculate performance', async () => {
      const { result } = renderHook(() => useKPIs(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.performance).toBeDefined());
    });

    it('should calculate quality', async () => {
      const { result } = renderHook(() => useKPIs(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.quality).toBeDefined());
    });
  });

  describe('Trends', () => {
    it('should provide KPI trends', async () => {
      const { result } = renderHook(() => useKPIs(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.trends).toBeDefined());
    });

    it('should compare to targets', async () => {
      const { result } = renderHook(() => useKPIs(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.targetComparison).toBeDefined());
    });
  });

  describe('By Machine', () => {
    it('should provide KPIs by machine', async () => {
      const { result } = renderHook(() => useKPIs(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.kpisByMachine).toBeDefined());
    });
  });
});
