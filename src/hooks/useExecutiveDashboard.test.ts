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

import { useExecutiveDashboard } from './useExecutiveDashboard';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useExecutiveDashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('KPIs', () => {
    it('should fetch executive KPIs', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.kpis).toBeDefined());
    });

    it('should calculate OEE', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.overallOEE).toBeDefined());
    });

    it('should calculate productivity', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.productivity).toBeDefined());
    });
  });

  describe('Trends', () => {
    it('should provide daily trends', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.dailyTrends).toBeDefined());
    });

    it('should provide weekly trends', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.weeklyTrends).toBeDefined());
    });

    it('should provide monthly trends', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.monthlyTrends).toBeDefined());
    });
  });

  describe('Comparisons', () => {
    it('should compare to previous period', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.comparedToPrevious).toBeDefined());
    });

    it('should compare to target', async () => {
      const { result } = renderHook(() => useExecutiveDashboard(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.comparedToTarget).toBeDefined());
    });
  });

  describe('Loading', () => {
    it('should track loading state', () => {
      const { result } = renderHook(() => useExecutiveDashboard(), { wrapper: createWrapper() });
      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });
});
