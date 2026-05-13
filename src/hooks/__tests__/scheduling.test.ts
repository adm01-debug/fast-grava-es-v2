import { describe, it, expect } from 'vitest';

// ===== SCHEDULING CONFLICT DETECTION (extracted logic) =====
describe('Scheduling Conflict Detection Logic', () => {
  function hasTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    return start1 < end2 && start2 < end1;
  }

  function detectConflicts(jobs: Array<{ id: string; machineId: string; date: string; startTime: string; endTime: string; status: string }>) {
    const activeStatuses = ['scheduled', 'ready', 'production'];
    const activeJobs = jobs.filter(j => activeStatuses.includes(j.status) && j.startTime && j.endTime && j.machineId);

    const KEY_SEP = '|||';
    const byMachineDate = new Map<string, typeof activeJobs>();
    activeJobs.forEach(j => {
      const key = `${j.machineId}${KEY_SEP}${j.date}`;
      const existing = byMachineDate.get(key) || [];
      existing.push(j);
      byMachineDate.set(key, existing);
    });

    const conflicts: Array<{ machineId: string; date: string; jobIds: string[]; severity: 'warning' | 'error' }> = [];

    byMachineDate.forEach((groupJobs, key) => {
      if (groupJobs.length < 2) return;
      const [machineId, date] = key.split(KEY_SEP);
      const conflicting = new Set<string>();

      for (let i = 0; i < groupJobs.length; i++) {
        for (let j = i + 1; j < groupJobs.length; j++) {
          if (hasTimeOverlap(groupJobs[i].startTime, groupJobs[i].endTime, groupJobs[j].startTime, groupJobs[j].endTime)) {
            conflicting.add(groupJobs[i].id);
            conflicting.add(groupJobs[j].id);
          }
        }
      }

      if (conflicting.size > 0) {
        const hasProduction = groupJobs.filter(j => conflicting.has(j.id)).some(j => j.status === 'production');
        conflicts.push({ machineId, date, jobIds: [...conflicting], severity: hasProduction ? 'error' : 'warning' });
      }
    });

    return conflicts;
  }

  it('detects overlapping jobs on same machine', () => {
    const jobs = [
      { id: 'j1', machineId: 'm1', date: '2026-03-15', startTime: '08:00', endTime: '10:00', status: 'scheduled' },
      { id: 'j2', machineId: 'm1', date: '2026-03-15', startTime: '09:00', endTime: '11:00', status: 'scheduled' },
    ];
    const conflicts = detectConflicts(jobs);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].jobIds).toContain('j1');
    expect(conflicts[0].jobIds).toContain('j2');
  });

  it('no conflict for adjacent time slots', () => {
    const jobs = [
      { id: 'j1', machineId: 'm1', date: '2026-03-15', startTime: '08:00', endTime: '10:00', status: 'scheduled' },
      { id: 'j2', machineId: 'm1', date: '2026-03-15', startTime: '10:00', endTime: '12:00', status: 'scheduled' },
    ];
    expect(detectConflicts(jobs)).toHaveLength(0);
  });

  it('no conflict for different machines same time', () => {
    const jobs = [
      { id: 'j1', machineId: 'm1', date: '2026-03-15', startTime: '08:00', endTime: '10:00', status: 'scheduled' },
      { id: 'j2', machineId: 'm2', date: '2026-03-15', startTime: '08:00', endTime: '10:00', status: 'scheduled' },
    ];
    expect(detectConflicts(jobs)).toHaveLength(0);
  });

  it('no conflict for different dates same machine', () => {
    const jobs = [
      { id: 'j1', machineId: 'm1', date: '2026-03-15', startTime: '08:00', endTime: '10:00', status: 'scheduled' },
      { id: 'j2', machineId: 'm1', date: '2026-03-16', startTime: '08:00', endTime: '10:00', status: 'scheduled' },
    ];
    expect(detectConflicts(jobs)).toHaveLength(0);
  });

  it('ignores finished and cancelled jobs', () => {
    const jobs = [
      { id: 'j1', machineId: 'm1', date: '2026-03-15', startTime: '08:00', endTime: '10:00', status: 'finished' },
      { id: 'j2', machineId: 'm1', date: '2026-03-15', startTime: '08:00', endTime: '10:00', status: 'scheduled' },
    ];
    expect(detectConflicts(jobs)).toHaveLength(0);
  });

  it('severity is error when production job involved', () => {
    const jobs = [
      { id: 'j1', machineId: 'm1', date: '2026-03-15', startTime: '08:00', endTime: '10:00', status: 'production' },
      { id: 'j2', machineId: 'm1', date: '2026-03-15', startTime: '09:00', endTime: '11:00', status: 'scheduled' },
    ];
    const conflicts = detectConflicts(jobs);
    expect(conflicts[0].severity).toBe('error');
  });

  it('severity is warning for non-production conflicts', () => {
    const jobs = [
      { id: 'j1', machineId: 'm1', date: '2026-03-15', startTime: '08:00', endTime: '10:00', status: 'scheduled' },
      { id: 'j2', machineId: 'm1', date: '2026-03-15', startTime: '09:00', endTime: '11:00', status: 'ready' },
    ];
    const conflicts = detectConflicts(jobs);
    expect(conflicts[0].severity).toBe('warning');
  });

  it('detects 3-way conflict', () => {
    const jobs = [
      { id: 'j1', machineId: 'm1', date: '2026-03-15', startTime: '08:00', endTime: '12:00', status: 'scheduled' },
      { id: 'j2', machineId: 'm1', date: '2026-03-15', startTime: '09:00', endTime: '11:00', status: 'scheduled' },
      { id: 'j3', machineId: 'm1', date: '2026-03-15', startTime: '10:00', endTime: '13:00', status: 'scheduled' },
    ];
    const conflicts = detectConflicts(jobs);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].jobIds).toHaveLength(3);
  });

  it('handles jobs without time fields', () => {
    const jobs = [
      { id: 'j1', machineId: 'm1', date: '2026-03-15', startTime: '', endTime: '', status: 'scheduled' },
      { id: 'j2', machineId: 'm1', date: '2026-03-15', startTime: '08:00', endTime: '10:00', status: 'scheduled' },
    ];
    // j1 has empty times, should be filtered out
    expect(detectConflicts(jobs)).toHaveLength(0);
  });

  it('handles empty jobs array', () => {
    expect(detectConflicts([])).toHaveLength(0);
  });

  it('handles single job', () => {
    const jobs = [
      { id: 'j1', machineId: 'm1', date: '2026-03-15', startTime: '08:00', endTime: '10:00', status: 'scheduled' },
    ];
    expect(detectConflicts(jobs)).toHaveLength(0);
  });

  it('handles exact same time (full overlap)', () => {
    const jobs = [
      { id: 'j1', machineId: 'm1', date: '2026-03-15', startTime: '08:00', endTime: '10:00', status: 'scheduled' },
      { id: 'j2', machineId: 'm1', date: '2026-03-15', startTime: '08:00', endTime: '10:00', status: 'scheduled' },
    ];
    const conflicts = detectConflicts(jobs);
    expect(conflicts).toHaveLength(1);
  });

  it('handles containment (job inside another)', () => {
    const jobs = [
      { id: 'j1', machineId: 'm1', date: '2026-03-15', startTime: '07:00', endTime: '18:00', status: 'scheduled' },
      { id: 'j2', machineId: 'm1', date: '2026-03-15', startTime: '09:00', endTime: '11:00', status: 'scheduled' },
    ];
    const conflicts = detectConflicts(jobs);
    expect(conflicts).toHaveLength(1);
  });
});

// ===== STUCK JOB DETECTION (extracted logic) =====
describe('Stuck Job Detection Logic', () => {
  const WARNING_HOURS = 8;
  const CRITICAL_HOURS = 24;

  function detectStuckJobs(jobs: Array<{ id: string; orderNumber: string; status: string; actualStartTime: string | null }>, now: number) {
    const results: Array<{ id: string; hours: number; severity: 'warning' | 'critical' }> = [];

    jobs.forEach(job => {
      if (job.status !== 'production' || !job.actualStartTime) return;
      const start = new Date(job.actualStartTime).getTime();
      if (isNaN(start)) return;
      const elapsed = now - start;
      if (elapsed <= 0) return;
      const hours = elapsed / (1000 * 60 * 60);

      if (hours >= CRITICAL_HOURS) {
        results.push({ id: job.id, hours, severity: 'critical' });
      } else if (hours >= WARNING_HOURS) {
        results.push({ id: job.id, hours, severity: 'warning' });
      }
    });

    return results.sort((a, b) => b.hours - a.hours);
  }

  const NOW = new Date('2026-03-15T12:00:00Z').getTime();

  it('detects warning after 8 hours', () => {
    const jobs = [{ id: 'j1', orderNumber: 'OS-001', status: 'production', actualStartTime: '2026-03-15T03:00:00Z' }]; // 9 hours
    const stuck = detectStuckJobs(jobs, NOW);
    expect(stuck).toHaveLength(1);
    expect(stuck[0].severity).toBe('warning');
  });

  it('detects critical after 24 hours', () => {
    const jobs = [{ id: 'j1', orderNumber: 'OS-001', status: 'production', actualStartTime: '2026-03-14T10:00:00Z' }]; // 26 hours
    const stuck = detectStuckJobs(jobs, NOW);
    expect(stuck).toHaveLength(1);
    expect(stuck[0].severity).toBe('critical');
  });

  it('ignores jobs under 8 hours', () => {
    const jobs = [{ id: 'j1', orderNumber: 'OS-001', status: 'production', actualStartTime: '2026-03-15T06:00:00Z' }]; // 6 hours
    expect(detectStuckJobs(jobs, NOW)).toHaveLength(0);
  });

  it('ignores non-production jobs', () => {
    const jobs = [
      { id: 'j1', orderNumber: 'OS-001', status: 'finished', actualStartTime: '2026-03-14T10:00:00Z' },
      { id: 'j2', orderNumber: 'OS-002', status: 'queue', actualStartTime: null },
    ];
    expect(detectStuckJobs(jobs, NOW)).toHaveLength(0);
  });

  it('ignores jobs with no start time', () => {
    const jobs = [{ id: 'j1', orderNumber: 'OS-001', status: 'production', actualStartTime: null }];
    expect(detectStuckJobs(jobs, NOW)).toHaveLength(0);
  });

  it('ignores future start times', () => {
    const jobs = [{ id: 'j1', orderNumber: 'OS-001', status: 'production', actualStartTime: '2026-03-16T10:00:00Z' }];
    expect(detectStuckJobs(jobs, NOW)).toHaveLength(0);
  });

  it('handles invalid date strings', () => {
    const jobs = [{ id: 'j1', orderNumber: 'OS-001', status: 'production', actualStartTime: 'not-a-date' }];
    expect(detectStuckJobs(jobs, NOW)).toHaveLength(0);
  });

  it('sorts by hours descending', () => {
    const jobs = [
      { id: 'j1', orderNumber: 'OS-001', status: 'production', actualStartTime: '2026-03-15T03:00:00Z' }, // 9h
      { id: 'j2', orderNumber: 'OS-002', status: 'production', actualStartTime: '2026-03-13T12:00:00Z' }, // 48h
      { id: 'j3', orderNumber: 'OS-003', status: 'production', actualStartTime: '2026-03-14T20:00:00Z' }, // 16h
    ];
    const stuck = detectStuckJobs(jobs, NOW);
    expect(stuck[0].id).toBe('j2');
    expect(stuck[1].id).toBe('j3');
    expect(stuck[2].id).toBe('j1');
  });

  it('exactly 8 hours triggers warning', () => {
    const jobs = [{ id: 'j1', orderNumber: 'OS-001', status: 'production', actualStartTime: '2026-03-15T04:00:00Z' }]; // exactly 8h
    const stuck = detectStuckJobs(jobs, NOW);
    expect(stuck).toHaveLength(1);
    expect(stuck[0].severity).toBe('warning');
  });

  it('exactly 24 hours triggers critical', () => {
    const jobs = [{ id: 'j1', orderNumber: 'OS-001', status: 'production', actualStartTime: '2026-03-14T12:00:00Z' }]; // exactly 24h
    const stuck = detectStuckJobs(jobs, NOW);
    expect(stuck).toHaveLength(1);
    expect(stuck[0].severity).toBe('critical');
  });
});

// ===== BUFFER PROMOTION LOGIC =====
describe('Buffer Promotion Logic', () => {
  const BUFFER_TARGET = 3;

  interface SimpleJob { id: string; status: string; techniqueId: string; priority: string; createdAt: string }

  function calculatePromotionNeeds(jobs: SimpleJob[], techniqueId: string) {
    const techniqueJobs = jobs.filter(j => j.techniqueId === techniqueId);
    const readyJobs = techniqueJobs.filter(j => j.status === 'ready');
    const queueJobs = techniqueJobs.filter(j => j.status === 'queue');
    const needed = Math.max(0, BUFFER_TARGET - readyJobs.length);

    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    const sorted = [...queueJobs].sort((a, b) => {
      const pDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      if (pDiff !== 0) return pDiff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return { needed, toPromote: sorted.slice(0, needed), readyCount: readyJobs.length, queueCount: queueJobs.length };
  }

  it('needs 3 promotions when buffer empty', () => {
    const jobs: SimpleJob[] = [
      { id: 'q1', status: 'queue', techniqueId: 't1', priority: 'medium', createdAt: '2026-01-01' },
      { id: 'q2', status: 'queue', techniqueId: 't1', priority: 'high', createdAt: '2026-01-02' },
      { id: 'q3', status: 'queue', techniqueId: 't1', priority: 'low', createdAt: '2026-01-03' },
      { id: 'q4', status: 'queue', techniqueId: 't1', priority: 'urgent', createdAt: '2026-01-04' },
    ];
    const result = calculatePromotionNeeds(jobs, 't1');
    expect(result.needed).toBe(3);
    expect(result.toPromote).toHaveLength(3);
  });

  it('needs 0 promotions when buffer full', () => {
    const jobs: SimpleJob[] = [
      { id: 'r1', status: 'ready', techniqueId: 't1', priority: 'medium', createdAt: '2026-01-01' },
      { id: 'r2', status: 'ready', techniqueId: 't1', priority: 'high', createdAt: '2026-01-02' },
      { id: 'r3', status: 'ready', techniqueId: 't1', priority: 'low', createdAt: '2026-01-03' },
    ];
    const result = calculatePromotionNeeds(jobs, 't1');
    expect(result.needed).toBe(0);
    expect(result.toPromote).toHaveLength(0);
  });

  it('needs 1 promotion when buffer has 2', () => {
    const jobs: SimpleJob[] = [
      { id: 'r1', status: 'ready', techniqueId: 't1', priority: 'medium', createdAt: '2026-01-01' },
      { id: 'r2', status: 'ready', techniqueId: 't1', priority: 'high', createdAt: '2026-01-02' },
      { id: 'q1', status: 'queue', techniqueId: 't1', priority: 'low', createdAt: '2026-01-03' },
    ];
    const result = calculatePromotionNeeds(jobs, 't1');
    expect(result.needed).toBe(1);
    expect(result.toPromote).toHaveLength(1);
  });

  it('promotes urgent jobs first', () => {
    const jobs: SimpleJob[] = [
      { id: 'q1', status: 'queue', techniqueId: 't1', priority: 'low', createdAt: '2026-01-01' },
      { id: 'q2', status: 'queue', techniqueId: 't1', priority: 'urgent', createdAt: '2026-01-02' },
      { id: 'q3', status: 'queue', techniqueId: 't1', priority: 'medium', createdAt: '2026-01-03' },
    ];
    const result = calculatePromotionNeeds(jobs, 't1');
    expect(result.toPromote[0].id).toBe('q2'); // urgent first
    expect(result.toPromote[1].id).toBe('q3'); // then medium
    expect(result.toPromote[2].id).toBe('q1'); // then low
  });

  it('within same priority, promotes oldest first', () => {
    const jobs: SimpleJob[] = [
      { id: 'q1', status: 'queue', techniqueId: 't1', priority: 'medium', createdAt: '2026-01-03' },
      { id: 'q2', status: 'queue', techniqueId: 't1', priority: 'medium', createdAt: '2026-01-01' },
      { id: 'q3', status: 'queue', techniqueId: 't1', priority: 'medium', createdAt: '2026-01-02' },
    ];
    const result = calculatePromotionNeeds(jobs, 't1');
    expect(result.toPromote[0].id).toBe('q2'); // oldest
    expect(result.toPromote[1].id).toBe('q3');
    expect(result.toPromote[2].id).toBe('q1'); // newest
  });

  it('only considers queue jobs for promotion', () => {
    const jobs: SimpleJob[] = [
      { id: 'p1', status: 'production', techniqueId: 't1', priority: 'medium', createdAt: '2026-01-01' },
      { id: 'f1', status: 'finished', techniqueId: 't1', priority: 'medium', createdAt: '2026-01-02' },
      { id: 'q1', status: 'queue', techniqueId: 't1', priority: 'medium', createdAt: '2026-01-03' },
    ];
    const result = calculatePromotionNeeds(jobs, 't1');
    expect(result.queueCount).toBe(1);
    expect(result.toPromote).toHaveLength(1);
  });

  it('handles no queue jobs available', () => {
    const jobs: SimpleJob[] = [
      { id: 'r1', status: 'ready', techniqueId: 't1', priority: 'medium', createdAt: '2026-01-01' },
    ];
    const result = calculatePromotionNeeds(jobs, 't1');
    expect(result.needed).toBe(2);
    expect(result.toPromote).toHaveLength(0); // no queue jobs to promote
  });

  it('ignores other techniques', () => {
    const jobs: SimpleJob[] = [
      { id: 'q1', status: 'queue', techniqueId: 't2', priority: 'urgent', createdAt: '2026-01-01' },
    ];
    const result = calculatePromotionNeeds(jobs, 't1');
    expect(result.queueCount).toBe(0);
    expect(result.needed).toBe(3);
  });
});

// ===== SMART SEQUENCING LOGIC =====
describe('Smart Sequencing - Color Grouping', () => {
  function normalizeColor(color: string | null): string {
    if (!color) return 'sem-cor';
    return color.toLowerCase().trim().replace(/\s+/g, '-');
  }

  function countColorChanges(colors: string[]): number {
    let changes = 0;
    for (let i = 1; i < colors.length; i++) {
      if (normalizeColor(colors[i]) !== normalizeColor(colors[i - 1])) changes++;
    }
    return changes;
  }

  function optimizeSequence(jobs: Array<{ id: string; color: string | null; priority: string }>) {
    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    const groups = new Map<string, typeof jobs>();

    jobs.forEach(j => {
      const color = normalizeColor(j.color);
      const group = groups.get(color) || [];
      group.push(j);
      groups.set(color, group);
    });

    const optimized: typeof jobs = [];
    const sorted = Array.from(groups.entries()).sort((a, b) => b[1].length - a[1].length);
    sorted.forEach(([_, groupJobs]) => {
      const sortedGroup = groupJobs.sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));
      optimized.push(...sortedGroup);
    });

    return optimized;
  }

  it('groups same colors together', () => {
    const jobs = [
      { id: '1', color: 'red', priority: 'medium' },
      { id: '2', color: 'blue', priority: 'medium' },
      { id: '3', color: 'red', priority: 'medium' },
      { id: '4', color: 'blue', priority: 'medium' },
    ];
    const optimized = optimizeSequence(jobs);
    // After grouping, same colors should be adjacent
    const colors = optimized.map(j => j.color);
    expect(countColorChanges(colors.filter((c): c is string => c !== null))).toBeLessThanOrEqual(1);
  });

  it('preserves priority within color groups', () => {
    const jobs = [
      { id: '1', color: 'red', priority: 'low' },
      { id: '2', color: 'red', priority: 'urgent' },
      { id: '3', color: 'red', priority: 'medium' },
    ];
    const optimized = optimizeSequence(jobs);
    expect(optimized[0].id).toBe('2'); // urgent first
    expect(optimized[2].id).toBe('1'); // low last
  });

  it('larger color groups come first', () => {
    const jobs = [
      { id: '1', color: 'blue', priority: 'medium' },
      { id: '2', color: 'red', priority: 'medium' },
      { id: '3', color: 'red', priority: 'medium' },
      { id: '4', color: 'red', priority: 'medium' },
    ];
    const optimized = optimizeSequence(jobs);
    // red group (3 jobs) should come before blue (1 job)
    expect(optimized[0].color).toBe('red');
  });

  it('handles null colors as sem-cor', () => {
    const jobs = [
      { id: '1', color: null, priority: 'medium' },
      { id: '2', color: 'red', priority: 'medium' },
      { id: '3', color: null, priority: 'medium' },
    ];
    const optimized = optimizeSequence(jobs);
    // null colors grouped together
    const nullJobs = optimized.filter(j => j.color === null);
    const firstNull = optimized.indexOf(nullJobs[0]);
    const lastNull = optimized.indexOf(nullJobs[nullJobs.length - 1]);
    expect(lastNull - firstNull).toBe(1); // adjacent
  });

  it('normalizes colors with spaces and case', () => {
    expect(normalizeColor('Azul Claro')).toBe('azul-claro');
    expect(normalizeColor('  VERMELHO  ')).toBe('vermelho');
    expect(normalizeColor('verde  escuro')).toBe('verde-escuro');
  });

  it('handles empty job list', () => {
    expect(optimizeSequence([])).toEqual([]);
  });

  it('handles single job', () => {
    const jobs = [{ id: '1', color: 'red', priority: 'medium' }];
    expect(optimizeSequence(jobs)).toHaveLength(1);
  });

  it('calculates setup savings correctly', () => {
    const current = ['red', 'blue', 'red', 'blue', 'red'];
    const optimized = ['red', 'red', 'red', 'blue', 'blue'];
    const setupTime = 15; // minutes
    const currentChanges = countColorChanges(current); // 4
    const optimizedChanges = countColorChanges(optimized); // 1
    const savings = (currentChanges - optimizedChanges) * setupTime;
    expect(savings).toBe(45); // 3 fewer changes * 15 min
  });

  it('no savings when already optimal', () => {
    const colors = ['red', 'red', 'blue', 'blue'];
    const changes = countColorChanges(colors);
    expect(changes).toBe(1); // minimal changes
  });
});

// ===== BOTTLENECK PREDICTION LOGIC =====
describe('Bottleneck Prediction Logic', () => {
  const DAILY_CAPACITY = 11 * 60; // 660 minutes
  const CRITICAL_THRESHOLD = 90;
  const WARNING_THRESHOLD = 75;

  function calculateOccupancy(usedMinutes: number, machineCount: number) {
    const totalCapacity = machineCount * DAILY_CAPACITY;
    const rate = (usedMinutes / totalCapacity) * 100;
    return rate;
  }

  function getSeverity(occupancy: number, projectedOccupancy: number, dayOffset: number): 'critical' | 'warning' | 'info' | null {
    if (occupancy >= CRITICAL_THRESHOLD) return 'critical';
    if (occupancy >= WARNING_THRESHOLD) return 'warning';
    if (projectedOccupancy >= CRITICAL_THRESHOLD && dayOffset < 2) return 'info';
    return null;
  }

  it('critical at 90%+ occupancy', () => {
    expect(getSeverity(95, 95, 0)).toBe('critical');
    expect(getSeverity(90, 90, 0)).toBe('critical');
    expect(getSeverity(100, 100, 0)).toBe('critical');
  });

  it('warning at 75-89% occupancy', () => {
    expect(getSeverity(75, 75, 0)).toBe('warning');
    expect(getSeverity(85, 85, 0)).toBe('warning');
    expect(getSeverity(89, 89, 0)).toBe('warning');
  });

  it('info for projected overflow within 2 days', () => {
    expect(getSeverity(50, 95, 0)).toBe('info');
    expect(getSeverity(50, 95, 1)).toBe('info');
    expect(getSeverity(50, 95, 2)).toBeNull(); // day 2 = too far
  });

  it('no alert below 75%', () => {
    expect(getSeverity(50, 50, 0)).toBeNull();
    expect(getSeverity(74.9, 74.9, 0)).toBeNull();
    expect(getSeverity(0, 0, 0)).toBeNull();
  });

  it('occupancy scales with machines', () => {
    expect(calculateOccupancy(660, 1)).toBeCloseTo(100);
    expect(calculateOccupancy(660, 2)).toBeCloseTo(50);
    expect(calculateOccupancy(1320, 2)).toBeCloseTo(100);
  });

  it('handles zero machines (edge case)', () => {
    // Should be Infinity or NaN — the hook would filter machineCount === 0
    const result = calculateOccupancy(100, 0);
    expect(result).toBe(Infinity);
  });
});

// ===== LOAD BALANCING LOGIC =====
describe('Load Balancing Logic', () => {
  const DAILY_CAPACITY = 11 * 60;

  function isUnbalanced(occupancies: number[]): boolean {
    if (occupancies.length < 2) return false;
    return Math.max(...occupancies) - Math.min(...occupancies) > 30;
  }

  function findMovableSuggestions(
    machines: Array<{ id: string; occupancy: number; availableMinutes: number; jobs: Array<{ id: string; duration: number; status: string; priority: string }> }>
  ) {
    const avg = machines.reduce((s, m) => s + m.occupancy, 0) / machines.length;
    const overloaded = machines.filter(m => m.occupancy > avg + 15).sort((a, b) => b.occupancy - a.occupancy);
    const underloaded = machines.filter(m => m.occupancy < avg - 15 && m.availableMinutes > 60).sort((a, b) => a.occupancy - b.occupancy);

    const suggestions: Array<{ jobId: string; from: string; to: string; diff: number }> = [];

    overloaded.forEach(om => {
      const movable = om.jobs.filter(j => !['production', 'finished'].includes(j.status) && j.priority !== 'urgent');
      movable.forEach(job => {
        const target = underloaded.find(m => m.availableMinutes >= job.duration);
        if (target) {
          suggestions.push({ jobId: job.id, from: om.id, to: target.id, diff: om.occupancy - target.occupancy });
        }
      });
    });

    return suggestions.sort((a, b) => b.diff - a.diff);
  }

  it('detects unbalanced loads (>30% diff)', () => {
    expect(isUnbalanced([90, 20])).toBe(true);
    expect(isUnbalanced([80, 10])).toBe(true);
  });

  it('detects balanced loads (<=30% diff)', () => {
    expect(isUnbalanced([50, 50])).toBe(false);
    expect(isUnbalanced([60, 35])).toBe(false);
  });

  it('single machine is always balanced', () => {
    expect(isUnbalanced([100])).toBe(false);
    expect(isUnbalanced([0])).toBe(false);
  });

  it('suggests moving jobs from overloaded to underloaded', () => {
    const machines = [
      { id: 'm1', occupancy: 95, availableMinutes: 30, jobs: [{ id: 'j1', duration: 60, status: 'scheduled', priority: 'medium' }] },
      { id: 'm2', occupancy: 20, availableMinutes: 500, jobs: [] },
    ];
    const suggestions = findMovableSuggestions(machines);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].from).toBe('m1');
    expect(suggestions[0].to).toBe('m2');
  });

  it('does not suggest moving production jobs', () => {
    const machines = [
      { id: 'm1', occupancy: 95, availableMinutes: 30, jobs: [{ id: 'j1', duration: 60, status: 'production', priority: 'medium' }] },
      { id: 'm2', occupancy: 20, availableMinutes: 500, jobs: [] },
    ];
    expect(findMovableSuggestions(machines)).toHaveLength(0);
  });

  it('does not suggest moving urgent jobs', () => {
    const machines = [
      { id: 'm1', occupancy: 95, availableMinutes: 30, jobs: [{ id: 'j1', duration: 60, status: 'scheduled', priority: 'urgent' }] },
      { id: 'm2', occupancy: 20, availableMinutes: 500, jobs: [] },
    ];
    expect(findMovableSuggestions(machines)).toHaveLength(0);
  });

  it('does not suggest if target has insufficient capacity', () => {
    const machines = [
      { id: 'm1', occupancy: 95, availableMinutes: 30, jobs: [{ id: 'j1', duration: 120, status: 'scheduled', priority: 'medium' }] },
      { id: 'm2', occupancy: 20, availableMinutes: 60, jobs: [] }, // only 60 min, job needs 120
    ];
    // Target needs >60 available minutes but job needs 120
    expect(findMovableSuggestions(machines)).toHaveLength(0);
  });

  it('sorts suggestions by load difference', () => {
    const machines = [
      { id: 'm1', occupancy: 95, availableMinutes: 30, jobs: [
        { id: 'j1', duration: 60, status: 'scheduled', priority: 'medium' },
        { id: 'j2', duration: 30, status: 'scheduled', priority: 'low' },
      ]},
      { id: 'm2', occupancy: 10, availableMinutes: 580, jobs: [] },
    ];
    const suggestions = findMovableSuggestions(machines);
    expect(suggestions.length).toBeGreaterThanOrEqual(1);
    // All suggestions should have same diff since same machines
    suggestions.forEach(s => expect(s.diff).toBe(85));
  });
});

// ===== KANBAN STATUS TRANSITIONS =====
describe('Kanban Status Transitions', () => {
  const validTransitions: Record<string, string[]> = {
    'queue': ['ready', 'cancelled'],
    'ready': ['queue', 'scheduled', 'cancelled'],
    'scheduled': ['ready', 'production', 'cancelled'],
    'production': ['paused', 'finished', 'delayed', 'rework'],
    'paused': ['production', 'cancelled'],
    'delayed': ['production', 'cancelled'],
    'rework': ['production', 'finished', 'cancelled'],
    'finished': [],
    'cancelled': [],
  };

  function isValidTransition(from: string, to: string): boolean {
    return validTransitions[from]?.includes(to) ?? false;
  }

  // Test all valid transitions
  Object.entries(validTransitions).forEach(([from, allowed]) => {
    allowed.forEach(to => {
      it(`allows ${from} -> ${to}`, () => {
        expect(isValidTransition(from, to)).toBe(true);
      });
    });
  });

  // Test invalid transitions
  it('prevents queue -> production (skipping steps)', () => {
    expect(isValidTransition('queue', 'production')).toBe(false);
  });

  it('prevents queue -> finished', () => {
    expect(isValidTransition('queue', 'finished')).toBe(false);
  });

  it('prevents finished -> anything', () => {
    const allStatuses = Object.keys(validTransitions);
    allStatuses.forEach(status => {
      expect(isValidTransition('finished', status)).toBe(false);
    });
  });

  it('prevents cancelled -> anything', () => {
    const allStatuses = Object.keys(validTransitions);
    allStatuses.forEach(status => {
      expect(isValidTransition('cancelled', status)).toBe(false);
    });
  });

  it('handles unknown status', () => {
    expect(isValidTransition('unknown', 'queue')).toBe(false);
  });

  it('all statuses have transition rules', () => {
    const expected = ['queue', 'ready', 'scheduled', 'production', 'finished', 'paused', 'cancelled', 'delayed', 'rework'];
    expected.forEach(status => {
      expect(validTransitions).toHaveProperty(status);
    });
  });

  it('cancelled is reachable from most active states', () => {
    const canCancel = ['queue', 'ready', 'scheduled', 'paused', 'delayed', 'rework'];
    canCancel.forEach(status => {
      expect(isValidTransition(status, 'cancelled')).toBe(true);
    });
  });

  it('production cannot be directly cancelled', () => {
    expect(isValidTransition('production', 'cancelled')).toBe(false);
  });
});
