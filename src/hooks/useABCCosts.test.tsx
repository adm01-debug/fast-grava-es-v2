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
    it('should have totalBudget calculation', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(typeof result.current.totalBudget).toBe('number');
      });
    });

    it('should have totalAllocatedCost calculation', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(typeof result.current.totalAllocatedCost).toBe('number');
      });
    });

    it('should have averageUnitCost calculation', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(typeof result.current.averageUnitCost).toBe('number');
      });
    });
  });

  describe('Mutation Functions', () => {
    it('should have updateCostPoolBudget mutation', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.updateCostPoolBudget).toBeDefined();
    });

    it('should have updateActivityRate mutation', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.updateActivityRate).toBeDefined();
    });

    it('should have calculateJobCost mutation', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.calculateJobCost).toBeDefined();
    });

    it('should have calculateAllJobsCosts mutation', async () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      expect(result.current.calculateAllJobsCosts).toBeDefined();
    });
  });

  describe('Loading States', () => {
    it('should track loading state', () => {
      const { result } = renderHook(() => useABCCosts(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });
});
