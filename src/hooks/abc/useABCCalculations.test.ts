import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useABCCalculations } from './useABCCalculations';
import { ABCCostPool, ABCJobCost } from './types';

describe('useABCCalculations', () => {
  const mockCostPools: ABCCostPool[] = [
    {
      id: 'cp1',
      name: 'Labor',
      description: null,
      pool_type: 'labor',
      monthly_budget: 10000,
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 'cp2',
      name: 'Equipment',
      description: null,
      pool_type: 'equipment',
      monthly_budget: 5000,
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 'cp3',
      name: 'Materials',
      description: null,
      pool_type: 'materials',
      monthly_budget: 8000,
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ];

  const mockJobs = [
    {
      id: 'j1',
      order_number: 'ORD-001',
      client: 'Client A',
      product: 'Product A',
      technique_id: 't1',
      quantity: 100,
      produced_quantity: 95,
    },
    {
      id: 'j2',
      order_number: 'ORD-002',
      client: 'Client B',
      product: 'Product B',
      technique_id: 't1',
      quantity: 200,
      produced_quantity: 190,
    },
    {
      id: 'j3',
      order_number: 'ORD-003',
      client: 'Client C',
      product: 'Product C',
      technique_id: 't2',
      quantity: 50,
      produced_quantity: 48,
    },
  ];

  const mockJobCosts: ABCJobCost[] = [
    {
      id: 'jc1',
      job_id: 'j1',
      activity_id: 'a1',
      cost_pool_id: 'cp1',
      driver_quantity: 10,
      unit_rate: 5,
      total_cost: 50,
      calculated_at: '2024-01-15',
      created_at: '2024-01-15',
    },
    {
      id: 'jc2',
      job_id: 'j1',
      activity_id: 'a1',
      cost_pool_id: 'cp2',
      driver_quantity: 5,
      unit_rate: 10,
      total_cost: 50,
      calculated_at: '2024-01-15',
      created_at: '2024-01-15',
    },
    {
      id: 'jc3',
      job_id: 'j2',
      activity_id: 'a1',
      cost_pool_id: 'cp1',
      driver_quantity: 20,
      unit_rate: 5,
      total_cost: 100,
      calculated_at: '2024-01-15',
      created_at: '2024-01-15',
    },
    {
      id: 'jc4',
      job_id: 'j3',
      activity_id: 'a2',
      cost_pool_id: 'cp3',
      driver_quantity: 5,
      unit_rate: 8,
      total_cost: 40,
      calculated_at: '2024-01-15',
      created_at: '2024-01-15',
    },
  ];

  const mockTechniques = [
    { id: 't1', name: 'Silk Screen' },
    { id: 't2', name: 'Laser' },
    { id: 't3', name: 'Tampografia' },
  ];

  describe('getJobCostSummary', () => {
    it('should return null for non-existent job', () => {
      const { result } = renderHook(() =>
        useABCCalculations({
          costPools: mockCostPools,
          jobCosts: mockJobCosts,
          jobs: mockJobs,
          techniques: mockTechniques,
        })
      );

      const summary = result.current.getJobCostSummary('non-existent');
      expect(summary).toBeNull();
    });

    it('should calculate job cost summary correctly', () => {
      const { result } = renderHook(() =>
        useABCCalculations({
          costPools: mockCostPools,
          jobCosts: mockJobCosts,
          jobs: mockJobs,
          techniques: mockTechniques,
        })
      );

      const summary = result.current.getJobCostSummary('j1');

      expect(summary).not.toBeNull();
      expect(summary?.job_id).toBe('j1');
      expect(summary?.order_number).toBe('ORD-001');
      expect(summary?.total_cost).toBe(100); // 50 + 50
      expect(summary?.unit_cost).toBe(1); // 100 / 100 quantity
      expect(summary?.cost_breakdown).toHaveLength(2); // labor and equipment
    });

    it('should calculate correct percentages in breakdown', () => {
      const { result } = renderHook(() =>
        useABCCalculations({
          costPools: mockCostPools,
          jobCosts: mockJobCosts,
          jobs: mockJobs,
          techniques: mockTechniques,
        })
      );

      const summary = result.current.getJobCostSummary('j1');
      const laborBreakdown = summary?.cost_breakdown.find(b => b.pool_type === 'labor');
      const equipmentBreakdown = summary?.cost_breakdown.find(b => b.pool_type === 'equipment');

      expect(laborBreakdown?.percentage).toBe(50);
      expect(equipmentBreakdown?.percentage).toBe(50);
    });

    it('should handle job with zero quantity', () => {
      const jobsWithZeroQuantity = [
        { ...mockJobs[0], quantity: 0 },
      ];

      const { result } = renderHook(() =>
        useABCCalculations({
          costPools: mockCostPools,
          jobCosts: mockJobCosts,
          jobs: jobsWithZeroQuantity,
          techniques: mockTechniques,
        })
      );

      const summary = result.current.getJobCostSummary('j1');
      expect(summary?.unit_cost).toBe(0);
    });
  });

  describe('getTechniqueCostSummary', () => {
    it('should return summary for techniques with jobs', () => {
      const { result } = renderHook(() =>
        useABCCalculations({
          costPools: mockCostPools,
          jobCosts: mockJobCosts,
          jobs: mockJobs,
          techniques: mockTechniques,
        })
      );

      const summaries = result.current.getTechniqueCostSummary();

      expect(summaries.length).toBe(2); // t1 and t2 have jobs, t3 does not
    });

    it('should calculate technique totals correctly', () => {
      const { result } = renderHook(() =>
        useABCCalculations({
          costPools: mockCostPools,
          jobCosts: mockJobCosts,
          jobs: mockJobs,
          techniques: mockTechniques,
        })
      );

      const summaries = result.current.getTechniqueCostSummary();
      const silkScreen = summaries.find(s => s.technique_id === 't1');

      expect(silkScreen?.technique_name).toBe('Silk Screen');
      expect(silkScreen?.total_jobs).toBe(2); // j1 and j2
      expect(silkScreen?.total_cost).toBe(200); // 100 from j1 + 100 from j2
      expect(silkScreen?.total_quantity).toBe(285); // 95 + 190 produced
    });

    it('should calculate average unit cost correctly', () => {
      const { result } = renderHook(() =>
        useABCCalculations({
          costPools: mockCostPools,
          jobCosts: mockJobCosts,
          jobs: mockJobs,
          techniques: mockTechniques,
        })
      );

      const summaries = result.current.getTechniqueCostSummary();
      const silkScreen = summaries.find(s => s.technique_id === 't1');

      expect(silkScreen?.avg_unit_cost).toBeCloseTo(200 / 285, 5);
    });

    it('should not include techniques without jobs', () => {
      const { result } = renderHook(() =>
        useABCCalculations({
          costPools: mockCostPools,
          jobCosts: mockJobCosts,
          jobs: mockJobs,
          techniques: mockTechniques,
        })
      );

      const summaries = result.current.getTechniqueCostSummary();
      const tampografia = summaries.find(s => s.technique_id === 't3');

      expect(tampografia).toBeUndefined();
    });
  });

  describe('totals calculation', () => {
    it('should calculate totalBudget correctly', () => {
      const { result } = renderHook(() =>
        useABCCalculations({
          costPools: mockCostPools,
          jobCosts: mockJobCosts,
          jobs: mockJobs,
          techniques: mockTechniques,
        })
      );

      expect(result.current.totalBudget).toBe(23000); // 10000 + 5000 + 8000
    });

    it('should calculate totalAllocatedCost correctly', () => {
      const { result } = renderHook(() =>
        useABCCalculations({
          costPools: mockCostPools,
          jobCosts: mockJobCosts,
          jobs: mockJobs,
          techniques: mockTechniques,
        })
      );

      expect(result.current.totalAllocatedCost).toBe(240); // 50 + 50 + 100 + 40
    });

    it('should calculate averageUnitCost correctly', () => {
      const { result } = renderHook(() =>
        useABCCalculations({
          costPools: mockCostPools,
          jobCosts: mockJobCosts,
          jobs: mockJobs,
          techniques: mockTechniques,
        })
      );

      // Total produced: 95 + 190 + 48 = 333
      // Total cost: 240
      expect(result.current.averageUnitCost).toBeCloseTo(240 / 333, 5);
    });

    it('should handle empty data', () => {
      const { result } = renderHook(() =>
        useABCCalculations({
          costPools: [],
          jobCosts: [],
          jobs: [],
          techniques: [],
        })
      );

      expect(result.current.totalBudget).toBe(0);
      expect(result.current.totalAllocatedCost).toBe(0);
      expect(result.current.averageUnitCost).toBe(0);
    });
  });

  describe('memoization', () => {
    it('should return same function references on rerender', () => {
      const { result, rerender } = renderHook(() =>
        useABCCalculations({
          costPools: mockCostPools,
          jobCosts: mockJobCosts,
          jobs: mockJobs,
          techniques: mockTechniques,
        })
      );

      const firstGetJobCostSummary = result.current.getJobCostSummary;
      const firstGetTechniqueCostSummary = result.current.getTechniqueCostSummary;

      rerender();

      expect(result.current.getJobCostSummary).toBe(firstGetJobCostSummary);
      expect(result.current.getTechniqueCostSummary).toBe(firstGetTechniqueCostSummary);
    });
  });
});
