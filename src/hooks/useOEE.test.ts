import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOEE } from './useOEE';
import * as schedulingHook from './useSchedulingData';
import * as configHook from './useBusinessConfig';
import React from 'react';

vi.mock('./useSchedulingData', () => ({
  useSchedulingData: vi.fn(),
}));

vi.mock('./useBusinessConfig', () => ({
  useBusinessConfig: vi.fn(),
}));

describe('useOEE', () => {
  const mockJobs = [
    {
      id: 'job-1',
      status: 'finished',
      machine_id: 'm1',
      actual_start_time: '2026-05-15T08:00:00Z',
      actual_end_time: '2026-05-15T10:00:00Z', // 120 minutes
      estimated_duration: 100,
      quantity: 100,
      produced_quantity: 100,
      lost_pieces: 5,
    }
  ];

  const mockMachines = [
    { id: 'm1', name: 'Machine 1', code: 'M1', technique_id: 't1' },
  ];

  const mockTechniques = [
    { id: 't1', name: 'Technique 1', color: '#ff0000' },
  ];

  it('calculates OEE metrics correctly', () => {
    (schedulingHook.useSchedulingData as any).mockReturnValue({
      jobs: mockJobs,
      machines: mockMachines,
      techniques: mockTechniques,
      isLoading: false,
    });

    (configHook.useBusinessConfig as any).mockReturnValue({
      getConfig: vi.fn().mockReturnValue({ start: '07:00', end: '18:00' }), // 11 hours = 660 mins
      isLoading: false,
    });

    const { result } = renderHook(() => useOEE(30, 0));

    expect(result.current.data).not.toBeNull();
    if (result.current.data) {
      const machine = result.current.data.byMachine[0];
      
      // Availability = Actual Operating Time / Planned Production Time
      // Planned = max(11h, 100min) = 660min
      // Actual = 120min
      // Avail = 120 / 660 * 100 = 18.18%
      expect(machine.availability).toBeCloseTo(18.2, 1);

      // Performance = Ideal Time / Actual Operating Time
      // Ideal = 100min
      // Actual = 120min
      // Perf = 100 / 120 * 100 = 83.33%
      expect(machine.performance).toBeCloseTo(83.3, 1);

      // Quality = Good Pieces / Total Produced
      // Good = 100 - 5 = 95
      // Total = 100
      // Qual = 95%
      expect(machine.quality).toBe(95);

      // OEE = A * P * Q
      // 0.1818 * 0.8333 * 0.95 = 0.1439 = 14.4%
      expect(machine.oee).toBeCloseTo(14.4, 1);
    }
  });
});
