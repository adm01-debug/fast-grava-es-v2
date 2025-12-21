import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
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

  describe('Connection Status', () => {
    it('should check connection status', async () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isConnected).toBeDefined();
      });
    });

    it('should provide connection details', async () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.connectionDetails).toBeDefined();
      });
    });

    it('should track last sync time', async () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.lastSyncTime).toBeDefined();
      });
    });
  });

  describe('Sync Operations', () => {
    it('should have syncNow function', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.syncNow).toBe('function');
    });

    it('should have syncEntity function', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.syncEntity).toBe('function');
    });

    it('should have syncAll function', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.syncAll).toBe('function');
    });

    it('should track sync progress', async () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.syncProgress).toBeDefined();
      });
    });
  });

  describe('Field Mapping', () => {
    it('should fetch field mappings', async () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.fieldMappings).toBeDefined();
      });
    });

    it('should have updateFieldMapping function', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.updateFieldMapping).toBe('function');
    });

    it('should have addFieldMapping function', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.addFieldMapping).toBe('function');
    });
  });

  describe('Sync History', () => {
    it('should fetch sync history', async () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.syncHistory).toBeDefined();
      });
    });

    it('should provide sync statistics', async () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.syncStats).toBeDefined();
      });
    });
  });

  describe('OAuth', () => {
    it('should have connect function', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.connect).toBe('function');
    });

    it('should have disconnect function', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.disconnect).toBe('function');
    });

    it('should have refreshToken function', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.refreshToken).toBe('function');
    });
  });

  describe('Configuration', () => {
    it('should have syncInterval setting', async () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.syncInterval).toBeDefined();
      });
    });

    it('should have setSyncInterval function', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.setSyncInterval).toBe('function');
    });

    it('should have enableAutoSync toggle', async () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(typeof result.current.autoSyncEnabled).toBe('boolean');
      });
    });
  });

  describe('Error Handling', () => {
    it('should track sync errors', async () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.syncErrors).toBeDefined();
      });
    });

    it('should have clearErrors function', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.clearErrors).toBe('function');
    });

    it('should have retryFailedSync function', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.retryFailedSync).toBe('function');
    });
  });

  describe('Loading States', () => {
    it('should track loading state', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should track syncing state', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.isSyncing).toBe('boolean');
    });
  });
});
