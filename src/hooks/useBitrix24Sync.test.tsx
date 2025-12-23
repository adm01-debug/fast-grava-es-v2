import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
  },
}));

import { useBitrix24Sync } from './useBitrix24Sync';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useBitrix24Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading States', () => {
    it('should track loading state', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });

  describe('Last Sync', () => {
    it('should have lastSync property', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      // lastSync can be null or Date
      expect(result.current.lastSync === null || result.current.lastSync instanceof Date).toBe(true);
    });
  });

  describe('OAuth Status', () => {
    it('should have oauthStatus property', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      // oauthStatus can be null initially
      expect(result.current).toHaveProperty('oauthStatus');
    });

    it('should have checkOAuthStatus function', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.checkOAuthStatus).toBe('function');
    });

    it('should have clearTokens function', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.clearTokens).toBe('function');
    });
  });

  describe('Sync Functions', () => {
    it('should have testConnection function', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.testConnection).toBe('function');
    });

    it('should have pullFromBitrix function', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.pullFromBitrix).toBe('function');
    });

    it('should have pushToBitrix function', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.pushToBitrix).toBe('function');
    });
  });
});
