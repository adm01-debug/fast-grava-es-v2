import { describe, it, expect } from 'vitest';

// ===== COLOR NORMALIZATION =====
describe('Color Normalization', () => {
  function normalizeColor(color: string | null): string {
    if (!color) return 'sem-cor';
    return color.toLowerCase().trim().replace(/\s+/g, '-');
  }

  it('normalizes to lowercase', () => {
    expect(normalizeColor('Azul')).toBe('azul');
    expect(normalizeColor('VERMELHO')).toBe('vermelho');
  });

  it('trims whitespace', () => {
    expect(normalizeColor('  azul  ')).toBe('azul');
  });

  it('replaces spaces with hyphens', () => {
    expect(normalizeColor('azul claro')).toBe('azul-claro');
    expect(normalizeColor('verde  escuro')).toBe('verde-escuro');
  });

  it('returns sem-cor for null', () => {
    expect(normalizeColor(null)).toBe('sem-cor');
  });

  it('returns sem-cor for empty string after trim', () => {
    // Empty string is falsy
    expect(normalizeColor('')).toBe('sem-cor');
  });

  it('handles mixed case with spaces', () => {
    expect(normalizeColor('Azul Marinho')).toBe('azul-marinho');
  });
});

// ===== SETUP SAVINGS CALCULATION =====
describe('Setup Savings Calculation', () => {
  interface MockJob {
    id: string;
    gravure_color: string | null;
    priority: string;
    estimated_duration: number;
  }

  function normalizeColor(color: string | null): string {
    if (!color) return 'sem-cor';
    return color.toLowerCase().trim().replace(/\s+/g, '-');
  }

  function countColorChanges(jobs: MockJob[]): number {
    let changes = 0;
    for (let i = 1; i < jobs.length; i++) {
      if (normalizeColor(jobs[i].gravure_color) !== normalizeColor(jobs[i - 1].gravure_color)) {
        changes++;
      }
    }
    return changes;
  }

  function calculateSetupSavings(currentSequence: MockJob[], optimizedSequence: MockJob[], setupTime: number): number {
    return (countColorChanges(currentSequence) - countColorChanges(optimizedSequence)) * setupTime;
  }

  it('no savings when already grouped', () => {
    const jobs: MockJob[] = [
      { id: '1', gravure_color: 'azul', priority: 'medium', estimated_duration: 60 },
      { id: '2', gravure_color: 'azul', priority: 'medium', estimated_duration: 60 },
      { id: '3', gravure_color: 'vermelho', priority: 'medium', estimated_duration: 60 },
    ];
    expect(calculateSetupSavings(jobs, jobs, 15)).toBe(0);
  });

  it('calculates savings from color grouping', () => {
    const current: MockJob[] = [
      { id: '1', gravure_color: 'azul', priority: 'medium', estimated_duration: 60 },
      { id: '2', gravure_color: 'vermelho', priority: 'medium', estimated_duration: 60 },
      { id: '3', gravure_color: 'azul', priority: 'medium', estimated_duration: 60 },
      { id: '4', gravure_color: 'vermelho', priority: 'medium', estimated_duration: 60 },
    ];
    // Current: azul->vermelho->azul->vermelho = 3 changes
    const optimized: MockJob[] = [
      { id: '1', gravure_color: 'azul', priority: 'medium', estimated_duration: 60 },
      { id: '3', gravure_color: 'azul', priority: 'medium', estimated_duration: 60 },
      { id: '2', gravure_color: 'vermelho', priority: 'medium', estimated_duration: 60 },
      { id: '4', gravure_color: 'vermelho', priority: 'medium', estimated_duration: 60 },
    ];
    // Optimized: azul->azul->vermelho->vermelho = 1 change
    // Savings: (3 - 1) * 15 = 30 minutes
    expect(calculateSetupSavings(current, optimized, 15)).toBe(30);
  });

  it('handles single job (no changes)', () => {
    const jobs: MockJob[] = [{ id: '1', gravure_color: 'azul', priority: 'medium', estimated_duration: 60 }];
    expect(countColorChanges(jobs)).toBe(0);
  });

  it('handles all null colors', () => {
    const jobs: MockJob[] = [
      { id: '1', gravure_color: null, priority: 'medium', estimated_duration: 60 },
      { id: '2', gravure_color: null, priority: 'medium', estimated_duration: 60 },
    ];
    expect(countColorChanges(jobs)).toBe(0);
  });

  it('null vs non-null counts as change', () => {
    const jobs: MockJob[] = [
      { id: '1', gravure_color: null, priority: 'medium', estimated_duration: 60 },
      { id: '2', gravure_color: 'azul', priority: 'medium', estimated_duration: 60 },
    ];
    expect(countColorChanges(jobs)).toBe(1);
  });

  it('handles many colors', () => {
    const colors = ['azul', 'vermelho', 'verde', 'amarelo', 'preto'];
    const jobs = colors.map((c, i) => ({ id: String(i), gravure_color: c, priority: 'medium', estimated_duration: 60 }));
    expect(countColorChanges(jobs)).toBe(4); // all different
  });

  it('case-insensitive color matching', () => {
    const jobs: MockJob[] = [
      { id: '1', gravure_color: 'Azul', priority: 'medium', estimated_duration: 60 },
      { id: '2', gravure_color: 'azul', priority: 'medium', estimated_duration: 60 },
    ];
    expect(countColorChanges(jobs)).toBe(0);
  });
});

// ===== OPTIMIZED SEQUENCING =====
describe('Optimized Sequencing Logic', () => {
  interface MockJob {
    id: string;
    gravure_color: string | null;
    priority: string;
    estimated_duration: number;
  }

  function normalizeColor(color: string | null): string {
    if (!color) return 'sem-cor';
    return color.toLowerCase().trim();
  }

  function optimizeSequence(jobs: MockJob[]): MockJob[] {
    const colorGroups = new Map<string, MockJob[]>();
    jobs.forEach(job => {
      const color = normalizeColor(job.gravure_color);
      const group = colorGroups.get(color) || [];
      group.push(job);
      colorGroups.set(color, group);
    });

    const sortedGroups = Array.from(colorGroups.entries())
      .sort((a, b) => b[1].length - a[1].length);

    const result: MockJob[] = [];
    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

    sortedGroups.forEach(([_, groupJobs]) => {
      const sorted = [...groupJobs].sort((a, b) => {
        return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      });
      result.push(...sorted);
    });

    return result;
  }

  it('groups by color, largest group first', () => {
    const jobs: MockJob[] = [
      { id: '1', gravure_color: 'vermelho', priority: 'medium', estimated_duration: 60 },
      { id: '2', gravure_color: 'azul', priority: 'medium', estimated_duration: 60 },
      { id: '3', gravure_color: 'azul', priority: 'medium', estimated_duration: 60 },
      { id: '4', gravure_color: 'azul', priority: 'medium', estimated_duration: 60 },
    ];
    const optimized = optimizeSequence(jobs);
    // azul group (3) should come first
    expect(optimized[0].gravure_color).toBe('azul');
    expect(optimized[1].gravure_color).toBe('azul');
    expect(optimized[2].gravure_color).toBe('azul');
    expect(optimized[3].gravure_color).toBe('vermelho');
  });

  it('sorts within group by priority', () => {
    const jobs: MockJob[] = [
      { id: '1', gravure_color: 'azul', priority: 'low', estimated_duration: 60 },
      { id: '2', gravure_color: 'azul', priority: 'urgent', estimated_duration: 60 },
      { id: '3', gravure_color: 'azul', priority: 'high', estimated_duration: 60 },
    ];
    const optimized = optimizeSequence(jobs);
    expect(optimized[0].priority).toBe('urgent');
    expect(optimized[1].priority).toBe('high');
    expect(optimized[2].priority).toBe('low');
  });

  it('preserves all jobs', () => {
    const jobs: MockJob[] = Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      gravure_color: ['azul', 'vermelho', 'verde'][i % 3],
      priority: 'medium',
      estimated_duration: 60,
    }));
    const optimized = optimizeSequence(jobs);
    expect(optimized).toHaveLength(10);
    const ids = new Set(optimized.map(j => j.id));
    expect(ids.size).toBe(10);
  });

  it('handles empty input', () => {
    expect(optimizeSequence([])).toEqual([]);
  });

  it('single job returns same', () => {
    const jobs: MockJob[] = [{ id: '1', gravure_color: 'azul', priority: 'medium', estimated_duration: 60 }];
    expect(optimizeSequence(jobs)).toEqual(jobs);
  });
});

// ===== DATA VALIDATION HELPERS =====
describe('Data Validation Helpers', () => {
  function sanitizeNumber(value: any, fallback = 0): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
    return Math.max(0, value);
  }

  function clampPercentage(value: number): number {
    return Math.min(100, Math.max(0, value));
  }

  function isValidJob(job: { id: string; status: string; estimated_duration: number }): boolean {
    return (
      typeof job.id === 'string' && job.id.length > 0 &&
      typeof job.status === 'string' &&
      typeof job.estimated_duration === 'number' && job.estimated_duration >= 0
    );
  }

  function isValidMachine(machine: { id: string; technique_id: string; name: string }): boolean {
    return (
      typeof machine.id === 'string' && machine.id.length > 0 &&
      typeof machine.technique_id === 'string' &&
      typeof machine.name === 'string'
    );
  }

  describe('sanitizeNumber', () => {
    it('returns valid positive numbers', () => {
      expect(sanitizeNumber(42)).toBe(42);
      expect(sanitizeNumber(0)).toBe(0);
    });

    it('returns fallback for non-numbers', () => {
      expect(sanitizeNumber('42')).toBe(0);
      expect(sanitizeNumber(null)).toBe(0);
      expect(sanitizeNumber(undefined)).toBe(0);
    });

    it('returns fallback for non-finite', () => {
      expect(sanitizeNumber(NaN)).toBe(0);
      expect(sanitizeNumber(Infinity)).toBe(0);
      expect(sanitizeNumber(-Infinity)).toBe(0);
    });

    it('clamps negative to 0', () => {
      expect(sanitizeNumber(-5)).toBe(0);
      expect(sanitizeNumber(-100)).toBe(0);
    });

    it('uses custom fallback', () => {
      expect(sanitizeNumber(NaN, 10)).toBe(10);
      expect(sanitizeNumber('bad', 99)).toBe(99);
    });
  });

  describe('clampPercentage', () => {
    it('clamps to 0-100', () => {
      expect(clampPercentage(50)).toBe(50);
      expect(clampPercentage(0)).toBe(0);
      expect(clampPercentage(100)).toBe(100);
      expect(clampPercentage(-10)).toBe(0);
      expect(clampPercentage(150)).toBe(100);
    });
  });

  describe('isValidJob', () => {
    it('accepts valid job', () => {
      expect(isValidJob({ id: '123', status: 'queue', estimated_duration: 60 })).toBe(true);
    });

    it('rejects empty id', () => {
      expect(isValidJob({ id: '', status: 'queue', estimated_duration: 60 })).toBe(false);
    });

    it('rejects negative duration', () => {
      expect(isValidJob({ id: '1', status: 'queue', estimated_duration: -1 })).toBe(false);
    });
  });

  describe('isValidMachine', () => {
    it('accepts valid machine', () => {
      expect(isValidMachine({ id: '1', technique_id: 'silk', name: 'M1' })).toBe(true);
    });

    it('rejects empty id', () => {
      expect(isValidMachine({ id: '', technique_id: 'silk', name: 'M1' })).toBe(false);
    });
  });
});

// ===== LOAD BALANCING: OCCUPANCY CALCULATION =====
describe('Load Balancing Occupancy', () => {
  const DAILY_CAPACITY = 11 * 60; // 660 minutes

  function calculateMachineLoad(scheduledMinutes: number) {
    const occupancyRate = Math.min(100, Math.max(0, (scheduledMinutes / DAILY_CAPACITY) * 100));
    const availableMinutes = Math.max(0, DAILY_CAPACITY - scheduledMinutes);
    return { occupancyRate, availableMinutes };
  }

  it('empty machine has 0% occupancy', () => {
    const { occupancyRate, availableMinutes } = calculateMachineLoad(0);
    expect(occupancyRate).toBe(0);
    expect(availableMinutes).toBe(660);
  });

  it('full machine has 100% occupancy', () => {
    const { occupancyRate, availableMinutes } = calculateMachineLoad(660);
    expect(occupancyRate).toBe(100);
    expect(availableMinutes).toBe(0);
  });

  it('half loaded machine', () => {
    const { occupancyRate, availableMinutes } = calculateMachineLoad(330);
    expect(occupancyRate).toBeCloseTo(50, 0);
    expect(availableMinutes).toBe(330);
  });

  it('overloaded clamps to 100%', () => {
    const { occupancyRate, availableMinutes } = calculateMachineLoad(1000);
    expect(occupancyRate).toBe(100);
    expect(availableMinutes).toBe(0);
  });
});

// ===== LOAD BALANCING: IMBALANCE DETECTION =====
describe('Load Balancing Imbalance Detection', () => {
  function isUnbalanced(occupancies: number[]): boolean {
    if (occupancies.length < 2) return false;
    return Math.max(...occupancies) - Math.min(...occupancies) > 30;
  }

  function findOverloaded(occupancies: { id: string; rate: number }[], avg: number) {
    return occupancies.filter(m => m.rate > avg + 15).sort((a, b) => b.rate - a.rate);
  }

  function findUnderloaded(occupancies: { id: string; rate: number; available: number }[], avg: number) {
    return occupancies.filter(m => m.rate < avg - 15 && m.available > 60).sort((a, b) => a.rate - b.rate);
  }

  it('balanced when difference <= 30%', () => {
    expect(isUnbalanced([50, 60, 70])).toBe(false);
    expect(isUnbalanced([80, 80])).toBe(false);
  });

  it('unbalanced when difference > 30%', () => {
    expect(isUnbalanced([20, 90])).toBe(true);
    expect(isUnbalanced([10, 50, 95])).toBe(true);
  });

  it('single machine is never unbalanced', () => {
    expect(isUnbalanced([100])).toBe(false);
  });

  it('finds overloaded machines', () => {
    const machines = [
      { id: 'M1', rate: 90 },
      { id: 'M2', rate: 50 },
      { id: 'M3', rate: 80 },
    ];
    const avg = (90 + 50 + 80) / 3; // ~73.3
    const overloaded = findOverloaded(machines, avg);
    expect(overloaded).toHaveLength(1); // M1 at 90 > 73.3 + 15 = 88.3
    expect(overloaded[0].id).toBe('M1');
  });

  it('finds underloaded machines', () => {
    const machines = [
      { id: 'M1', rate: 90, available: 60 },
      { id: 'M2', rate: 20, available: 520 },
      { id: 'M3', rate: 50, available: 330 },
    ];
    const avg = (90 + 20 + 50) / 3; // ~53.3
    const underloaded = findUnderloaded(machines, avg);
    expect(underloaded).toHaveLength(1); // M2 at 20 < 53.3 - 15 = 38.3
    expect(underloaded[0].id).toBe('M2');
  });

  it('underloaded requires > 60min available', () => {
    const machines = [
      { id: 'M1', rate: 10, available: 30 }, // low rate but no capacity
    ];
    const underloaded = findUnderloaded(machines, 80);
    expect(underloaded).toHaveLength(0);
  });
});

// ===== MOVABLE JOBS FILTER =====
describe('Movable Jobs Filter', () => {
  function isMovableJob(job: { status: string; priority: string }): boolean {
    return !['production', 'finished'].includes(job.status) && job.priority !== 'urgent';
  }

  it('queue jobs are movable', () => {
    expect(isMovableJob({ status: 'queue', priority: 'medium' })).toBe(true);
    expect(isMovableJob({ status: 'scheduled', priority: 'low' })).toBe(true);
    expect(isMovableJob({ status: 'ready', priority: 'high' })).toBe(true);
  });

  it('production jobs are NOT movable', () => {
    expect(isMovableJob({ status: 'production', priority: 'medium' })).toBe(false);
  });

  it('finished jobs are NOT movable', () => {
    expect(isMovableJob({ status: 'finished', priority: 'medium' })).toBe(false);
  });

  it('urgent jobs are NOT movable', () => {
    expect(isMovableJob({ status: 'queue', priority: 'urgent' })).toBe(false);
    expect(isMovableJob({ status: 'scheduled', priority: 'urgent' })).toBe(false);
  });

  it('high priority IS movable (only urgent is blocked)', () => {
    expect(isMovableJob({ status: 'queue', priority: 'high' })).toBe(true);
  });
});

// ===== LOAD DIFFERENCE RANKING =====
describe('Suggestion Ranking by Load Difference', () => {
  interface Suggestion {
    jobId: string;
    currentLoad: number;
    suggestedLoad: number;
    loadDifference: number;
  }

  function rankSuggestions(suggestions: Suggestion[]): Suggestion[] {
    return [...suggestions].sort((a, b) => b.loadDifference - a.loadDifference);
  }

  it('highest load difference first', () => {
    const suggestions: Suggestion[] = [
      { jobId: 'J1', currentLoad: 80, suggestedLoad: 30, loadDifference: 50 },
      { jobId: 'J2', currentLoad: 90, suggestedLoad: 10, loadDifference: 80 },
      { jobId: 'J3', currentLoad: 70, suggestedLoad: 40, loadDifference: 30 },
    ];
    const ranked = rankSuggestions(suggestions);
    expect(ranked[0].jobId).toBe('J2');
    expect(ranked[1].jobId).toBe('J1');
    expect(ranked[2].jobId).toBe('J3');
  });

  it('handles empty list', () => {
    expect(rankSuggestions([])).toEqual([]);
  });

  it('handles equal differences', () => {
    const suggestions: Suggestion[] = [
      { jobId: 'J1', currentLoad: 80, suggestedLoad: 30, loadDifference: 50 },
      { jobId: 'J2', currentLoad: 70, suggestedLoad: 20, loadDifference: 50 },
    ];
    const ranked = rankSuggestions(suggestions);
    expect(ranked).toHaveLength(2);
  });
});
