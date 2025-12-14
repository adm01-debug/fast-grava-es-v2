import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';

// Mock the useJobs hooks
vi.mock('./useJobs', () => ({
  useJobs: vi.fn(() => ({
    data: [
      {
        id: 'job-1',
        status: 'finished',
        quantity: 100,
        lost_pieces: 5,
        technique_id: 'tech-1',
        machine_id: 'machine-1',
        scheduled_date: new Date().toISOString().split('T')[0],
        estimated_duration: 60,
      },
      {
        id: 'job-2',
        status: 'production',
        quantity: 200,
        lost_pieces: 0,
        technique_id: 'tech-1',
        machine_id: 'machine-1',
        scheduled_date: new Date().toISOString().split('T')[0],
        estimated_duration: 90,
      },
      {
        id: 'job-3',
        status: 'delayed',
        quantity: 150,
        lost_pieces: 10,
        technique_id: 'tech-2',
        machine_id: 'machine-2',
        scheduled_date: '2024-01-01',
        estimated_duration: 45,
      },
    ],
    isLoading: false,
  })),
  useTechniques: vi.fn(() => ({
    data: [
      { id: 'tech-1', name: 'Laser', short_name: 'LSR', color: '#FF0000', setup_time: 10 },
      { id: 'tech-2', name: 'Silk', short_name: 'SLK', color: '#00FF00', setup_time: 20 },
    ],
    isLoading: false,
  })),
  useMachines: vi.fn(() => ({
    data: [
      { id: 'machine-1', code: 'FL-01', name: 'Fiber Laser 1', technique_id: 'tech-1', is_active: true },
      { id: 'machine-2', code: 'SK-01', name: 'Silk Screen 1', technique_id: 'tech-2', is_active: true },
    ],
    isLoading: false,
  })),
}));

import { useKPIs, calculateEstimatedTime, formatDuration } from './useKPIs';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useKPIs Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Structure', () => {
    it('should return KPI data object', () => {
      const { result } = renderHook(() => useKPIs(), {
        wrapper: createWrapper(),
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('should include overview stats', () => {
      const { result } = renderHook(() => useKPIs(), {
        wrapper: createWrapper(),
      });

      const data = result.current.data;
      expect(data?.totalJobs).toBeDefined();
      expect(data?.completedJobs).toBeDefined();
      expect(data?.inProgressJobs).toBeDefined();
      expect(data?.delayedJobs).toBeDefined();
    });

    it('should include pieces stats', () => {
      const { result } = renderHook(() => useKPIs(), {
        wrapper: createWrapper(),
      });

      const data = result.current.data;
      expect(data?.totalPieces).toBeDefined();
      expect(data?.completedPieces).toBeDefined();
      expect(data?.lostPieces).toBeDefined();
      expect(data?.lossRate).toBeDefined();
    });

    it('should include productivity by machine', () => {
      const { result } = renderHook(() => useKPIs(), {
        wrapper: createWrapper(),
      });

      expect(result.current.data?.productivityByMachine).toBeDefined();
      expect(Array.isArray(result.current.data?.productivityByMachine)).toBe(true);
    });

    it('should include productivity by technique', () => {
      const { result } = renderHook(() => useKPIs(), {
        wrapper: createWrapper(),
      });

      expect(result.current.data?.productivityByTechnique).toBeDefined();
      expect(Array.isArray(result.current.data?.productivityByTechnique)).toBe(true);
    });

    it('should include today stats', () => {
      const { result } = renderHook(() => useKPIs(), {
        wrapper: createWrapper(),
      });

      const todayStats = result.current.data?.todayStats;
      expect(todayStats?.scheduled).toBeDefined();
      expect(todayStats?.completed).toBeDefined();
      expect(todayStats?.inProgress).toBeDefined();
      expect(todayStats?.delayed).toBeDefined();
    });
  });

  describe('Calculations', () => {
    it('should calculate correct job counts', () => {
      const { result } = renderHook(() => useKPIs(), {
        wrapper: createWrapper(),
      });

      const data = result.current.data;
      expect(data?.totalJobs).toBe(3);
      expect(data?.completedJobs).toBe(1);
      expect(data?.inProgressJobs).toBe(1);
      expect(data?.delayedJobs).toBe(1);
    });

    it('should calculate total pieces correctly', () => {
      const { result } = renderHook(() => useKPIs(), {
        wrapper: createWrapper(),
      });

      const data = result.current.data;
      expect(data?.totalPieces).toBe(450); // 100 + 200 + 150
    });

    it('should calculate lost pieces correctly', () => {
      const { result } = renderHook(() => useKPIs(), {
        wrapper: createWrapper(),
      });

      expect(result.current.data?.lostPieces).toBe(15); // 5 + 0 + 10
    });

    it('should calculate loss rate correctly', () => {
      const { result } = renderHook(() => useKPIs(), {
        wrapper: createWrapper(),
      });

      const data = result.current.data;
      // Loss rate = (lostPieces / (completedPieces + lostPieces)) * 100
      // completedPieces = 100 (only job-1 is finished)
      // lostPieces from completed = 5
      // Formula: 5 / (100 + 5) * 100 = 4.76%
      expect(data?.lossRate).toBeCloseTo(4.76, 1);
    });
  });
});

describe('calculateEstimatedTime', () => {
  it('should calculate basic time with defaults', () => {
    const result = calculateEstimatedTime({
      quantity: 100,
      techniqueSetupTime: 10,
    });

    // 10 (setup) + (100 * 30 / 60) = 10 + 50 = 60
    expect(result).toBe(60);
  });

  it('should include setup time', () => {
    const withSetup = calculateEstimatedTime({
      quantity: 60,
      techniqueSetupTime: 20,
    });

    const withoutSetup = calculateEstimatedTime({
      quantity: 60,
      techniqueSetupTime: 0,
    });

    expect(withSetup - withoutSetup).toBe(20);
  });

  it('should scale with quantity', () => {
    const small = calculateEstimatedTime({
      quantity: 10,
      techniqueSetupTime: 0,
    });

    const large = calculateEstimatedTime({
      quantity: 100,
      techniqueSetupTime: 0,
    });

    expect(large).toBeGreaterThan(small);
  });

  it('should apply complexity factor', () => {
    const simple = calculateEstimatedTime({
      quantity: 100,
      techniqueSetupTime: 0,
      complexityFactor: 1,
    });

    const complex = calculateEstimatedTime({
      quantity: 100,
      techniqueSetupTime: 0,
      complexityFactor: 3,
    });

    expect(complex).toBeGreaterThan(simple);
  });

  it('should apply size multiplier', () => {
    const small = calculateEstimatedTime({
      quantity: 100,
      techniqueSetupTime: 0,
      sizeMultiplier: 1,
    });

    const large = calculateEstimatedTime({
      quantity: 100,
      techniqueSetupTime: 0,
      sizeMultiplier: 2,
    });

    expect(large).toBeGreaterThan(small);
  });

  it('should add time for multiple colors', () => {
    const oneColor = calculateEstimatedTime({
      quantity: 100,
      techniqueSetupTime: 0,
      colorCount: 1,
    });

    const threeColors = calculateEstimatedTime({
      quantity: 100,
      techniqueSetupTime: 0,
      colorCount: 3,
    });

    expect(threeColors).toBeGreaterThan(oneColor);
  });

  it('should return ceiling value (rounded up)', () => {
    const result = calculateEstimatedTime({
      quantity: 1,
      techniqueSetupTime: 0,
      baseTimePerPiece: 1, // 1 second
    });

    // Should round up to nearest minute
    expect(result).toBe(1);
  });
});

describe('formatDuration', () => {
  it('should format minutes only when under 60', () => {
    expect(formatDuration(30)).toBe('30min');
    expect(formatDuration(59)).toBe('59min');
  });

  it('should format hours only when evenly divisible', () => {
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(180)).toBe('3h');
  });

  it('should format hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30min');
    expect(formatDuration(150)).toBe('2h 30min');
    expect(formatDuration(65)).toBe('1h 5min');
  });

  it('should handle zero', () => {
    expect(formatDuration(0)).toBe('0min');
  });

  it('should handle large values', () => {
    expect(formatDuration(480)).toBe('8h');
    expect(formatDuration(485)).toBe('8h 5min');
  });
});

describe('KPI Data Types', () => {
  it('should have correct productivity by machine structure', () => {
    const { result } = renderHook(() => useKPIs(), {
      wrapper: createWrapper(),
    });

    const machineData = result.current.data?.productivityByMachine[0];
    if (machineData) {
      expect(machineData).toHaveProperty('machineId');
      expect(machineData).toHaveProperty('machineName');
      expect(machineData).toHaveProperty('techniqueId');
      expect(machineData).toHaveProperty('jobCount');
      expect(machineData).toHaveProperty('completedJobs');
      expect(machineData).toHaveProperty('totalPieces');
      expect(machineData).toHaveProperty('lostPieces');
      expect(machineData).toHaveProperty('lossRate');
      expect(machineData).toHaveProperty('avgDuration');
    }
  });

  it('should have correct productivity by technique structure', () => {
    const { result } = renderHook(() => useKPIs(), {
      wrapper: createWrapper(),
    });

    const techData = result.current.data?.productivityByTechnique[0];
    if (techData) {
      expect(techData).toHaveProperty('techniqueId');
      expect(techData).toHaveProperty('techniqueName');
      expect(techData).toHaveProperty('color');
      expect(techData).toHaveProperty('jobCount');
      expect(techData).toHaveProperty('completedJobs');
      expect(techData).toHaveProperty('totalPieces');
      expect(techData).toHaveProperty('lostPieces');
      expect(techData).toHaveProperty('avgDuration');
      expect(techData).toHaveProperty('occupancyRate');
    }
  });
});
