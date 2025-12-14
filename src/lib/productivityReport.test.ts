import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock jsPDF before importing the module
vi.mock('jspdf', () => {
  const mockInstance = {
    setFontSize: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    setDrawColor: vi.fn(),
    setFillColor: vi.fn(),
    rect: vi.fn(),
    setFont: vi.fn(),
    line: vi.fn(),
    save: vi.fn(),
    addPage: vi.fn(),
    setPage: vi.fn(),
    getNumberOfPages: vi.fn(() => 1),
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    },
  };
  return {
    default: vi.fn(() => mockInstance),
  };
});

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}));

import { generateProductivityReport } from './productivityReport';
import type { GoalType } from '@/hooks/useOperatorGoals';

describe('generateProductivityReport', () => {
  const mockOperators = [
    {
      operatorId: 'op-1',
      operatorName: 'João Silva',
      totalJobsCompleted: 45,
      averageProductionTime: 120,
      efficiencyScore: 92.5,
      lossRate: 2.1,
      totalPiecesProduced: 4500,
      totalLostPieces: 95,
      totalScans: 180,
      assignedMachines: ['FL-01', 'FL-02'],
      productionVelocity: 37.5,
      isActive: true,
    },
  ];

  const mockOverallStats = {
    averageEfficiency: 88.5,
    totalJobsCompleted: 150,
    totalPiecesProduced: 15000,
    averageLossRate: 2.8,
  };

  const mockGoals = [
    {
      id: 'goal-1',
      operator_id: 'op-1',
      goal_type: 'jobs_completed' as GoalType,
      target_value: 50,
      period_start: '2024-01-01',
      period_end: '2024-01-31',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'admin-1',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a PDF without throwing errors', () => {
    expect(() =>
      generateProductivityReport({
        operators: mockOperators as any,
        overallStats: mockOverallStats,
        goals: mockGoals,
        period: 'Últimos 30 dias',
      })
    ).not.toThrow();
  });

  it('should handle empty operators array', () => {
    expect(() =>
      generateProductivityReport({
        operators: [],
        overallStats: mockOverallStats,
        goals: [],
        period: 'Últimos 30 dias',
      })
    ).not.toThrow();
  });
});
