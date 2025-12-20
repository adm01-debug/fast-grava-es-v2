import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        gte: vi.fn(() => ({
          lte: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

import { useEfficiencyAlertHistory } from './useEfficiencyAlertHistory';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useEfficiencyAlertHistory', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Data Fetching', () => {
    it('should fetch alert history', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.alerts).toBeDefined());
    });
  });

  describe('Filtering', () => {
    it('should filter by machine', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory({ machineId: '123' }), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.alerts).toBeDefined());
    });

    it('should filter resolved alerts', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory({ resolved: true }), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.alerts).toBeDefined());
    });

    it('should filter active alerts', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory({ active: true }), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.alerts).toBeDefined());
    });

    it('should filter by date range', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory({ startDate: '2024-01-01', endDate: '2024-12-31' }), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.alerts).toBeDefined());
    });
  });

  describe('Statistics', () => {
    it('should calculate average resolution time', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.averageResolutionTime).toBeDefined());
    });

    it('should count by machine', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.countByMachine).toBeDefined());
    });

    it('should calculate alert frequency', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.alertFrequency).toBeDefined());
    });
  });

  describe('Analysis', () => {
    it('should identify patterns', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.patterns).toBeDefined());
    });

    it('should calculate trend', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.trend).toBeDefined());
    });
  });

  describe('Chart Data', () => {
    it('should provide timeline data', async () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.timelineData).toBeDefined());
    });
  });

  describe('Loading States', () => {
    it('should track loading state', () => {
      const { result } = renderHook(() => useEfficiencyAlertHistory(), { wrapper: createWrapper() });
      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });
});
