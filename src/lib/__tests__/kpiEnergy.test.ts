import { describe, it, expect } from 'vitest';

// ===== KPI: ESTIMATED TIME CALCULATION =====
describe('calculateEstimatedTime', () => {
  function calculateEstimatedTime(params: {
    quantity: number;
    techniqueSetupTime: number;
    baseTimePerPiece?: number;
    colorCount?: number;
    complexityFactor?: number;
    sizeMultiplier?: number;
  }): number {
    const {
      quantity,
      techniqueSetupTime,
      baseTimePerPiece = 30,
      colorCount = 1,
      complexityFactor = 1,
      sizeMultiplier = 1,
    } = params;

    const productionTimeSeconds = quantity * baseTimePerPiece * complexityFactor * sizeMultiplier;
    const colorAdjustment = 1 + (colorCount - 1) * 0.15;
    const totalMinutes = techniqueSetupTime + (productionTimeSeconds * colorAdjustment / 60);
    return Math.ceil(totalMinutes);
  }

  it('basic calculation with defaults', () => {
    // 100 pieces × 30s = 3000s = 50min + 10min setup = 60min
    expect(calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10 })).toBe(60);
  });

  it('zero quantity returns just setup time', () => {
    expect(calculateEstimatedTime({ quantity: 0, techniqueSetupTime: 15 })).toBe(15);
  });

  it('color count increases time by 15% per extra color', () => {
    const single = calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10, colorCount: 1 });
    const double = calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10, colorCount: 2 });
    const triple = calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10, colorCount: 3 });
    expect(double).toBeGreaterThan(single);
    expect(triple).toBeGreaterThan(double);
    // 2 colors: 1.15x, 3 colors: 1.30x
  });

  it('complexity factor doubles time for complex jobs', () => {
    const simple = calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10, complexityFactor: 1 });
    const complex = calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10, complexityFactor: 2 });
    // Complex should be roughly double production time (not setup)
    expect(complex).toBeGreaterThan(simple);
    expect(complex - 10).toBeCloseTo((simple - 10) * 2, -1);
  });

  it('size multiplier scales time', () => {
    const small = calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10, sizeMultiplier: 1 });
    const large = calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10, sizeMultiplier: 2 });
    expect(large - 10).toBeCloseTo((small - 10) * 2, -1);
  });

  it('always rounds up (ceil)', () => {
    const result = calculateEstimatedTime({ quantity: 1, techniqueSetupTime: 0, baseTimePerPiece: 1 });
    // 1 piece × 1s / 60 = 0.0167 min → ceil = 1
    expect(result).toBe(1);
  });

  it('handles large quantities', () => {
    const result = calculateEstimatedTime({ quantity: 10000, techniqueSetupTime: 30 });
    // 10000 × 30s = 300000s = 5000min + 30min setup = 5030min
    expect(result).toBe(5030);
  });

  it('combined factors multiply correctly', () => {
    const result = calculateEstimatedTime({
      quantity: 200,
      techniqueSetupTime: 15,
      baseTimePerPiece: 45,
      colorCount: 3,
      complexityFactor: 2,
      sizeMultiplier: 1.5,
    });
    // 200 × 45 × 2 × 1.5 = 27000s × 1.30 = 35100s = 585min + 15 = 600
    expect(result).toBe(600);
  });
});

// ===== KPI: FORMAT DURATION =====
describe('formatDuration', () => {
  function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }

  it('formats minutes only', () => {
    expect(formatDuration(30)).toBe('30min');
    expect(formatDuration(1)).toBe('1min');
    expect(formatDuration(59)).toBe('59min');
  });

  it('formats hours only', () => {
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(480)).toBe('8h');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30min');
    expect(formatDuration(150)).toBe('2h 30min');
    expect(formatDuration(661)).toBe('11h 1min');
  });

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0min');
  });
});

// ===== KPI: OEE CLASSIFICATION =====
describe('OEE Classification', () => {
  function classifyOEE(oee: number): string {
    if (oee >= 85) return 'world-class';
    if (oee >= 75) return 'excellent';
    if (oee >= 65) return 'good';
    if (oee >= 50) return 'acceptable';
    return 'poor';
  }

  it('world-class at 85%+', () => {
    expect(classifyOEE(85)).toBe('world-class');
    expect(classifyOEE(100)).toBe('world-class');
    expect(classifyOEE(92.5)).toBe('world-class');
  });

  it('excellent at 75-84%', () => {
    expect(classifyOEE(75)).toBe('excellent');
    expect(classifyOEE(84.9)).toBe('excellent');
  });

  it('good at 65-74%', () => {
    expect(classifyOEE(65)).toBe('good');
    expect(classifyOEE(74.9)).toBe('good');
  });

  it('acceptable at 50-64%', () => {
    expect(classifyOEE(50)).toBe('acceptable');
    expect(classifyOEE(64.9)).toBe('acceptable');
  });

  it('poor below 50%', () => {
    expect(classifyOEE(49.9)).toBe('poor');
    expect(classifyOEE(0)).toBe('poor');
    expect(classifyOEE(25)).toBe('poor');
  });
});

// ===== KPI: LOSS RATE =====
describe('Loss Rate Calculation', () => {
  function calculateLossRate(completedPieces: number, lostPieces: number): number {
    const totalAttempted = completedPieces + lostPieces;
    return totalAttempted > 0 ? (lostPieces / totalAttempted) * 100 : 0;
  }

  it('0% when no losses', () => {
    expect(calculateLossRate(1000, 0)).toBe(0);
  });

  it('100% when all lost', () => {
    expect(calculateLossRate(0, 100)).toBe(100);
  });

  it('calculates 10% rate', () => {
    expect(calculateLossRate(90, 10)).toBe(10);
  });

  it('0% when no production', () => {
    expect(calculateLossRate(0, 0)).toBe(0);
  });

  it('handles fractional rates', () => {
    const rate = calculateLossRate(999, 1);
    expect(rate).toBeCloseTo(0.1, 1);
  });
});

// ===== ENERGY: COST TREND CALCULATION =====
describe('Energy Cost Trend', () => {
  function calculateCostTrend(currentCost: number, previousCost: number): number {
    return previousCost > 0 ? ((currentCost - previousCost) / previousCost) * 100 : 0;
  }

  it('0% when no change', () => {
    expect(calculateCostTrend(1000, 1000)).toBe(0);
  });

  it('positive trend when cost increased', () => {
    expect(calculateCostTrend(1200, 1000)).toBe(20);
  });

  it('negative trend when cost decreased', () => {
    expect(calculateCostTrend(800, 1000)).toBe(-20);
  });

  it('0% when no previous data', () => {
    expect(calculateCostTrend(1000, 0)).toBe(0);
  });

  it('100% when cost doubled', () => {
    expect(calculateCostTrend(2000, 1000)).toBe(100);
  });

  it('-50% when cost halved', () => {
    expect(calculateCostTrend(500, 1000)).toBe(-50);
  });

  it('handles very large changes', () => {
    expect(calculateCostTrend(10000, 100)).toBe(9900);
  });
});

// ===== ENERGY: DAILY CONSUMPTION AVERAGE =====
describe('Energy Daily Average', () => {
  function calculateDailyAverage(totalKwh: number, startDate: Date, endDate: Date): number {
    const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    return totalKwh / days;
  }

  it('correct average for 30 days', () => {
    const start = new Date('2026-03-01');
    const end = new Date('2026-03-31');
    expect(calculateDailyAverage(3000, start, end)).toBeCloseTo(100, 0);
  });

  it('single day returns total', () => {
    const start = new Date('2026-03-15');
    const end = new Date('2026-03-15');
    expect(calculateDailyAverage(500, start, end)).toBe(500);
  });

  it('handles zero consumption', () => {
    const start = new Date('2026-03-01');
    const end = new Date('2026-03-31');
    expect(calculateDailyAverage(0, start, end)).toBe(0);
  });
});

// ===== ENERGY: POWER FACTOR ANALYSIS =====
describe('Power Factor Analysis', () => {
  function analyzePowerFactor(pf: number): { status: string; recommendation: string | null } {
    if (pf >= 0.92) return { status: 'excellent', recommendation: null };
    if (pf >= 0.85) return { status: 'good', recommendation: null };
    if (pf >= 0.75) return { status: 'warning', recommendation: 'Considere instalar capacitores' };
    return { status: 'critical', recommendation: 'Instalar banco de capacitores urgentemente' };
  }

  it('excellent above 0.92', () => {
    expect(analyzePowerFactor(0.95).status).toBe('excellent');
    expect(analyzePowerFactor(0.95).recommendation).toBeNull();
  });

  it('good between 0.85-0.92', () => {
    expect(analyzePowerFactor(0.88).status).toBe('good');
  });

  it('warning between 0.75-0.85', () => {
    const result = analyzePowerFactor(0.78);
    expect(result.status).toBe('warning');
    expect(result.recommendation).not.toBeNull();
  });

  it('critical below 0.75', () => {
    const result = analyzePowerFactor(0.60);
    expect(result.status).toBe('critical');
    expect(result.recommendation).toContain('urgentemente');
  });
});

// ===== OCCUPANCY RATE =====
describe('Machine Occupancy Rate', () => {
  const DAILY_CAPACITY = 11 * 60; // 660 minutes

  function calculateOccupancy(scheduledMinutes: number, machineCount: number = 1): number {
    const total = machineCount * DAILY_CAPACITY;
    return Math.min(100, Math.max(0, (scheduledMinutes / total) * 100));
  }

  function getOccupancyStatus(rate: number): string {
    if (rate >= 90) return 'critical';
    if (rate >= 75) return 'warning';
    if (rate >= 50) return 'normal';
    return 'idle';
  }

  it('0% for no jobs', () => expect(calculateOccupancy(0)).toBe(0));
  it('100% for full capacity', () => expect(calculateOccupancy(660)).toBe(100));
  it('50% for half capacity', () => expect(calculateOccupancy(330)).toBeCloseTo(50));
  it('clamped at 100%', () => expect(calculateOccupancy(1000)).toBe(100));
  it('scales with machines', () => expect(calculateOccupancy(660, 2)).toBe(50));

  it('status critical at 90%+', () => expect(getOccupancyStatus(95)).toBe('critical'));
  it('status warning at 75-89%', () => expect(getOccupancyStatus(80)).toBe('warning'));
  it('status normal at 50-74%', () => expect(getOccupancyStatus(60)).toBe('normal'));
  it('status idle below 50%', () => expect(getOccupancyStatus(30)).toBe('idle'));
});

// ===== KPI: PRODUCTION EFFICIENCY =====
describe('Production Efficiency Calculation', () => {
  function calculateEfficiency(produced: number, target: number): number {
    if (target <= 0) return 0;
    return Math.min(100, (produced / target) * 100);
  }

  it('100% when target met', () => expect(calculateEfficiency(100, 100)).toBe(100));
  it('50% when half produced', () => expect(calculateEfficiency(50, 100)).toBe(50));
  it('capped at 100% for over-production', () => expect(calculateEfficiency(150, 100)).toBe(100));
  it('0% when nothing produced', () => expect(calculateEfficiency(0, 100)).toBe(0));
  it('0% when no target', () => expect(calculateEfficiency(100, 0)).toBe(0));
  it('handles negative target', () => expect(calculateEfficiency(100, -10)).toBe(0));
});

// ===== KPI: AVERAGE CYCLE TIME =====
describe('Average Cycle Time', () => {
  function calculateAvgCycleTime(jobs: Array<{ startTime: string; endTime: string }>): number {
    if (jobs.length === 0) return 0;
    const totalMinutes = jobs.reduce((sum, j) => {
      const diff = (new Date(j.endTime).getTime() - new Date(j.startTime).getTime()) / (1000 * 60);
      return sum + Math.max(0, diff);
    }, 0);
    return totalMinutes / jobs.length;
  }

  it('calculates average of multiple jobs', () => {
    const jobs = [
      { startTime: '2026-03-15T08:00:00Z', endTime: '2026-03-15T09:00:00Z' }, // 60min
      { startTime: '2026-03-15T10:00:00Z', endTime: '2026-03-15T12:00:00Z' }, // 120min
    ];
    expect(calculateAvgCycleTime(jobs)).toBe(90); // (60+120)/2
  });

  it('returns 0 for empty list', () => {
    expect(calculateAvgCycleTime([])).toBe(0);
  });

  it('ignores negative durations', () => {
    const jobs = [
      { startTime: '2026-03-15T10:00:00Z', endTime: '2026-03-15T08:00:00Z' }, // negative → 0
      { startTime: '2026-03-15T08:00:00Z', endTime: '2026-03-15T10:00:00Z' }, // 120min
    ];
    expect(calculateAvgCycleTime(jobs)).toBe(60); // (0+120)/2
  });
});
