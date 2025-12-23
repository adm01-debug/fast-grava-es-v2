import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

import { useBottleneckPrediction } from './useBottleneckPrediction';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useBottleneckPrediction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Bottleneck Detection', () => {
    it('should return alerts array', async () => {
      const { result } = renderHook(() => useBottleneckPrediction(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.alerts).toBeDefined();
        expect(Array.isArray(result.current.alerts)).toBe(true);
      });
    });

    it('should return capacityByDate array', async () => {
      const { result } = renderHook(() => useBottleneckPrediction(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.capacityByDate).toBeDefined();
        expect(Array.isArray(result.current.capacityByDate)).toBe(true);
      });
    });
  });

  describe('Severity Counts', () => {
    it('should have criticalCount when loaded', async () => {
      const { result } = renderHook(() => useBottleneckPrediction(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        if (!result.current.isLoading) {
          expect(typeof result.current.criticalCount).toBe('number');
        }
      });
    });

    it('should have warningCount when loaded', async () => {
      const { result } = renderHook(() => useBottleneckPrediction(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        if (!result.current.isLoading) {
          expect(typeof result.current.warningCount).toBe('number');
        }
      });
    });

    it('should have infoCount when loaded', async () => {
      const { result } = renderHook(() => useBottleneckPrediction(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        if (!result.current.isLoading) {
          expect(typeof result.current.infoCount).toBe('number');
        }
      });
    });
  });

  describe('Loading States', () => {
    it('should track loading state', () => {
      const { result } = renderHook(() => useBottleneckPrediction(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });
});
