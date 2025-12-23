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
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        in: vi.fn(() => Promise.resolve({ data: [], error: null })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(() => ({})),
      })),
    })),
    removeChannel: vi.fn(),
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

  describe('Promotion Functions', () => {
    it('should have triggerPromotion function', () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.triggerPromotion).toBe('function');
    });

    it('should have promoteForTechnique function', () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.promoteForTechnique).toBe('function');
    });
  });

  describe('Loading States', () => {
    it('should track promoting state', () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.isPromoting).toBe('boolean');
    });

    it('should have bufferTarget defined', () => {
      const { result } = renderHook(() => useAutoBufferPromotion(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.bufferTarget).toBe('number');
    });
  });
});
