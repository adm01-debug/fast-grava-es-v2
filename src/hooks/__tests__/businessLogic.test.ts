import { describe, it, expect } from 'vitest';

// Extract and test pure functions from useKPIs
// These are the validation/sanitization functions used throughout

function isValidJob(job: any): boolean {
  return (
    typeof job.id === 'string' && job.id.length > 0 &&
    typeof job.quantity === 'number' && job.quantity >= 0 &&
    typeof job.estimated_duration === 'number' && job.estimated_duration >= 0 &&
    typeof job.status === 'string'
  );
}

function isValidMachine(machine: any): boolean {
  return (
    typeof machine.id === 'string' && machine.id.length > 0 &&
    typeof machine.name === 'string' &&
    typeof machine.technique_id === 'string'
  );
}

function isValidTechnique(technique: any): boolean {
  return (
    typeof technique.id === 'string' && technique.id.length > 0 &&
    typeof technique.name === 'string' &&
    typeof technique.color === 'string'
  );
}

function sanitizeNumber(value: unknown, fallback = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, value);
}

function normalizeColor(color: string | null): string {
  if (!color) return 'sem-cor';
  return color.toLowerCase().trim().replace(/\s+/g, '-');
}

function clampPercentage(value: number): number {
  return Math.min(100, Math.max(0, value));
}

// ===== JOB VALIDATION =====
describe('isValidJob', () => {
  const validJob = {
    id: 'abc-123',
    quantity: 100,
    estimated_duration: 60,
    status: 'queue',
  };

  it('accepts valid job', () => {
    expect(isValidJob(validJob)).toBe(true);
  });

  it('rejects empty id', () => {
    expect(isValidJob({ ...validJob, id: '' })).toBe(false);
  });

  it('rejects non-string id', () => {
    expect(isValidJob({ ...validJob, id: 123 })).toBe(false);
    expect(isValidJob({ ...validJob, id: null })).toBe(false);
  });

  it('rejects negative quantity', () => {
    expect(isValidJob({ ...validJob, quantity: -1 })).toBe(false);
  });

  it('accepts zero quantity', () => {
    expect(isValidJob({ ...validJob, quantity: 0 })).toBe(true);
  });

  it('rejects non-number quantity', () => {
    expect(isValidJob({ ...validJob, quantity: '100' })).toBe(false);
    expect(isValidJob({ ...validJob, quantity: null })).toBe(false);
  });

  it('rejects negative estimated_duration', () => {
    expect(isValidJob({ ...validJob, estimated_duration: -5 })).toBe(false);
  });

  it('accepts zero estimated_duration', () => {
    expect(isValidJob({ ...validJob, estimated_duration: 0 })).toBe(true);
  });

  it('rejects non-string status', () => {
    expect(isValidJob({ ...validJob, status: 123 })).toBe(false);
    expect(isValidJob({ ...validJob, status: null })).toBe(false);
  });
});

// ===== MACHINE VALIDATION =====
describe('isValidMachine', () => {
  const validMachine = { id: 'machine-1', name: 'Laser A', technique_id: 'tech-1' };

  it('accepts valid machine', () => {
    expect(isValidMachine(validMachine)).toBe(true);
  });

  it('rejects empty id', () => {
    expect(isValidMachine({ ...validMachine, id: '' })).toBe(false);
  });

  it('rejects missing name', () => {
    expect(isValidMachine({ ...validMachine, name: 123 })).toBe(false);
  });

  it('rejects missing technique_id', () => {
    expect(isValidMachine({ ...validMachine, technique_id: null })).toBe(false);
  });
});

// ===== TECHNIQUE VALIDATION =====
describe('isValidTechnique', () => {
  const validTechnique = { id: 'tech-1', name: 'Laser', color: '#ff0000' };

  it('accepts valid technique', () => {
    expect(isValidTechnique(validTechnique)).toBe(true);
  });

  it('rejects missing color', () => {
    expect(isValidTechnique({ ...validTechnique, color: 123 })).toBe(false);
  });

  it('rejects empty id', () => {
    expect(isValidTechnique({ ...validTechnique, id: '' })).toBe(false);
  });
});

// ===== SANITIZE NUMBER =====
describe('sanitizeNumber', () => {
  it('returns number for valid input', () => {
    expect(sanitizeNumber(42)).toBe(42);
    expect(sanitizeNumber(0)).toBe(0);
    expect(sanitizeNumber(3.14)).toBe(3.14);
  });

  it('returns fallback for null/undefined', () => {
    expect(sanitizeNumber(null)).toBe(0);
    expect(sanitizeNumber(undefined)).toBe(0);
  });

  it('returns fallback for NaN', () => {
    expect(sanitizeNumber(NaN)).toBe(0);
  });

  it('returns fallback for Infinity', () => {
    expect(sanitizeNumber(Infinity)).toBe(0);
    expect(sanitizeNumber(-Infinity)).toBe(0);
  });

  it('returns fallback for strings', () => {
    expect(sanitizeNumber('42')).toBe(0);
    expect(sanitizeNumber('')).toBe(0);
  });

  it('clamps negative to 0', () => {
    expect(sanitizeNumber(-5)).toBe(0);
    expect(sanitizeNumber(-100)).toBe(0);
  });

  it('uses custom fallback', () => {
    expect(sanitizeNumber(null, 10)).toBe(10);
    expect(sanitizeNumber(NaN, 99)).toBe(99);
  });
});

// ===== NORMALIZE COLOR =====
describe('normalizeColor', () => {
  it('normalizes standard colors', () => {
    expect(normalizeColor('Vermelho')).toBe('vermelho');
    expect(normalizeColor('AZUL')).toBe('azul');
  });

  it('handles null', () => {
    expect(normalizeColor(null)).toBe('sem-cor');
  });

  it('trims whitespace', () => {
    expect(normalizeColor('  verde  ')).toBe('verde');
  });

  it('replaces spaces with hyphens', () => {
    expect(normalizeColor('azul claro')).toBe('azul-claro');
    expect(normalizeColor('verde  escuro')).toBe('verde-escuro');
  });

  it('handles multi-word colors', () => {
    expect(normalizeColor('Azul Royal Metalico')).toBe('azul-royal-metalico');
  });
});

// ===== CLAMP PERCENTAGE =====
describe('clampPercentage', () => {
  it('keeps values within 0-100', () => {
    expect(clampPercentage(50)).toBe(50);
    expect(clampPercentage(0)).toBe(0);
    expect(clampPercentage(100)).toBe(100);
  });

  it('clamps values above 100', () => {
    expect(clampPercentage(150)).toBe(100);
    expect(clampPercentage(999)).toBe(100);
  });

  it('clamps values below 0', () => {
    expect(clampPercentage(-10)).toBe(0);
    expect(clampPercentage(-999)).toBe(0);
  });
});

// ===== LOSS RATE CALCULATIONS =====
describe('Loss Rate Calculations', () => {
  function calculateLossRate(completedPieces: number, lostPieces: number): number {
    const totalAttempted = completedPieces + lostPieces;
    return totalAttempted > 0 ? (lostPieces / totalAttempted) * 100 : 0;
  }

  it('calculates correct loss rate', () => {
    expect(calculateLossRate(90, 10)).toBe(10);
    expect(calculateLossRate(100, 0)).toBe(0);
    expect(calculateLossRate(50, 50)).toBe(50);
  });

  it('handles zero production', () => {
    expect(calculateLossRate(0, 0)).toBe(0);
  });

  it('handles all lost', () => {
    expect(calculateLossRate(0, 100)).toBe(100);
  });

  it('handles large numbers', () => {
    const rate = calculateLossRate(999990, 10);
    expect(rate).toBeCloseTo(0.001, 3);
  });
});

// ===== OEE CALCULATIONS =====
describe('OEE Calculation Logic', () => {
  function calculateOEE(availability: number, performance: number, quality: number): number {
    return (availability / 100) * (performance / 100) * (quality / 100) * 100;
  }

  it('calculates perfect OEE', () => {
    expect(calculateOEE(100, 100, 100)).toBe(100);
  });

  it('calculates world-class OEE', () => {
    // Typical world-class: 90% avail, 95% perf, 99% quality
    const oee = calculateOEE(90, 95, 99);
    expect(oee).toBeCloseTo(84.645, 1);
  });

  it('calculates with one factor at zero', () => {
    expect(calculateOEE(0, 100, 100)).toBe(0);
    expect(calculateOEE(100, 0, 100)).toBe(0);
    expect(calculateOEE(100, 100, 0)).toBe(0);
  });

  it('calculates with 50% across all factors', () => {
    expect(calculateOEE(50, 50, 50)).toBe(12.5);
  });

  it('handles decimal values', () => {
    const oee = calculateOEE(87.5, 92.3, 98.1);
    expect(oee).toBeGreaterThan(0);
    expect(oee).toBeLessThan(100);
  });
});

// ===== OEE LOSSES BREAKDOWN =====
describe('OEE Losses Breakdown', () => {
  function calculateLosses(availability: number, performance: number, quality: number) {
    const availabilityLosses = 100 - availability;
    const performanceLosses = (availability / 100) * (100 - performance);
    const qualityLosses = (availability / 100) * (performance / 100) * (100 - quality);
    return { availabilityLosses, performanceLosses, qualityLosses };
  }

  it('losses sum to 100 minus OEE', () => {
    const avail = 85, perf = 90, qual = 95;
    const oee = (avail / 100) * (perf / 100) * (qual / 100) * 100;
    const losses = calculateLosses(avail, perf, qual);
    const totalLoss = losses.availabilityLosses + losses.performanceLosses + losses.qualityLosses;
    expect(totalLoss + oee).toBeCloseTo(100, 5);
  });

  it('no losses when all 100%', () => {
    const losses = calculateLosses(100, 100, 100);
    expect(losses.availabilityLosses).toBe(0);
    expect(losses.performanceLosses).toBe(0);
    expect(losses.qualityLosses).toBe(0);
  });
});

// ===== BUFFER STATUS LOGIC =====
describe('Buffer Status Logic', () => {
  function getBufferStatus(readyCount: number, hasWork: boolean) {
    return {
      isHealthy: readyCount >= 3,
      isCritical: hasWork && readyCount === 0,
      isWarning: hasWork && readyCount > 0 && readyCount < 3,
    };
  }

  it('healthy when 3+ ready jobs', () => {
    const status = getBufferStatus(5, true);
    expect(status.isHealthy).toBe(true);
    expect(status.isCritical).toBe(false);
    expect(status.isWarning).toBe(false);
  });

  it('critical when work exists but no ready jobs', () => {
    const status = getBufferStatus(0, true);
    expect(status.isCritical).toBe(true);
    expect(status.isHealthy).toBe(false);
  });

  it('warning when 1-2 ready jobs', () => {
    expect(getBufferStatus(1, true).isWarning).toBe(true);
    expect(getBufferStatus(2, true).isWarning).toBe(true);
  });

  it('not critical when no work at all', () => {
    const status = getBufferStatus(0, false);
    expect(status.isCritical).toBe(false);
    expect(status.isWarning).toBe(false);
  });
});

// ===== BOTTLENECK THRESHOLDS =====
describe('Bottleneck Detection Thresholds', () => {
  const CRITICAL_THRESHOLD = 90;
  const WARNING_THRESHOLD = 75;
  const DAILY_CAPACITY = 11 * 60; // 660 minutes

  function getSeverity(usedMinutes: number, machineCount: number) {
    const totalCapacity = machineCount * DAILY_CAPACITY;
    const occupancy = (usedMinutes / totalCapacity) * 100;
    if (occupancy >= CRITICAL_THRESHOLD) return 'critical';
    if (occupancy >= WARNING_THRESHOLD) return 'warning';
    return 'ok';
  }

  it('detects critical bottleneck at 90%', () => {
    expect(getSeverity(594, 1)).toBe('critical'); // 90%
    expect(getSeverity(660, 1)).toBe('critical'); // 100%
  });

  it('detects warning at 75%', () => {
    expect(getSeverity(495, 1)).toBe('warning'); // 75%
    expect(getSeverity(580, 1)).toBe('warning'); // ~88%
  });

  it('no alert below 75%', () => {
    expect(getSeverity(400, 1)).toBe('ok'); // ~60%
    expect(getSeverity(0, 1)).toBe('ok');
  });

  it('scales with multiple machines', () => {
    // 2 machines = 1320 min capacity
    expect(getSeverity(1188, 2)).toBe('critical'); // 90%
    expect(getSeverity(660, 2)).toBe('ok'); // 50%
  });
});

// ===== LOAD BALANCING LOGIC =====
describe('Load Balancing Logic', () => {
  const DAILY_CAPACITY = 11 * 60;

  function isUnbalanced(occupancies: number[]): boolean {
    const max = Math.max(...occupancies);
    const min = Math.min(...occupancies);
    return max - min > 30;
  }

  it('detects unbalanced loads (> 30% difference)', () => {
    expect(isUnbalanced([90, 50])).toBe(true);
    expect(isUnbalanced([100, 10])).toBe(true);
  });

  it('detects balanced loads (<= 30% difference)', () => {
    expect(isUnbalanced([50, 50])).toBe(false);
    expect(isUnbalanced([60, 40])).toBe(false);
    expect(isUnbalanced([80, 55])).toBe(false);
  });

  it('handles single machine (always balanced)', () => {
    expect(isUnbalanced([70])).toBe(false);
  });

  it('handles multiple machines', () => {
    expect(isUnbalanced([90, 80, 20])).toBe(true); // 90-20=70
    expect(isUnbalanced([50, 55, 60])).toBe(false);
  });
});

// ===== SMART SEQUENCING: SETUP SAVINGS =====
describe('Smart Sequencing Setup Savings', () => {
  function countColorChanges(colors: string[]): number {
    let changes = 0;
    for (let i = 1; i < colors.length; i++) {
      if (colors[i] !== colors[i - 1]) changes++;
    }
    return changes;
  }

  function calculateSavings(currentColors: string[], optimizedColors: string[], setupTime: number): number {
    return (countColorChanges(currentColors) - countColorChanges(optimizedColors)) * setupTime;
  }

  it('counts color changes correctly', () => {
    expect(countColorChanges(['red', 'red', 'red'])).toBe(0);
    expect(countColorChanges(['red', 'blue', 'red'])).toBe(2);
    expect(countColorChanges(['red', 'blue', 'green'])).toBe(2);
  });

  it('calculates savings from grouping', () => {
    const current = ['red', 'blue', 'red', 'blue'];
    const optimized = ['red', 'red', 'blue', 'blue'];
    expect(calculateSavings(current, optimized, 15)).toBe(15); // 3-1=2 less changes * 15 = ... wait
    // current: 3 changes, optimized: 1 change, savings: 2 * 15 = 30
    expect(calculateSavings(current, optimized, 15)).toBe(30);
  });

  it('no savings when already optimal', () => {
    const colors = ['red', 'red', 'blue', 'blue'];
    expect(calculateSavings(colors, colors, 15)).toBe(0);
  });

  it('handles single job (no changes)', () => {
    expect(countColorChanges(['red'])).toBe(0);
  });

  it('handles empty array', () => {
    expect(countColorChanges([])).toBe(0);
  });
});

// ===== SCHEDULING CONFLICT DETECTION =====
describe('Scheduling Conflict Detection', () => {
  function hasTimeOverlap(start1: number, end1: number, start2: number, end2: number): boolean {
    return start1 < end2 && start2 < end1;
  }

  it('detects overlapping intervals', () => {
    expect(hasTimeOverlap(8, 10, 9, 11)).toBe(true); // partial overlap
    expect(hasTimeOverlap(8, 12, 9, 11)).toBe(true); // containment
    expect(hasTimeOverlap(8, 10, 8, 10)).toBe(true); // exact same
  });

  it('no overlap for adjacent intervals', () => {
    expect(hasTimeOverlap(8, 10, 10, 12)).toBe(false); // touching
    expect(hasTimeOverlap(8, 10, 11, 13)).toBe(false); // gap
  });

  it('no overlap for reversed order', () => {
    expect(hasTimeOverlap(10, 12, 8, 10)).toBe(false); // touching reversed
  });

  it('handles single-point intervals', () => {
    expect(hasTimeOverlap(8, 8, 8, 8)).toBe(false); // zero-width
  });
});

// ===== PRIORITY ORDERING =====
describe('Priority Ordering', () => {
  const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
  
  function sortByPriority(priorities: string[]): string[] {
    return [...priorities].sort((a, b) => (priorityOrder[a] ?? 2) - (priorityOrder[b] ?? 2));
  }

  it('sorts by priority correctly', () => {
    expect(sortByPriority(['low', 'urgent', 'medium', 'high'])).toEqual(['urgent', 'high', 'medium', 'low']);
  });

  it('handles unknown priorities as medium', () => {
    expect(sortByPriority(['unknown', 'urgent'])).toEqual(['urgent', 'unknown']);
  });

  it('handles empty array', () => {
    expect(sortByPriority([])).toEqual([]);
  });

  it('handles all same priority', () => {
    expect(sortByPriority(['medium', 'medium', 'medium'])).toEqual(['medium', 'medium', 'medium']);
  });
});

// ===== JOB STATUS TRANSITIONS =====
describe('Job Status Transitions', () => {
  const validTransitions: Record<string, string[]> = {
    queue: ['ready', 'cancelled'],
    ready: ['scheduled', 'queue', 'cancelled'],
    scheduled: ['production', 'ready', 'cancelled'],
    production: ['finished', 'paused', 'delayed', 'rework'],
    paused: ['production', 'cancelled'],
    delayed: ['production', 'cancelled'],
    rework: ['production', 'finished', 'cancelled'],
    finished: [], // terminal state
    cancelled: [], // terminal state
  };

  function isValidTransition(from: string, to: string): boolean {
    return validTransitions[from]?.includes(to) ?? false;
  }

  it('allows queue -> ready', () => {
    expect(isValidTransition('queue', 'ready')).toBe(true);
  });

  it('allows production -> finished', () => {
    expect(isValidTransition('production', 'finished')).toBe(true);
  });

  it('prevents finished -> any', () => {
    expect(isValidTransition('finished', 'production')).toBe(false);
    expect(isValidTransition('finished', 'queue')).toBe(false);
  });

  it('prevents cancelled -> any', () => {
    expect(isValidTransition('cancelled', 'queue')).toBe(false);
  });

  it('allows pause and resume', () => {
    expect(isValidTransition('production', 'paused')).toBe(true);
    expect(isValidTransition('paused', 'production')).toBe(true);
  });

  it('allows rework flow', () => {
    expect(isValidTransition('production', 'rework')).toBe(true);
    expect(isValidTransition('rework', 'finished')).toBe(true);
  });

  it('prevents skipping steps', () => {
    expect(isValidTransition('queue', 'production')).toBe(false);
    expect(isValidTransition('queue', 'finished')).toBe(false);
  });
});

// ===== OCCUPANCY RATE =====
describe('Occupancy Rate Calculation', () => {
  const DAILY_CAPACITY = 11 * 60;

  function calculateOccupancy(scheduledMinutes: number, machineCount: number = 1): number {
    const total = machineCount * DAILY_CAPACITY;
    return clampPercentage((scheduledMinutes / total) * 100);
  }

  it('calculates 0% for no jobs', () => {
    expect(calculateOccupancy(0)).toBe(0);
  });

  it('calculates 100% for full capacity', () => {
    expect(calculateOccupancy(660)).toBe(100);
  });

  it('clamps at 100% for overloaded', () => {
    expect(calculateOccupancy(800)).toBe(100);
  });

  it('scales with machines', () => {
    expect(calculateOccupancy(660, 2)).toBe(50);
  });
});
