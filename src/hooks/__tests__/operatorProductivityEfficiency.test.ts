import { describe, it, expect } from 'vitest';

// ===== EFFICIENCY SCORE FORMULA =====
// Extracted from useOperatorProductivity: efficiencyScore = lossScore * 0.6 + timeScore * 0.4
describe('Efficiency Score Formula', () => {
  function calculateEfficiencyScore(lossRate: number, estimatedVsActualRatio: number): number {
    const lossScore = Math.max(0, 100 - lossRate * 5); // -5 points per 1% loss
    const timeScore = estimatedVsActualRatio > 0
      ? Math.max(0, Math.min(100, 100 - Math.abs(1 - estimatedVsActualRatio) * 50))
      : 100;
    return lossScore * 0.6 + timeScore * 0.4;
  }

  it('perfect score: 0% loss, ratio = 1.0', () => {
    expect(calculateEfficiencyScore(0, 1.0)).toBe(100);
  });

  it('loss rate reduces score by 5 per 1%', () => {
    // 2% loss: lossScore = 100 - 10 = 90, timeScore = 100
    // 90 * 0.6 + 100 * 0.4 = 54 + 40 = 94
    expect(calculateEfficiencyScore(2, 1.0)).toBe(94);
  });

  it('20% loss rate zeroes loss component', () => {
    // 20% loss: lossScore = max(0, 100 - 100) = 0
    // 0 * 0.6 + 100 * 0.4 = 40
    expect(calculateEfficiencyScore(20, 1.0)).toBe(40);
  });

  it('30% loss rate still clamps at 0', () => {
    // 30% loss: lossScore = max(0, 100 - 150) = 0
    expect(calculateEfficiencyScore(30, 1.0)).toBe(40);
  });

  it('slower than estimated reduces time score', () => {
    // ratio = 1.5 (50% slower): timeScore = max(0, 100 - 0.5 * 50) = 75
    // 100 * 0.6 + 75 * 0.4 = 60 + 30 = 90
    expect(calculateEfficiencyScore(0, 1.5)).toBe(90);
  });

  it('faster than estimated also reduces time score (overperformance penalty)', () => {
    // ratio = 0.5 (50% faster): timeScore = max(0, 100 - 0.5 * 50) = 75
    // Same as being 50% slower
    expect(calculateEfficiencyScore(0, 0.5)).toBe(90);
  });

  it('ratio = 3.0 (200% over): timeScore zeroes', () => {
    // |1 - 3| * 50 = 100 → timeScore = 0
    // 100 * 0.6 + 0 * 0.4 = 60
    expect(calculateEfficiencyScore(0, 3.0)).toBe(60);
  });

  it('ratio = 0 returns timeScore 100 (special case)', () => {
    // When ratio = 0, production time was 0 so default to 100
    expect(calculateEfficiencyScore(0, 0)).toBe(100);
  });

  it('combined poor performance', () => {
    // 10% loss: lossScore = 50, ratio = 2.0: timeScore = max(0, 100 - 50) = 50
    // 50 * 0.6 + 50 * 0.4 = 30 + 20 = 50
    expect(calculateEfficiencyScore(10, 2.0)).toBe(50);
  });

  it('GAP: loss weight (60%) is heavier than time weight (40%)', () => {
    // This means quality matters more than speed in the system
    const qualityProblem = calculateEfficiencyScore(10, 1.0); // good time, bad quality
    const timeProblem = calculateEfficiencyScore(0, 2.0); // good quality, bad time
    // qualityProblem: 50*0.6 + 100*0.4 = 70
    // timeProblem: 100*0.6 + 50*0.4 = 80
    expect(qualityProblem).toBeLessThan(timeProblem);
  });
});

// ===== PRODUCTION VELOCITY =====
describe('Production Velocity (pieces/hour)', () => {
  function calculateVelocity(piecesProduced: number, totalMinutes: number): number {
    return totalMinutes > 0 ? (piecesProduced / totalMinutes) * 60 : 0;
  }

  it('calculates correctly', () => {
    expect(calculateVelocity(120, 60)).toBe(120); // 120 pieces in 60 min = 120/hr
    expect(calculateVelocity(60, 120)).toBe(30); // 60 pieces in 120 min = 30/hr
  });

  it('handles zero time', () => {
    expect(calculateVelocity(100, 0)).toBe(0);
  });

  it('handles zero pieces', () => {
    expect(calculateVelocity(0, 60)).toBe(0);
  });

  it('handles fractional results', () => {
    const velocity = calculateVelocity(7, 10);
    expect(velocity).toBeCloseTo(42, 0);
  });
});

// ===== LOSS RATE CALCULATION =====
describe('Loss Rate Calculation', () => {
  function calculateLossRate(produced: number, lost: number): number {
    const totalAttempted = produced + lost;
    return totalAttempted > 0 ? (lost / totalAttempted) * 100 : 0;
  }

  it('standard loss rate', () => {
    expect(calculateLossRate(90, 10)).toBe(10);
    expect(calculateLossRate(100, 0)).toBe(0);
    expect(calculateLossRate(50, 50)).toBe(50);
  });

  it('all lost', () => {
    expect(calculateLossRate(0, 100)).toBe(100);
  });

  it('no production', () => {
    expect(calculateLossRate(0, 0)).toBe(0);
  });

  it('tiny loss rate', () => {
    const rate = calculateLossRate(99999, 1);
    expect(rate).toBeCloseTo(0.001, 3);
  });
});

// ===== ESTIMATED VS ACTUAL RATIO =====
describe('Estimated vs Actual Ratio', () => {
  function calculateRatio(actualMinutes: number, estimatedMinutes: number): number {
    return estimatedMinutes > 0 && actualMinutes > 0
      ? actualMinutes / estimatedMinutes
      : 1;
  }

  it('ratio = 1 when exactly on time', () => {
    expect(calculateRatio(60, 60)).toBe(1);
  });

  it('ratio < 1 when faster', () => {
    expect(calculateRatio(30, 60)).toBe(0.5);
  });

  it('ratio > 1 when slower', () => {
    expect(calculateRatio(120, 60)).toBe(2);
  });

  it('defaults to 1 when no estimated time', () => {
    expect(calculateRatio(60, 0)).toBe(1);
  });

  it('defaults to 1 when no actual time', () => {
    expect(calculateRatio(0, 60)).toBe(1);
  });

  it('defaults to 1 when both zero', () => {
    expect(calculateRatio(0, 0)).toBe(1);
  });
});

// ===== JOB DURATION VALIDATION =====
describe('Job Duration Validation (max 24h filter)', () => {
  function isValidDuration(startTime: string, endTime: string): boolean {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    if (isNaN(start) || isNaN(end)) return false;
    const durationMinutes = (end - start) / (1000 * 60);
    return durationMinutes > 0 && durationMinutes < 1440;
  }

  it('accepts normal durations', () => {
    expect(isValidDuration('2026-03-15T08:00:00Z', '2026-03-15T10:00:00Z')).toBe(true); // 2h
    expect(isValidDuration('2026-03-15T06:00:00Z', '2026-03-15T22:00:00Z')).toBe(true); // 16h
  });

  it('rejects > 24h (likely stuck/error)', () => {
    expect(isValidDuration('2026-03-15T08:00:00Z', '2026-03-17T08:00:00Z')).toBe(false);
  });

  it('rejects exactly 24h', () => {
    expect(isValidDuration('2026-03-15T08:00:00Z', '2026-03-16T08:00:00Z')).toBe(false);
  });

  it('rejects negative duration (end before start)', () => {
    expect(isValidDuration('2026-03-15T10:00:00Z', '2026-03-15T08:00:00Z')).toBe(false);
  });

  it('rejects zero duration', () => {
    expect(isValidDuration('2026-03-15T08:00:00Z', '2026-03-15T08:00:00Z')).toBe(false);
  });

  it('rejects invalid dates', () => {
    expect(isValidDuration('invalid', '2026-03-15T08:00:00Z')).toBe(false);
    expect(isValidDuration('2026-03-15T08:00:00Z', 'invalid')).toBe(false);
  });

  it('accepts 23h59m (just under limit)', () => {
    expect(isValidDuration('2026-03-15T00:00:00Z', '2026-03-15T23:59:00Z')).toBe(true);
  });
});

// ===== OVERALL STATS AGGREGATION =====
describe('Overall Stats Aggregation', () => {
  interface OperatorMetrics {
    isActive: boolean;
    efficiencyScore: number;
    totalJobsCompleted: number;
    totalPiecesProduced: number;
    lossRate: number;
  }

  function calculateOverallStats(operators: OperatorMetrics[]) {
    const active = operators.filter(o => o.isActive);
    const total = active.length;
    if (total === 0) {
      return { averageEfficiency: 0, totalJobsCompleted: 0, totalPiecesProduced: 0, averageLossRate: 0, topPerformer: null };
    }
    return {
      averageEfficiency: active.reduce((s, o) => s + o.efficiencyScore, 0) / total,
      totalJobsCompleted: active.reduce((s, o) => s + o.totalJobsCompleted, 0),
      totalPiecesProduced: active.reduce((s, o) => s + o.totalPiecesProduced, 0),
      averageLossRate: active.reduce((s, o) => s + o.lossRate, 0) / total,
      topPerformer: active.reduce((best, curr) => curr.efficiencyScore > (best?.efficiencyScore ?? 0) ? curr : best, null as OperatorMetrics | null),
    };
  }

  it('empty operators', () => {
    const stats = calculateOverallStats([]);
    expect(stats.averageEfficiency).toBe(0);
    expect(stats.topPerformer).toBeNull();
  });

  it('single operator', () => {
    const stats = calculateOverallStats([
      { isActive: true, efficiencyScore: 85, totalJobsCompleted: 10, totalPiecesProduced: 500, lossRate: 2 },
    ]);
    expect(stats.averageEfficiency).toBe(85);
    expect(stats.totalJobsCompleted).toBe(10);
    expect(stats.topPerformer?.efficiencyScore).toBe(85);
  });

  it('multiple operators - correct averages', () => {
    const stats = calculateOverallStats([
      { isActive: true, efficiencyScore: 90, totalJobsCompleted: 20, totalPiecesProduced: 1000, lossRate: 1 },
      { isActive: true, efficiencyScore: 70, totalJobsCompleted: 15, totalPiecesProduced: 800, lossRate: 5 },
    ]);
    expect(stats.averageEfficiency).toBe(80);
    expect(stats.totalJobsCompleted).toBe(35);
    expect(stats.totalPiecesProduced).toBe(1800);
    expect(stats.averageLossRate).toBe(3);
    expect(stats.topPerformer?.efficiencyScore).toBe(90);
  });

  it('ignores inactive operators', () => {
    const stats = calculateOverallStats([
      { isActive: true, efficiencyScore: 90, totalJobsCompleted: 10, totalPiecesProduced: 500, lossRate: 1 },
      { isActive: false, efficiencyScore: 50, totalJobsCompleted: 5, totalPiecesProduced: 200, lossRate: 10 },
    ]);
    expect(stats.averageEfficiency).toBe(90);
    expect(stats.totalJobsCompleted).toBe(10);
  });

  it('all inactive returns zero', () => {
    const stats = calculateOverallStats([
      { isActive: false, efficiencyScore: 90, totalJobsCompleted: 10, totalPiecesProduced: 500, lossRate: 1 },
    ]);
    expect(stats.averageEfficiency).toBe(0);
    expect(stats.topPerformer).toBeNull();
  });
});

// ===== OPERATOR SORTING BY EFFICIENCY =====
describe('Operator Sorting by Efficiency', () => {
  function sortByEfficiency<T extends { efficiencyScore: number }>(operators: T[]): T[] {
    return [...operators].sort((a, b) => b.efficiencyScore - a.efficiencyScore);
  }

  it('highest first', () => {
    const sorted = sortByEfficiency([
      { efficiencyScore: 70 },
      { efficiencyScore: 95 },
      { efficiencyScore: 85 },
    ]);
    expect(sorted[0].efficiencyScore).toBe(95);
    expect(sorted[1].efficiencyScore).toBe(85);
    expect(sorted[2].efficiencyScore).toBe(70);
  });

  it('handles ties', () => {
    const sorted = sortByEfficiency([
      { efficiencyScore: 80 },
      { efficiencyScore: 80 },
    ]);
    expect(sorted).toHaveLength(2);
  });

  it('handles single operator', () => {
    const sorted = sortByEfficiency([{ efficiencyScore: 75 }]);
    expect(sorted[0].efficiencyScore).toBe(75);
  });
});

// ===== SCHEDULING CONFLICT SEVERITY =====
describe('Scheduling Conflict Severity Classification', () => {
  function getConflictSeverity(statuses: string[]): 'warning' | 'error' {
    return statuses.some(s => s === 'production') ? 'error' : 'warning';
  }

  it('error when production job involved', () => {
    expect(getConflictSeverity(['scheduled', 'production'])).toBe('error');
    expect(getConflictSeverity(['production', 'production'])).toBe('error');
  });

  it('warning for non-production conflicts', () => {
    expect(getConflictSeverity(['scheduled', 'scheduled'])).toBe('warning');
    expect(getConflictSeverity(['ready', 'scheduled'])).toBe('warning');
  });
});

// ===== CONFLICT SORTING =====
describe('Conflict Sorting (severity then date)', () => {
  interface MockConflict { severity: 'warning' | 'error'; date: Date }

  function sortConflicts(conflicts: MockConflict[]): MockConflict[] {
    return [...conflicts].sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === 'error' ? -1 : 1;
      return a.date.getTime() - b.date.getTime();
    });
  }

  it('errors before warnings', () => {
    const sorted = sortConflicts([
      { severity: 'warning', date: new Date('2026-03-15') },
      { severity: 'error', date: new Date('2026-03-20') },
    ]);
    expect(sorted[0].severity).toBe('error');
  });

  it('same severity: earlier date first', () => {
    const sorted = sortConflicts([
      { severity: 'error', date: new Date('2026-03-20') },
      { severity: 'error', date: new Date('2026-03-15') },
    ]);
    expect(sorted[0].date.getDate()).toBe(15);
  });
});

// ===== STUCK JOBS DETECTION =====
describe('Stuck Jobs Detection Thresholds', () => {
  const WARNING_HOURS = 8;
  const CRITICAL_HOURS = 24;

  function classifyStuckJob(hoursInProduction: number): 'critical' | 'warning' | null {
    if (hoursInProduction >= CRITICAL_HOURS) return 'critical';
    if (hoursInProduction >= WARNING_HOURS) return 'warning';
    return null;
  }

  it('critical at 24h+', () => {
    expect(classifyStuckJob(24)).toBe('critical');
    expect(classifyStuckJob(48)).toBe('critical');
  });

  it('warning at 8-23h', () => {
    expect(classifyStuckJob(8)).toBe('warning');
    expect(classifyStuckJob(23.9)).toBe('warning');
  });

  it('no alert under 8h', () => {
    expect(classifyStuckJob(7.9)).toBeNull();
    expect(classifyStuckJob(0)).toBeNull();
  });

  it('GAP: negative hours ignored (future start times)', () => {
    // Production code checks elapsedMs > 0
    expect(classifyStuckJob(-1)).toBeNull();
  });
});

// ===== PRODUCED QUANTITY FALLBACK =====
describe('Produced Quantity Fallback Logic', () => {
  function getProducedPieces(produced_quantity: number | null, quantity: number, lost_pieces: number | null): number {
    return produced_quantity ?? (quantity - (lost_pieces || 0));
  }

  it('uses produced_quantity when available', () => {
    expect(getProducedPieces(80, 100, 5)).toBe(80);
  });

  it('falls back to quantity - lost_pieces', () => {
    expect(getProducedPieces(null, 100, 10)).toBe(90);
  });

  it('falls back to quantity when no lost_pieces', () => {
    expect(getProducedPieces(null, 100, null)).toBe(100);
  });

  it('handles zero produced_quantity', () => {
    expect(getProducedPieces(0, 100, 5)).toBe(0);
  });
});
