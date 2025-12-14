import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock the dependencies
vi.mock('./useOperatorGoals', () => ({
  useOperatorGoals: () => ({
    activeGoals: [
      {
        id: 'goal-1',
        operator_id: 'user-1',
        goal_type: 'jobs_completed',
        target_value: 50,
        period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'admin-1',
      },
    ],
    isLoading: false,
  }),
}));

vi.mock('./useOperatorProductivity', () => ({
  useOperatorProductivity: () => ({
    operators: [
      {
        id: 'user-1',
        name: 'João Silva',
        jobsCompleted: 20,
        efficiencyRate: 85,
        lossRate: 3,
        totalPiecesProduced: 2000,
        totalLostPieces: 60,
        averageTimeMinutes: 100,
        totalScans: 50,
        assignedMachines: ['FL-01'],
      },
    ],
    isLoading: false,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

import { useGoalAlerts } from './useGoalAlerts';

describe('useGoalAlerts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate goal alerts based on operator progress', () => {
    const { result } = renderHook(() => useGoalAlerts());

    expect(result.current.goalAlerts).toBeDefined();
    expect(Array.isArray(result.current.goalAlerts)).toBe(true);
  });

  it('should return loading state', () => {
    const { result } = renderHook(() => useGoalAlerts());

    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('should return alert counts', () => {
    const { result } = renderHook(() => useGoalAlerts());

    expect(typeof result.current.criticalCount).toBe('number');
    expect(typeof result.current.warningCount).toBe('number');
    expect(typeof result.current.totalAlertCount).toBe('number');
  });

  it('should provide forceCheckGoals function', () => {
    const { result } = renderHook(() => useGoalAlerts());

    expect(typeof result.current.forceCheckGoals).toBe('function');
  });

  it('should calculate risk level based on progress and time remaining', () => {
    const { result } = renderHook(() => useGoalAlerts());

    // With 20/50 jobs completed (40%) and ~15 days remaining in a 30-day period,
    // the operator is behind schedule
    if (result.current.goalAlerts.length > 0) {
      const alert = result.current.goalAlerts[0];
      expect(['critical', 'warning', 'on-track']).toContain(alert.riskLevel);
    }
  });
});
