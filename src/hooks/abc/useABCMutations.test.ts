import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock supabase client
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockUpsert = vi.fn();
const mockEq = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => ({
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      upsert: mockUpsert,
    })),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock error handling
vi.mock('@/lib/errorHandling', () => ({
  categorizeError: vi.fn(() => 'database_error'),
  showErrorToast: vi.fn(),
}));

import { useABCMutations } from './useABCMutations';
import { ABCActivity, ABCActivityRate } from './types';
import { toast } from 'sonner';

describe('useABCMutations', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  const mockActivities: ABCActivity[] = [
    {
      id: 'a1',
      name: 'Machine Setup',
      description: null,
      cost_driver: 'setup_count',
      technique_id: 't1',
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 'a2',
      name: 'Production',
      description: null,
      cost_driver: 'quantity',
      technique_id: 't1',
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ];

  const today = new Date().toISOString().split('T')[0];
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const mockActivityRates: ABCActivityRate[] = [
    {
      id: 'ar1',
      activity_id: 'a1',
      cost_pool_id: 'cp1',
      rate_per_unit: 50,
      period_start: '2024-01-01',
      period_end: futureDate,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 'ar2',
      activity_id: 'a2',
      cost_pool_id: 'cp1',
      rate_per_unit: 0.5,
      period_start: '2024-01-01',
      period_end: futureDate,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ];

  const mockJobs = [
    {
      id: 'j1',
      order_number: 'ORD-001',
      technique_id: 't1',
      quantity: 100,
      produced_quantity: 95,
      estimated_duration: 120,
      actual_start_time: null,
      actual_end_time: null,
    },
    {
      id: 'j2',
      order_number: 'ORD-002',
      technique_id: 't1',
      quantity: 200,
      produced_quantity: 190,
      estimated_duration: 180,
      actual_start_time: '2024-01-15T08:00:00Z',
      actual_end_time: '2024-01-15T11:00:00Z',
    },
  ];

  const mockTechniques = [
    { id: 't1', name: 'Silk Screen' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Setup default mock implementations
    mockDelete.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    mockInsert.mockResolvedValue({ error: null });
    mockUpsert.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
  });

  describe('calculateJobCost', () => {
    it('should throw error for non-existent job', async () => {
      const { result } = renderHook(
        () => useABCMutations({
          activities: mockActivities,
          activityRates: mockActivityRates,
          jobs: mockJobs,
          techniques: mockTechniques,
        }),
        { wrapper: createWrapper() }
      );

      await expect(
        act(async () => {
          await result.current.calculateJobCost.mutateAsync('non-existent');
        })
      ).rejects.toThrow('Job não encontrado');
    });

    it('should delete existing costs before calculating new ones', async () => {
      const { result } = renderHook(
        () => useABCMutations({
          activities: mockActivities,
          activityRates: mockActivityRates,
          jobs: mockJobs,
          techniques: mockTechniques,
        }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.calculateJobCost.mutateAsync('j1');
      });

      expect(mockDelete).toHaveBeenCalled();
    });

    it('should insert new costs for each activity with rates', async () => {
      const { result } = renderHook(
        () => useABCMutations({
          activities: mockActivities,
          activityRates: mockActivityRates,
          jobs: mockJobs,
          techniques: mockTechniques,
        }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.calculateJobCost.mutateAsync('j1');
      });

      expect(mockInsert).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Custo do job calculado com sucesso');
    });

    it('should calculate costs using actual times when available', async () => {
      const { result } = renderHook(
        () => useABCMutations({
          activities: mockActivities,
          activityRates: mockActivityRates,
          jobs: mockJobs,
          techniques: mockTechniques,
        }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.calculateJobCost.mutateAsync('j2'); // Has actual times
      });

      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe('updateActivityRate', () => {
    it('should upsert activity rate with correct data', async () => {
      const { result } = renderHook(
        () => useABCMutations({
          activities: mockActivities,
          activityRates: mockActivityRates,
          jobs: mockJobs,
          techniques: mockTechniques,
        }),
        { wrapper: createWrapper() }
      );

      const rateData = {
        activity_id: 'a1',
        cost_pool_id: 'cp1',
        rate_per_unit: 75,
        period_start: '2024-02-01',
        period_end: '2024-12-31',
      };

      await act(async () => {
        await result.current.updateActivityRate.mutateAsync(rateData);
      });

      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          activity_id: 'a1',
          cost_pool_id: 'cp1',
          rate_per_unit: 75,
        }),
        expect.any(Object)
      );
      expect(toast.success).toHaveBeenCalledWith('Taxa atualizada com sucesso');
    });
  });

  describe('updateCostPoolBudget', () => {
    it('should update cost pool budget', async () => {
      const { result } = renderHook(
        () => useABCMutations({
          activities: mockActivities,
          activityRates: mockActivityRates,
          jobs: mockJobs,
          techniques: mockTechniques,
        }),
        { wrapper: createWrapper() }
      );

      await act(async () => {
        await result.current.updateCostPoolBudget.mutateAsync({
          id: 'cp1',
          monthly_budget: 15000,
        });
      });

      expect(mockUpdate).toHaveBeenCalledWith({ monthly_budget: 15000 });
      expect(toast.success).toHaveBeenCalledWith('Orçamento atualizado');
    });
  });

  describe('calculateAllJobsCosts', () => {
    it('should calculate costs for all jobs in batches', async () => {
      // Mock calculateJobCost to succeed
      mockDelete.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
      mockInsert.mockResolvedValue({ error: null });

      const { result } = renderHook(
        () => useABCMutations({
          activities: mockActivities,
          activityRates: mockActivityRates,
          jobs: mockJobs,
          techniques: mockTechniques,
        }),
        { wrapper: createWrapper() }
      );

      let count: number = 0;
      await act(async () => {
        count = await result.current.calculateAllJobsCosts.mutateAsync();
      });

      expect(count).toBe(2); // Both jobs processed
      expect(toast.success).toHaveBeenCalledWith('Custos calculados para 2 jobs');
    });
  });

  describe('mutation states', () => {
    it('should have correct initial states', () => {
      const { result } = renderHook(
        () => useABCMutations({
          activities: mockActivities,
          activityRates: mockActivityRates,
          jobs: mockJobs,
          techniques: mockTechniques,
        }),
        { wrapper: createWrapper() }
      );

      expect(result.current.calculateJobCost.isPending).toBe(false);
      expect(result.current.calculateAllJobsCosts.isPending).toBe(false);
      expect(result.current.updateActivityRate.isPending).toBe(false);
      expect(result.current.updateCostPoolBudget.isPending).toBe(false);
    });
  });
});
