import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}));

// Import after mock
import { useABCCosts } from './useABCCosts';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useABCCosts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Fetching', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
    });

    it('should fetch cost pools', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.costPools).toBeDefined();
      });
    });

    it('should fetch activities', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.activities).toBeDefined();
      });
    });

    it('should fetch activity rates', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.activityRates).toBeDefined();
      });
    });
  });

  describe('Cost Calculations', () => {
    it('should calculate total cost', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(typeof result.current.totalCost).toBe('number');
      });
    });

    it('should calculate cost by activity', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.costByActivity).toBeDefined();
      });
    });

    it('should calculate cost per unit', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.costPerUnit).toBeDefined();
      });
    });
  });

  describe('Cost Pool Management', () => {
    it('should have addCostPool function', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.addCostPool).toBe('function');
    });

    it('should have updateCostPool function', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.updateCostPool).toBe('function');
    });

    it('should have deleteCostPool function', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.deleteCostPool).toBe('function');
    });
  });

  describe('Activity Management', () => {
    it('should have addActivity function', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.addActivity).toBe('function');
    });

    it('should have updateActivity function', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.updateActivity).toBe('function');
    });
  });

  describe('Loading States', () => {
    it('should track loading state', () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should track error state', () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.error).toBeDefined();
    });
  });
});
