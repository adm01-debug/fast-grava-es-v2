import { describe, it, expect } from 'vitest';

// ===== JOB VALIDATION =====
describe('Job Validation (isValidJob)', () => {
  function isValidJob(job: { id: string; quantity: number; estimated_duration: number; status: string }): boolean {
    return (
      typeof job.id === 'string' && job.id.length > 0 &&
      typeof job.quantity === 'number' && job.quantity >= 0 &&
      typeof job.estimated_duration === 'number' && job.estimated_duration >= 0 &&
      typeof job.status === 'string'
    );
  }

  it('accepts valid job', () => {
    expect(isValidJob({ id: 'abc', quantity: 100, estimated_duration: 60, status: 'queue' })).toBe(true);
  });

  it('rejects empty id', () => {
    expect(isValidJob({ id: '', quantity: 100, estimated_duration: 60, status: 'queue' })).toBe(false);
  });

  it('rejects negative quantity', () => {
    expect(isValidJob({ id: 'abc', quantity: -1, estimated_duration: 60, status: 'queue' })).toBe(false);
  });

  it('rejects negative duration', () => {
    expect(isValidJob({ id: 'abc', quantity: 100, estimated_duration: -5, status: 'queue' })).toBe(false);
  });

  it('accepts zero quantity', () => {
    expect(isValidJob({ id: 'abc', quantity: 0, estimated_duration: 0, status: 'queue' })).toBe(true);
  });
});

// ===== MACHINE VALIDATION =====
describe('Machine Validation (isValidMachine)', () => {
  function isValidMachine(machine: { id: string; name: string; technique_id: string }): boolean {
    return (
      typeof machine.id === 'string' && machine.id.length > 0 &&
      typeof machine.name === 'string' &&
      typeof machine.technique_id === 'string'
    );
  }

  it('accepts valid machine', () => {
    expect(isValidMachine({ id: 'm1', name: 'Silk-1', technique_id: 'silk' })).toBe(true);
  });

  it('rejects empty id', () => {
    expect(isValidMachine({ id: '', name: 'Silk-1', technique_id: 'silk' })).toBe(false);
  });
});

// ===== TECHNIQUE VALIDATION =====
describe('Technique Validation (isValidTechnique)', () => {
  function isValidTechnique(technique: { id: string; name: string; color: string }): boolean {
    return (
      typeof technique.id === 'string' && technique.id.length > 0 &&
      typeof technique.name === 'string' &&
      typeof technique.color === 'string'
    );
  }

  it('accepts valid technique', () => {
    expect(isValidTechnique({ id: 'silk', name: 'Serigrafia', color: '#FF0000' })).toBe(true);
  });

  it('rejects empty id', () => {
    expect(isValidTechnique({ id: '', name: 'Serigrafia', color: '#FF0000' })).toBe(false);
  });
});

// ===== SANITIZE NUMBER =====
describe('sanitizeNumber', () => {
  function sanitizeNumber(value: any, fallback = 0): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
    return Math.max(0, value);
  }

  it('returns number as-is when valid', () => {
    expect(sanitizeNumber(42)).toBe(42);
    expect(sanitizeNumber(0)).toBe(0);
  });

  it('clamps negative to 0', () => {
    expect(sanitizeNumber(-5)).toBe(0);
  });

  it('returns fallback for NaN', () => {
    expect(sanitizeNumber(NaN)).toBe(0);
    expect(sanitizeNumber(NaN, 10)).toBe(10);
  });

  it('returns fallback for Infinity', () => {
    expect(sanitizeNumber(Infinity)).toBe(0);
    expect(sanitizeNumber(-Infinity)).toBe(0);
  });

  it('returns fallback for non-number', () => {
    expect(sanitizeNumber('hello')).toBe(0);
    expect(sanitizeNumber(null)).toBe(0);
    expect(sanitizeNumber(undefined)).toBe(0);
  });
});

// ===== KPI LOSS RATE CALCULATION =====
describe('KPI Loss Rate (finished jobs only)', () => {
  interface MockJob { status: string; quantity: number; lost_pieces: number | null }

  function calculateKPILossRate(jobs: MockJob[]): number {
    const finished = jobs.filter(j => j.status === 'finished');
    const completedPieces = finished.reduce((s, j) => s + Math.max(0, j.quantity), 0);
    const lostPieces = finished.reduce((s, j) => s + Math.max(0, j.lost_pieces || 0), 0);
    const totalAttempted = completedPieces + lostPieces;
    return totalAttempted > 0 ? (lostPieces / totalAttempted) * 100 : 0;
  }

  it('calculates from finished jobs only', () => {
    const jobs: MockJob[] = [
      { status: 'finished', quantity: 90, lost_pieces: 10 },
      { status: 'production', quantity: 100, lost_pieces: 50 }, // ignored
    ];
    expect(calculateKPILossRate(jobs)).toBe(10);
  });

  it('zero when no finished jobs', () => {
    expect(calculateKPILossRate([{ status: 'queue', quantity: 100, lost_pieces: 5 }])).toBe(0);
  });

  it('zero when no losses', () => {
    expect(calculateKPILossRate([{ status: 'finished', quantity: 100, lost_pieces: 0 }])).toBe(0);
  });

  it('handles null lost_pieces', () => {
    expect(calculateKPILossRate([{ status: 'finished', quantity: 100, lost_pieces: null }])).toBe(0);
  });

  it('GAP: loss rate only counts finished — in-progress losses invisible until completion', () => {
    const jobs: MockJob[] = [
      { status: 'production', quantity: 100, lost_pieces: 90 }, // 90% loss, invisible!
    ];
    expect(calculateKPILossRate(jobs)).toBe(0); // reported as 0%
  });
});

// ===== OCCUPANCY RATE CALCULATION =====
describe('Occupancy Rate by Technique', () => {
  interface MockJob { technique_id: string; status: string; machine_id: string | null }
  interface MockMachine { id: string; technique_id: string }

  function calculateOccupancy(jobs: MockJob[], machines: MockMachine[], techniqueId: string): number {
    const techMachines = machines.filter(m => m.technique_id === techniqueId);
    if (techMachines.length === 0) return 0;
    const busyMachines = new Set(
      jobs
        .filter(j => j.technique_id === techniqueId && ['production', 'scheduled'].includes(j.status))
        .map(j => j.machine_id)
        .filter(Boolean)
    ).size;
    return (busyMachines / techMachines.length) * 100;
  }

  it('100% when all machines busy', () => {
    const machines = [{ id: 'm1', technique_id: 'silk' }, { id: 'm2', technique_id: 'silk' }];
    const jobs = [
      { technique_id: 'silk', status: 'production', machine_id: 'm1' },
      { technique_id: 'silk', status: 'scheduled', machine_id: 'm2' },
    ];
    expect(calculateOccupancy(jobs, machines, 'silk')).toBe(100);
  });

  it('50% when half busy', () => {
    const machines = [{ id: 'm1', technique_id: 'silk' }, { id: 'm2', technique_id: 'silk' }];
    const jobs = [
      { technique_id: 'silk', status: 'production', machine_id: 'm1' },
    ];
    expect(calculateOccupancy(jobs, machines, 'silk')).toBe(50);
  });

  it('0% when no active jobs', () => {
    const machines = [{ id: 'm1', technique_id: 'silk' }];
    const jobs = [{ technique_id: 'silk', status: 'queue', machine_id: null }];
    expect(calculateOccupancy(jobs, machines, 'silk')).toBe(0);
  });

  it('0% when no machines', () => {
    expect(calculateOccupancy([], [], 'silk')).toBe(0);
  });

  it('ignores jobs without machine_id', () => {
    const machines = [{ id: 'm1', technique_id: 'silk' }];
    const jobs = [{ technique_id: 'silk', status: 'production', machine_id: null }];
    expect(calculateOccupancy(jobs, machines, 'silk')).toBe(0);
  });

  it('multiple jobs on same machine counted once', () => {
    const machines = [{ id: 'm1', technique_id: 'silk' }];
    const jobs = [
      { technique_id: 'silk', status: 'production', machine_id: 'm1' },
      { technique_id: 'silk', status: 'scheduled', machine_id: 'm1' },
    ];
    expect(calculateOccupancy(jobs, machines, 'silk')).toBe(100);
  });
});

// ===== ESTIMATED TIME CALCULATION =====
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
      quantity, techniqueSetupTime,
      baseTimePerPiece = 30, colorCount = 1,
      complexityFactor = 1, sizeMultiplier = 1,
    } = params;
    const productionTimeSeconds = quantity * baseTimePerPiece * complexityFactor * sizeMultiplier;
    const colorAdjustment = 1 + (colorCount - 1) * 0.15;
    const totalMinutes = techniqueSetupTime + (productionTimeSeconds * colorAdjustment / 60);
    return Math.ceil(totalMinutes);
  }

  it('basic calculation', () => {
    // 100 pieces * 30s = 3000s = 50min + 10min setup = 60min
    expect(calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10 })).toBe(60);
  });

  it('multi-color adds 15% per extra color', () => {
    // 100 pieces * 30s * 1.15 (2 colors) = 3450s = 57.5min + 10 = 67.5 → 68
    expect(calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10, colorCount: 2 })).toBe(68);
  });

  it('complexity multiplier', () => {
    // 100 * 30 * 2 = 6000s = 100min + 10 = 110
    expect(calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10, complexityFactor: 2 })).toBe(110);
  });

  it('zero quantity = setup time only', () => {
    expect(calculateEstimatedTime({ quantity: 0, techniqueSetupTime: 15 })).toBe(15);
  });

  it('large quantity', () => {
    // 10000 * 30 = 300000s = 5000min + 20 = 5020
    expect(calculateEstimatedTime({ quantity: 10000, techniqueSetupTime: 20 })).toBe(5020);
  });

  it('size multiplier', () => {
    // 100 * 30 * 1 * 2 = 6000s = 100min + 10 = 110
    expect(calculateEstimatedTime({ quantity: 100, techniqueSetupTime: 10, sizeMultiplier: 2 })).toBe(110);
  });

  it('all factors combined', () => {
    // 50 * 30 * 2 * 1.5 = 4500s * 1.15 (2 colors) = 5175s = 86.25min + 15 = 101.25 → 102
    expect(calculateEstimatedTime({
      quantity: 50, techniqueSetupTime: 15,
      complexityFactor: 2, sizeMultiplier: 1.5, colorCount: 2
    })).toBe(102);
  });
});

// ===== FORMAT DURATION =====
describe('formatDuration', () => {
  function formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }

  it('under 60 minutes', () => {
    expect(formatDuration(30)).toBe('30min');
    expect(formatDuration(0)).toBe('0min');
    expect(formatDuration(59)).toBe('59min');
  });

  it('exact hours', () => {
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(120)).toBe('2h');
  });

  it('hours + minutes', () => {
    expect(formatDuration(90)).toBe('1h 30min');
    expect(formatDuration(125)).toBe('2h 5min');
  });
});

// ===== GOAL ALERT RISK CLASSIFICATION =====
describe('Goal Alert Risk Classification', () => {
  interface GoalAlertInput {
    progressPercentage: number;
    daysRemaining: number;
    isAchieved: boolean;
  }

  const CRITICAL_THRESHOLD = 50;
  const WARNING_THRESHOLD = 75;

  function classifyRisk(input: GoalAlertInput): 'critical' | 'warning' | 'on-track' | null {
    if (input.isAchieved) return null;
    if (input.progressPercentage < CRITICAL_THRESHOLD && input.daysRemaining <= 7) return 'critical';
    if (input.progressPercentage < WARNING_THRESHOLD && input.daysRemaining <= 14) return 'warning';
    if (input.progressPercentage < 50) return 'warning';
    return 'on-track';
  }

  it('critical: low progress + few days', () => {
    expect(classifyRisk({ progressPercentage: 30, daysRemaining: 5, isAchieved: false })).toBe('critical');
    expect(classifyRisk({ progressPercentage: 49, daysRemaining: 7, isAchieved: false })).toBe('critical');
  });

  it('warning: moderate progress + some days', () => {
    expect(classifyRisk({ progressPercentage: 60, daysRemaining: 10, isAchieved: false })).toBe('warning');
    expect(classifyRisk({ progressPercentage: 74, daysRemaining: 14, isAchieved: false })).toBe('warning');
  });

  it('warning: below 50% regardless of time', () => {
    expect(classifyRisk({ progressPercentage: 40, daysRemaining: 30, isAchieved: false })).toBe('warning');
  });

  it('on-track: good progress', () => {
    expect(classifyRisk({ progressPercentage: 80, daysRemaining: 20, isAchieved: false })).toBe('on-track');
    expect(classifyRisk({ progressPercentage: 75, daysRemaining: 15, isAchieved: false })).toBe('on-track');
  });

  it('null for achieved goals', () => {
    expect(classifyRisk({ progressPercentage: 100, daysRemaining: 5, isAchieved: true })).toBeNull();
    expect(classifyRisk({ progressPercentage: 30, daysRemaining: 1, isAchieved: true })).toBeNull();
  });

  it('boundary: exactly 50% progress + 7 days', () => {
    // 50 is NOT < 50, so not critical. But 50 < 75 and 7 <= 14, so warning
    expect(classifyRisk({ progressPercentage: 50, daysRemaining: 7, isAchieved: false })).toBe('warning');
  });

  it('boundary: exactly 75% + 14 days', () => {
    // 75 is NOT < 75, so not warning by second rule. 75 >= 50, so on-track
    expect(classifyRisk({ progressPercentage: 75, daysRemaining: 14, isAchieved: false })).toBe('on-track');
  });

  it('GAP: 0 days remaining but high progress is still critical', () => {
    // 49% with 0 days → critical (even though close)
    expect(classifyRisk({ progressPercentage: 49, daysRemaining: 0, isAchieved: false })).toBe('critical');
  });
});

// ===== GOAL ALERT SORTING =====
describe('Goal Alert Sorting', () => {
  interface MockAlert { riskLevel: 'critical' | 'warning'; progressPercentage: number }

  function sortAlerts(alerts: MockAlert[]): MockAlert[] {
    return [...alerts].sort((a, b) => {
      if (a.riskLevel === 'critical' && b.riskLevel !== 'critical') return -1;
      if (a.riskLevel !== 'critical' && b.riskLevel === 'critical') return 1;
      return a.progressPercentage - b.progressPercentage;
    });
  }

  it('critical first', () => {
    const sorted = sortAlerts([
      { riskLevel: 'warning', progressPercentage: 40 },
      { riskLevel: 'critical', progressPercentage: 30 },
    ]);
    expect(sorted[0].riskLevel).toBe('critical');
  });

  it('same risk: lower progress first', () => {
    const sorted = sortAlerts([
      { riskLevel: 'warning', progressPercentage: 60 },
      { riskLevel: 'warning', progressPercentage: 30 },
    ]);
    expect(sorted[0].progressPercentage).toBe(30);
  });
});

// ===== DAYS REMAINING CALCULATION =====
describe('Days Remaining Calculation', () => {
  function calculateDaysRemaining(endDate: string, now: Date): number {
    const end = new Date(endDate);
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  it('future date', () => {
    const now = new Date('2026-03-15T12:00:00Z');
    expect(calculateDaysRemaining('2026-03-22', now)).toBe(7);
  });

  it('today returns 0 or 1 depending on time', () => {
    const now = new Date('2026-03-15T23:00:00Z');
    const days = calculateDaysRemaining('2026-03-15', now);
    expect(days).toBe(0); // end of day past midnight in UTC
  });

  it('past date returns 0', () => {
    const now = new Date('2026-03-15T12:00:00Z');
    expect(calculateDaysRemaining('2026-03-10', now)).toBe(0);
  });
});

// ===== PRODUCTIVITY BY MACHINE AGGREGATION =====
describe('Productivity by Machine Aggregation', () => {
  interface MockJob { machine_id: string | null; status: string; quantity: number; lost_pieces: number | null; estimated_duration: number }
  interface MockMachine { id: string; name: string; technique_id: string }

  function aggregateByMachine(machines: MockMachine[], jobs: MockJob[]) {
    return machines.map(machine => {
      const machineJobs = jobs.filter(j => j.machine_id === machine.id);
      const totalPcs = machineJobs.reduce((s, j) => s + Math.max(0, j.quantity), 0);
      const lostPcs = machineJobs.reduce((s, j) => s + Math.max(0, j.lost_pieces || 0), 0);
      const totalAttempted = totalPcs + lostPcs;
      return {
        machineId: machine.id,
        machineName: machine.name,
        jobCount: machineJobs.length,
        completedJobs: machineJobs.filter(j => j.status === 'finished').length,
        totalPieces: totalPcs,
        lostPieces: lostPcs,
        lossRate: totalAttempted > 0 ? (lostPcs / totalAttempted) * 100 : 0,
        avgDuration: machineJobs.length > 0
          ? machineJobs.reduce((s, j) => s + Math.max(0, j.estimated_duration), 0) / machineJobs.length
          : 0,
      };
    }).filter(m => m.jobCount > 0);
  }

  it('aggregates correctly', () => {
    const machines: MockMachine[] = [{ id: 'm1', name: 'Silk-1', technique_id: 'silk' }];
    const jobs: MockJob[] = [
      { machine_id: 'm1', status: 'finished', quantity: 100, lost_pieces: 5, estimated_duration: 60 },
      { machine_id: 'm1', status: 'production', quantity: 200, lost_pieces: null, estimated_duration: 120 },
    ];
    const result = aggregateByMachine(machines, jobs);
    expect(result).toHaveLength(1);
    expect(result[0].jobCount).toBe(2);
    expect(result[0].completedJobs).toBe(1);
    expect(result[0].totalPieces).toBe(300);
    expect(result[0].lostPieces).toBe(5);
    expect(result[0].lossRate).toBeCloseTo(1.64, 1);
    expect(result[0].avgDuration).toBe(90);
  });

  it('excludes machines with no jobs', () => {
    const machines: MockMachine[] = [
      { id: 'm1', name: 'Silk-1', technique_id: 'silk' },
      { id: 'm2', name: 'Silk-2', technique_id: 'silk' },
    ];
    const jobs: MockJob[] = [
      { machine_id: 'm1', status: 'queue', quantity: 50, lost_pieces: null, estimated_duration: 30 },
    ];
    const result = aggregateByMachine(machines, jobs);
    expect(result).toHaveLength(1);
    expect(result[0].machineId).toBe('m1');
  });
});

// ===== SAVED FILTER OPERATIONS =====
describe('Saved Filter Logic', () => {
  interface SavedFilter {
    id: string;
    name: string;
    isDefault: boolean;
    filters: Record<string, string | string[]>;
  }

  function setAsDefault(filters: SavedFilter[], id: string): SavedFilter[] {
    return filters.map(f => ({ ...f, isDefault: f.id === id }));
  }

  it('sets one as default, clears others', () => {
    const filters: SavedFilter[] = [
      { id: '1', name: 'A', isDefault: true, filters: {} },
      { id: '2', name: 'B', isDefault: false, filters: {} },
    ];
    const result = setAsDefault(filters, '2');
    expect(result[0].isDefault).toBe(false);
    expect(result[1].isDefault).toBe(true);
  });

  it('handles non-existent id (no default set)', () => {
    const filters: SavedFilter[] = [
      { id: '1', name: 'A', isDefault: true, filters: {} },
    ];
    const result = setAsDefault(filters, 'nonexistent');
    expect(result[0].isDefault).toBe(false); // cleared but nothing set
  });
});
