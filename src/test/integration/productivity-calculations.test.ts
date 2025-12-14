import { describe, it, expect } from 'vitest';

// Types for productivity calculations
interface Job {
  id: string;
  quantity: number;
  produced_quantity: number;
  lost_pieces: number;
  estimated_duration: number;
  actual_start_time: string | null;
  actual_end_time: string | null;
  status: string;
}

interface OperatorMetrics {
  totalJobsCompleted: number;
  totalPiecesProduced: number;
  totalLostPieces: number;
  totalEstimatedMinutes: number;
  totalActualMinutes: number;
  efficiencyScore: number;
  lossRate: number;
  productionVelocity: number;
  qualityScore: number;
}

// Calculation functions to test
const calculateLossRate = (lostPieces: number, totalQuantity: number): number => {
  if (totalQuantity === 0) return 0;
  return (lostPieces / totalQuantity) * 100;
};

const calculateQualityScore = (lossRate: number): number => {
  // Quality score is inverse of loss rate (100% - loss rate)
  return Math.max(0, Math.min(100, 100 - lossRate));
};

const calculateTimeEfficiency = (estimatedMinutes: number, actualMinutes: number): number => {
  if (actualMinutes === 0) return 100;
  if (estimatedMinutes === 0) return 0;
  
  // If completed faster than estimated, efficiency is higher
  // If took longer, efficiency decreases proportionally
  const ratio = estimatedMinutes / actualMinutes;
  return Math.min(150, ratio * 100); // Cap at 150% for very fast completions
};

const calculateProductionVelocity = (piecesProduced: number, hoursWorked: number): number => {
  if (hoursWorked === 0) return 0;
  return piecesProduced / hoursWorked;
};

const calculateOverallEfficiency = (
  timeEfficiency: number,
  qualityScore: number,
  completionRate: number
): number => {
  // Weighted average: time 40%, quality 40%, completion 20%
  return (timeEfficiency * 0.4) + (qualityScore * 0.4) + (completionRate * 0.2);
};

const calculateCompletionRate = (completedJobs: number, totalJobs: number): number => {
  if (totalJobs === 0) return 0;
  return (completedJobs / totalJobs) * 100;
};

const calculateActualMinutes = (startTime: string, endTime: string): number => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.round((end - start) / (1000 * 60));
};

const aggregateOperatorMetrics = (jobs: Job[]): OperatorMetrics => {
  const completedJobs = jobs.filter(j => j.status === 'finished');
  
  const totalPiecesProduced = completedJobs.reduce((sum, j) => sum + (j.produced_quantity || 0), 0);
  const totalLostPieces = completedJobs.reduce((sum, j) => sum + (j.lost_pieces || 0), 0);
  const totalQuantity = completedJobs.reduce((sum, j) => sum + j.quantity, 0);
  const totalEstimatedMinutes = completedJobs.reduce((sum, j) => sum + j.estimated_duration, 0);
  
  let totalActualMinutes = 0;
  completedJobs.forEach(job => {
    if (job.actual_start_time && job.actual_end_time) {
      totalActualMinutes += calculateActualMinutes(job.actual_start_time, job.actual_end_time);
    }
  });

  const lossRate = calculateLossRate(totalLostPieces, totalQuantity);
  const qualityScore = calculateQualityScore(lossRate);
  const timeEfficiency = calculateTimeEfficiency(totalEstimatedMinutes, totalActualMinutes);
  const completionRate = calculateCompletionRate(completedJobs.length, jobs.length);
  const productionVelocity = calculateProductionVelocity(totalPiecesProduced, totalActualMinutes / 60);
  const efficiencyScore = calculateOverallEfficiency(timeEfficiency, qualityScore, completionRate);

  return {
    totalJobsCompleted: completedJobs.length,
    totalPiecesProduced,
    totalLostPieces,
    totalEstimatedMinutes,
    totalActualMinutes,
    efficiencyScore,
    lossRate,
    productionVelocity,
    qualityScore,
  };
};

describe('Productivity Calculation Tests', () => {
  describe('Loss Rate Calculation', () => {
    it('should calculate correct loss rate percentage', () => {
      expect(calculateLossRate(5, 100)).toBe(5);
      expect(calculateLossRate(10, 200)).toBe(5);
      expect(calculateLossRate(25, 500)).toBe(5);
    });

    it('should handle zero total quantity', () => {
      expect(calculateLossRate(0, 0)).toBe(0);
      expect(calculateLossRate(10, 0)).toBe(0);
    });

    it('should handle zero lost pieces', () => {
      expect(calculateLossRate(0, 100)).toBe(0);
      expect(calculateLossRate(0, 500)).toBe(0);
    });

    it('should calculate high loss rates correctly', () => {
      expect(calculateLossRate(50, 100)).toBe(50);
      expect(calculateLossRate(90, 100)).toBe(90);
      expect(calculateLossRate(100, 100)).toBe(100);
    });

    it('should handle decimal results', () => {
      expect(calculateLossRate(1, 3)).toBeCloseTo(33.33, 1);
      expect(calculateLossRate(7, 11)).toBeCloseTo(63.64, 1);
    });
  });

  describe('Quality Score Calculation', () => {
    it('should calculate quality as inverse of loss rate', () => {
      expect(calculateQualityScore(0)).toBe(100);
      expect(calculateQualityScore(5)).toBe(95);
      expect(calculateQualityScore(10)).toBe(90);
      expect(calculateQualityScore(25)).toBe(75);
    });

    it('should cap quality score at 0 for high loss rates', () => {
      expect(calculateQualityScore(100)).toBe(0);
      expect(calculateQualityScore(150)).toBe(0);
    });

    it('should cap quality score at 100 for negative loss rates', () => {
      expect(calculateQualityScore(-10)).toBe(100);
    });
  });

  describe('Time Efficiency Calculation', () => {
    it('should return 100% when actual equals estimated', () => {
      expect(calculateTimeEfficiency(60, 60)).toBe(100);
      expect(calculateTimeEfficiency(120, 120)).toBe(100);
    });

    it('should return higher than 100% when faster than estimated', () => {
      expect(calculateTimeEfficiency(60, 30)).toBe(200); // But capped at 150
      expect(calculateTimeEfficiency(120, 60)).toBe(200); // But capped at 150
    });

    it('should cap efficiency at 150%', () => {
      expect(calculateTimeEfficiency(120, 30)).toBe(150);
      expect(calculateTimeEfficiency(300, 60)).toBe(150);
    });

    it('should return lower than 100% when slower than estimated', () => {
      expect(calculateTimeEfficiency(60, 120)).toBe(50);
      expect(calculateTimeEfficiency(60, 90)).toBeCloseTo(66.67, 1);
    });

    it('should handle zero actual minutes', () => {
      expect(calculateTimeEfficiency(60, 0)).toBe(100);
    });

    it('should handle zero estimated minutes', () => {
      expect(calculateTimeEfficiency(0, 60)).toBe(0);
    });
  });

  describe('Production Velocity Calculation', () => {
    it('should calculate pieces per hour correctly', () => {
      expect(calculateProductionVelocity(100, 1)).toBe(100);
      expect(calculateProductionVelocity(200, 2)).toBe(100);
      expect(calculateProductionVelocity(150, 3)).toBe(50);
    });

    it('should handle zero hours', () => {
      expect(calculateProductionVelocity(100, 0)).toBe(0);
    });

    it('should handle zero pieces', () => {
      expect(calculateProductionVelocity(0, 5)).toBe(0);
    });

    it('should handle fractional hours', () => {
      expect(calculateProductionVelocity(50, 0.5)).toBe(100);
      expect(calculateProductionVelocity(75, 1.5)).toBe(50);
    });
  });

  describe('Completion Rate Calculation', () => {
    it('should calculate correct completion percentage', () => {
      expect(calculateCompletionRate(5, 10)).toBe(50);
      expect(calculateCompletionRate(10, 10)).toBe(100);
      expect(calculateCompletionRate(0, 10)).toBe(0);
    });

    it('should handle zero total jobs', () => {
      expect(calculateCompletionRate(0, 0)).toBe(0);
    });

    it('should handle all jobs completed', () => {
      expect(calculateCompletionRate(25, 25)).toBe(100);
    });
  });

  describe('Overall Efficiency Calculation', () => {
    it('should calculate weighted average correctly', () => {
      // 100 * 0.4 + 100 * 0.4 + 100 * 0.2 = 100
      expect(calculateOverallEfficiency(100, 100, 100)).toBe(100);
      
      // 50 * 0.4 + 50 * 0.4 + 50 * 0.2 = 50
      expect(calculateOverallEfficiency(50, 50, 50)).toBe(50);
    });

    it('should weight time and quality more than completion', () => {
      // High time/quality, low completion
      const result1 = calculateOverallEfficiency(100, 100, 0);
      expect(result1).toBe(80); // 40 + 40 + 0

      // Low time/quality, high completion
      const result2 = calculateOverallEfficiency(0, 0, 100);
      expect(result2).toBe(20); // 0 + 0 + 20
    });

    it('should handle mixed performance', () => {
      // 80% time efficiency, 95% quality, 70% completion
      const result = calculateOverallEfficiency(80, 95, 70);
      expect(result).toBe(80 * 0.4 + 95 * 0.4 + 70 * 0.2);
      expect(result).toBe(84); // 32 + 38 + 14
    });
  });

  describe('Actual Minutes Calculation', () => {
    it('should calculate minutes between timestamps', () => {
      const start = '2024-01-15T08:00:00Z';
      const end = '2024-01-15T09:00:00Z';
      expect(calculateActualMinutes(start, end)).toBe(60);
    });

    it('should handle multi-hour durations', () => {
      const start = '2024-01-15T08:00:00Z';
      const end = '2024-01-15T12:30:00Z';
      expect(calculateActualMinutes(start, end)).toBe(270); // 4.5 hours
    });

    it('should handle same day different times', () => {
      const start = '2024-01-15T14:15:00Z';
      const end = '2024-01-15T16:45:00Z';
      expect(calculateActualMinutes(start, end)).toBe(150); // 2.5 hours
    });
  });

  describe('Aggregate Operator Metrics', () => {
    const createJob = (overrides: Partial<Job> = {}): Job => ({
      id: 'job-1',
      quantity: 100,
      produced_quantity: 100,
      lost_pieces: 0,
      estimated_duration: 60,
      actual_start_time: '2024-01-15T08:00:00Z',
      actual_end_time: '2024-01-15T09:00:00Z',
      status: 'finished',
      ...overrides,
    });

    it('should aggregate metrics from multiple jobs', () => {
      const jobs: Job[] = [
        createJob({ id: 'job-1', quantity: 100, produced_quantity: 98, lost_pieces: 2 }),
        createJob({ id: 'job-2', quantity: 200, produced_quantity: 195, lost_pieces: 5 }),
      ];

      const metrics = aggregateOperatorMetrics(jobs);

      expect(metrics.totalJobsCompleted).toBe(2);
      expect(metrics.totalPiecesProduced).toBe(293);
      expect(metrics.totalLostPieces).toBe(7);
    });

    it('should only count finished jobs', () => {
      const jobs: Job[] = [
        createJob({ id: 'job-1', status: 'finished' }),
        createJob({ id: 'job-2', status: 'production' }),
        createJob({ id: 'job-3', status: 'scheduled' }),
      ];

      const metrics = aggregateOperatorMetrics(jobs);

      expect(metrics.totalJobsCompleted).toBe(1);
    });

    it('should calculate loss rate across all jobs', () => {
      const jobs: Job[] = [
        createJob({ quantity: 100, lost_pieces: 5 }),
        createJob({ quantity: 100, lost_pieces: 15 }),
      ];

      const metrics = aggregateOperatorMetrics(jobs);

      // Total lost: 20, Total quantity: 200
      expect(metrics.lossRate).toBe(10);
      expect(metrics.qualityScore).toBe(90);
    });

    it('should handle jobs with no losses', () => {
      const jobs: Job[] = [
        createJob({ quantity: 100, produced_quantity: 100, lost_pieces: 0 }),
        createJob({ quantity: 200, produced_quantity: 200, lost_pieces: 0 }),
      ];

      const metrics = aggregateOperatorMetrics(jobs);

      expect(metrics.lossRate).toBe(0);
      expect(metrics.qualityScore).toBe(100);
    });

    it('should handle empty job list', () => {
      const metrics = aggregateOperatorMetrics([]);

      expect(metrics.totalJobsCompleted).toBe(0);
      expect(metrics.totalPiecesProduced).toBe(0);
      expect(metrics.lossRate).toBe(0);
      expect(metrics.productionVelocity).toBe(0);
    });

    it('should calculate production velocity correctly', () => {
      const jobs: Job[] = [
        createJob({ 
          produced_quantity: 100,
          actual_start_time: '2024-01-15T08:00:00Z',
          actual_end_time: '2024-01-15T09:00:00Z', // 1 hour
        }),
        createJob({ 
          produced_quantity: 200,
          actual_start_time: '2024-01-15T10:00:00Z',
          actual_end_time: '2024-01-15T12:00:00Z', // 2 hours
        }),
      ];

      const metrics = aggregateOperatorMetrics(jobs);

      // 300 pieces in 3 hours = 100 pieces/hour
      expect(metrics.productionVelocity).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small quantities', () => {
      expect(calculateLossRate(1, 10)).toBe(10);
      expect(calculateLossRate(0, 1)).toBe(0);
    });

    it('should handle very large quantities', () => {
      expect(calculateLossRate(1000, 1000000)).toBe(0.1);
      expect(calculateProductionVelocity(100000, 100)).toBe(1000);
    });

    it('should handle perfect performance', () => {
      const perfectJob: Job = {
        id: 'perfect',
        quantity: 500,
        produced_quantity: 500,
        lost_pieces: 0,
        estimated_duration: 120,
        actual_start_time: '2024-01-15T08:00:00Z',
        actual_end_time: '2024-01-15T10:00:00Z',
        status: 'finished',
      };

      const metrics = aggregateOperatorMetrics([perfectJob]);

      expect(metrics.lossRate).toBe(0);
      expect(metrics.qualityScore).toBe(100);
      expect(metrics.totalLostPieces).toBe(0);
    });

    it('should handle poor performance', () => {
      const poorJob: Job = {
        id: 'poor',
        quantity: 100,
        produced_quantity: 50,
        lost_pieces: 50,
        estimated_duration: 60,
        actual_start_time: '2024-01-15T08:00:00Z',
        actual_end_time: '2024-01-15T12:00:00Z', // 4x longer
        status: 'finished',
      };

      const metrics = aggregateOperatorMetrics([poorJob]);

      expect(metrics.lossRate).toBe(50);
      expect(metrics.qualityScore).toBe(50);
    });
  });

  describe('Goal Progress Calculations', () => {
    type GoalType = 'efficiency' | 'jobs_completed' | 'pieces_produced' | 'loss_rate';

    interface Goal {
      goal_type: GoalType;
      target_value: number;
      period_start: string;
      period_end: string;
    }

    const calculateGoalProgress = (goal: Goal, currentValue: number): number => {
      if (goal.goal_type === 'loss_rate') {
        // For loss rate, lower is better
        if (goal.target_value === 0) return currentValue === 0 ? 100 : 0;
        const progress = ((goal.target_value - currentValue) / goal.target_value) * 100 + 100;
        return Math.max(0, Math.min(200, progress));
      }
      
      // For other metrics, higher is better
      if (goal.target_value === 0) return 100;
      return (currentValue / goal.target_value) * 100;
    };

    const isGoalAchieved = (goal: Goal, currentValue: number): boolean => {
      if (goal.goal_type === 'loss_rate') {
        return currentValue <= goal.target_value;
      }
      return currentValue >= goal.target_value;
    };

    it('should calculate efficiency goal progress', () => {
      const goal: Goal = { goal_type: 'efficiency', target_value: 80, period_start: '', period_end: '' };
      
      expect(calculateGoalProgress(goal, 80)).toBe(100);
      expect(calculateGoalProgress(goal, 40)).toBe(50);
      expect(calculateGoalProgress(goal, 100)).toBe(125);
    });

    it('should calculate jobs completed goal progress', () => {
      const goal: Goal = { goal_type: 'jobs_completed', target_value: 50, period_start: '', period_end: '' };
      
      expect(calculateGoalProgress(goal, 25)).toBe(50);
      expect(calculateGoalProgress(goal, 50)).toBe(100);
      expect(calculateGoalProgress(goal, 75)).toBe(150);
    });

    it('should calculate pieces produced goal progress', () => {
      const goal: Goal = { goal_type: 'pieces_produced', target_value: 1000, period_start: '', period_end: '' };
      
      expect(calculateGoalProgress(goal, 500)).toBe(50);
      expect(calculateGoalProgress(goal, 1000)).toBe(100);
    });

    it('should calculate loss rate goal progress (lower is better)', () => {
      const goal: Goal = { goal_type: 'loss_rate', target_value: 5, period_start: '', period_end: '' };
      
      // At exactly target
      expect(calculateGoalProgress(goal, 5)).toBe(100);
      
      // Better than target (lower loss)
      expect(calculateGoalProgress(goal, 2.5)).toBe(150);
      
      // Worse than target (higher loss)
      expect(calculateGoalProgress(goal, 10)).toBe(0);
    });

    it('should correctly determine if goal is achieved', () => {
      const efficiencyGoal: Goal = { goal_type: 'efficiency', target_value: 80, period_start: '', period_end: '' };
      const lossRateGoal: Goal = { goal_type: 'loss_rate', target_value: 5, period_start: '', period_end: '' };

      expect(isGoalAchieved(efficiencyGoal, 85)).toBe(true);
      expect(isGoalAchieved(efficiencyGoal, 75)).toBe(false);
      
      expect(isGoalAchieved(lossRateGoal, 3)).toBe(true);
      expect(isGoalAchieved(lossRateGoal, 5)).toBe(true);
      expect(isGoalAchieved(lossRateGoal, 7)).toBe(false);
    });
  });

  describe('Comparative Analytics', () => {
    interface OperatorComparison {
      operatorId: string;
      efficiencyScore: number;
      lossRate: number;
      productionVelocity: number;
    }

    const rankOperatorsByEfficiency = (operators: OperatorComparison[]): OperatorComparison[] => {
      return [...operators].sort((a, b) => b.efficiencyScore - a.efficiencyScore);
    };

    const rankOperatorsByLossRate = (operators: OperatorComparison[]): OperatorComparison[] => {
      return [...operators].sort((a, b) => a.lossRate - b.lossRate);
    };

    const findTopPerformer = (operators: OperatorComparison[]): OperatorComparison | null => {
      if (operators.length === 0) return null;
      return rankOperatorsByEfficiency(operators)[0];
    };

    const calculateTeamAverage = (operators: OperatorComparison[], metric: keyof OperatorComparison): number => {
      if (operators.length === 0) return 0;
      const sum = operators.reduce((acc, op) => acc + (op[metric] as number), 0);
      return sum / operators.length;
    };

    const operators: OperatorComparison[] = [
      { operatorId: 'op-1', efficiencyScore: 95, lossRate: 2, productionVelocity: 120 },
      { operatorId: 'op-2', efficiencyScore: 85, lossRate: 5, productionVelocity: 100 },
      { operatorId: 'op-3', efficiencyScore: 75, lossRate: 8, productionVelocity: 80 },
    ];

    it('should rank operators by efficiency correctly', () => {
      const ranked = rankOperatorsByEfficiency(operators);
      
      expect(ranked[0].operatorId).toBe('op-1');
      expect(ranked[1].operatorId).toBe('op-2');
      expect(ranked[2].operatorId).toBe('op-3');
    });

    it('should rank operators by loss rate (lower is better)', () => {
      const ranked = rankOperatorsByLossRate(operators);
      
      expect(ranked[0].operatorId).toBe('op-1');
      expect(ranked[0].lossRate).toBe(2);
    });

    it('should find top performer', () => {
      const top = findTopPerformer(operators);
      
      expect(top).not.toBeNull();
      expect(top?.operatorId).toBe('op-1');
      expect(top?.efficiencyScore).toBe(95);
    });

    it('should handle empty operator list for top performer', () => {
      expect(findTopPerformer([])).toBeNull();
    });

    it('should calculate team average correctly', () => {
      expect(calculateTeamAverage(operators, 'efficiencyScore')).toBeCloseTo(85, 1);
      expect(calculateTeamAverage(operators, 'lossRate')).toBe(5);
      expect(calculateTeamAverage(operators, 'productionVelocity')).toBe(100);
    });

    it('should handle empty list for team average', () => {
      expect(calculateTeamAverage([], 'efficiencyScore')).toBe(0);
    });
  });
});
