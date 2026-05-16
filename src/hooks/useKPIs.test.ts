import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKPIs } from './useKPIs';
import * as schedulingHook from './useSchedulingData';
import React from 'react';

// Mock the dependency
vi.mock('./useSchedulingData', () => ({
  useSchedulingData: vi.fn(),
}));

describe('useKPIs', () => {
  const mockJobs = [
    {
      id: 'job-1',
      quantity: 100,
      lost_pieces: 10,
      status: 'finished',
      machine_id: 'm1',
      technique_id: 't1',
      product: 'Product A',
      estimated_duration: 60,
      created_at: new Date().toISOString(),
    },
    {
      id: 'job-2',
      quantity: 50,
      lost_pieces: 0,
      status: 'production',
      machine_id: 'm1',
      technique_id: 't1',
      product: 'Product B',
      estimated_duration: 30,
      created_at: new Date().toISOString(),
    },
  ];

  const mockMachines = [
    { id: 'm1', name: 'Machine 1', technique_id: 't1' },
  ];

  const mockTechniques = [
    { id: 't1', name: 'Technique 1', color: '#ff0000' },
  ];

  it('calculates KPIs correctly based on jobs data', () => {
    (schedulingHook.useSchedulingData as any).mockReturnValue({
      jobs: mockJobs,
      machines: mockMachines,
      techniques: mockTechniques,
      isLoading: false,
    });

    const { result } = renderHook(() => useKPIs('all'));

    expect(result.current.data).not.toBeNull();
    if (result.current.data) {
      expect(result.current.data.totalJobs).toBe(2);
      expect(result.current.data.completedJobs).toBe(1);
      expect(result.current.data.inProgressJobs).toBe(1);
      expect(result.current.data.totalPieces).toBe(150);
      expect(result.current.data.lostPieces).toBe(10);
      // lossRate = (lost / (produced + lost)) * 100
      // produced = produced_quantity ?? quantity. Job 1: 100, Job 2: 50. Total 150.
      // lossRate = (10 / (150 + 10)) * 100 = 6.25%
      expect(result.current.data.lossRate).toBeCloseTo(6.25);
    }
  });

  it('filters data by period correctly', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);

    const periodJobs = [
      ...mockJobs,
      {
        id: 'job-old',
        quantity: 100,
        status: 'finished',
        created_at: oldDate.toISOString(),
      }
    ];

    (schedulingHook.useSchedulingData as any).mockReturnValue({
      jobs: periodJobs,
      machines: mockMachines,
      techniques: mockTechniques,
      isLoading: false,
    });

    // When period is 'week' (7 days), the 10-day old job should be excluded
    const { result } = renderHook(() => useKPIs('week'));

    if (result.current.data) {
      expect(result.current.data.totalJobs).toBe(2);
    }
  });

  it('returns null data when loading or missing dependencies', () => {
    (schedulingHook.useSchedulingData as any).mockReturnValue({
      jobs: null,
      machines: null,
      techniques: null,
      isLoading: true,
    });

    const { result } = renderHook(() => useKPIs());
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });
});
