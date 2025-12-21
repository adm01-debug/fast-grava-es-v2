import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
        gte: vi.fn(() => ({ lte: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}));

import { useEnergy } from './useEnergy';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useEnergy', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Consumption Data', () => {
    it('should fetch energy consumption', async () => {
      const { result } = renderHook(() => useEnergy(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.consumption).toBeDefined());
    });

    it('should calculate total consumption', async () => {
      const { result } = renderHook(() => useEnergy(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.totalConsumption).toBeDefined());
    });

    it('should calculate cost', async () => {
      const { result } = renderHook(() => useEnergy(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.totalCost).toBeDefined());
    });
  });

  describe('Targets', () => {
    it('should fetch energy targets', async () => {
      const { result } = renderHook(() => useEnergy(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.targets).toBeDefined());
    });

    it('should have setTarget function', () => {
      const { result } = renderHook(() => useEnergy(), { wrapper: createWrapper() });
      expect(typeof result.current.setTarget).toBe('function');
    });
  });

  describe('Alerts', () => {
    it('should fetch energy alerts', async () => {
      const { result } = renderHook(() => useEnergy(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.alerts).toBeDefined());
    });
  });

  describe('Analytics', () => {
    it('should provide consumption by machine', async () => {
      const { result } = renderHook(() => useEnergy(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.consumptionByMachine).toBeDefined());
    });

    it('should provide consumption trends', async () => {
      const { result } = renderHook(() => useEnergy(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.trends).toBeDefined());
    });
  });
});
