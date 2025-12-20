import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        in: vi.fn(() => Promise.resolve({ data: [], error: null })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}));

import { useAutoBufferPromotion } from './useAutoBufferPromotion';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAutoBufferPromotion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Buffer Detection', () => {
    it('should detect buffer jobs', async () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.bufferJobs).toBeDefined();
      });
    });

    it('should identify promotable jobs', async () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.promotableJobs).toBeDefined();
      });
    });

    it('should track buffer utilization', async () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.bufferUtilization).toBeDefined();
      });
    });
  });

  describe('Promotion Rules', () => {
    it('should have promotion threshold', async () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.promotionThreshold).toBeDefined();
      });
    });

    it('should calculate time in buffer', async () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(typeof result.current.getTimeInBuffer).toBe('function');
      });
    });

    it('should check promotion eligibility', async () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(typeof result.current.isEligibleForPromotion).toBe('function');
      });
    });
  });

  describe('Promotion Actions', () => {
    it('should have promoteJob function', () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.promoteJob).toBe('function');
    });

    it('should have promoteAll function', () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.promoteAll).toBe('function');
    });

    it('should have demoteJob function', () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.demoteJob).toBe('function');
    });
  });

  describe('Auto Promotion', () => {
    it('should have auto promotion toggle', async () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(typeof result.current.autoPromotionEnabled).toBe('boolean');
      });
    });

    it('should have toggleAutoPromotion function', () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.toggleAutoPromotion).toBe('function');
    });

    it('should have setPromotionInterval function', () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.setPromotionInterval).toBe('function');
    });
  });

  describe('Statistics', () => {
    it('should track promotions count', async () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.promotionsToday).toBeDefined();
      });
    });

    it('should track average time in buffer', async () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.averageTimeInBuffer).toBeDefined();
      });
    });
  });

  describe('Loading States', () => {
    it('should track loading state', () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should track promoting state', () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.isPromoting).toBe('boolean');
    });
  });
});
