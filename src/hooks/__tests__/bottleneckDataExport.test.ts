import { describe, it, expect } from 'vitest';

// ===== BOTTLENECK THRESHOLDS =====
describe('Bottleneck Threshold Classification', () => {
  const CRITICAL_THRESHOLD = 90;
  const WARNING_THRESHOLD = 75;

  function classifyCapacity(occupancyRate: number, projectedOccupancy: number, dayOffset: number): string | null {
    if (occupancyRate >= CRITICAL_THRESHOLD) return 'critical';
    if (occupancyRate >= WARNING_THRESHOLD) return 'warning';
    if (projectedOccupancy >= CRITICAL_THRESHOLD && dayOffset < 2) return 'info';
    return null;
  }

  it('critical at 90%+', () => {
    expect(classifyCapacity(90, 90, 0)).toBe('critical');
    expect(classifyCapacity(95, 100, 0)).toBe('critical');
    expect(classifyCapacity(100, 100, 0)).toBe('critical');
  });

  it('warning at 75-89%', () => {
    expect(classifyCapacity(75, 75, 0)).toBe('warning');
    expect(classifyCapacity(89, 89, 0)).toBe('warning');
  });

  it('info when projected critical within 2 days', () => {
    expect(classifyCapacity(50, 95, 0)).toBe('info');
    expect(classifyCapacity(50, 95, 1)).toBe('info');
  });

  it('no alert for projected critical beyond 2 days', () => {
    expect(classifyCapacity(50, 95, 2)).toBeNull();
    expect(classifyCapacity(50, 95, 3)).toBeNull();
  });

  it('no alert when both below thresholds', () => {
    expect(classifyCapacity(50, 70, 0)).toBeNull();
    expect(classifyCapacity(0, 0, 0)).toBeNull();
  });

  it('critical overrides projected info', () => {
    // When current is already critical, don't show info
    expect(classifyCapacity(92, 98, 0)).toBe('critical');
  });

  it('warning overrides projected info', () => {
    expect(classifyCapacity(80, 95, 0)).toBe('warning');
  });
});

// ===== CAPACITY CALCULATION =====
describe('Capacity Calculation per Technique', () => {
  const DAILY_CAPACITY_MINUTES = 11 * 60; // 660

  function calculateCapacity(params: {
    machineCount: number;
    scheduledMinutes: number;
    pendingMinutes: number;
  }) {
    const totalCapacity = params.machineCount * DAILY_CAPACITY_MINUTES;
    const occupancyRate = totalCapacity > 0 ? (params.scheduledMinutes / totalCapacity) * 100 : 0;
    const projectedOccupancy = totalCapacity > 0 ? ((params.scheduledMinutes + params.pendingMinutes) / totalCapacity) * 100 : 0;
    return { totalCapacity, occupancyRate, projectedOccupancy };
  }

  it('single machine, half full', () => {
    const { totalCapacity, occupancyRate } = calculateCapacity({ machineCount: 1, scheduledMinutes: 330, pendingMinutes: 0 });
    expect(totalCapacity).toBe(660);
    expect(occupancyRate).toBeCloseTo(50, 0);
  });

  it('two machines, distributed load', () => {
    const { totalCapacity, occupancyRate } = calculateCapacity({ machineCount: 2, scheduledMinutes: 660, pendingMinutes: 0 });
    expect(totalCapacity).toBe(1320);
    expect(occupancyRate).toBeCloseTo(50, 0);
  });

  it('projected includes pending', () => {
    const { occupancyRate, projectedOccupancy } = calculateCapacity({ machineCount: 1, scheduledMinutes: 330, pendingMinutes: 200 });
    expect(projectedOccupancy).toBeGreaterThan(occupancyRate);
    expect(projectedOccupancy).toBeCloseTo((530 / 660) * 100, 0);
  });

  it('zero machines returns 0%', () => {
    const { occupancyRate, projectedOccupancy } = calculateCapacity({ machineCount: 0, scheduledMinutes: 100, pendingMinutes: 50 });
    expect(occupancyRate).toBe(0);
    expect(projectedOccupancy).toBe(0);
  });

  it('can exceed 100%', () => {
    const { occupancyRate } = calculateCapacity({ machineCount: 1, scheduledMinutes: 800, pendingMinutes: 0 });
    expect(occupancyRate).toBeGreaterThan(100);
  });
});

// ===== ALERT SEVERITY SORTING =====
describe('Alert Severity Sorting', () => {
  const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2 };

  function sortAlerts<T extends { severity: string; date: Date }>(alerts: T[]): T[] {
    return [...alerts].sort((a, b) => {
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return a.date.getTime() - b.date.getTime();
    });
  }

  it('critical before warning before info', () => {
    const alerts = [
      { severity: 'info', date: new Date('2026-03-15') },
      { severity: 'critical', date: new Date('2026-03-15') },
      { severity: 'warning', date: new Date('2026-03-15') },
    ];
    const sorted = sortAlerts(alerts);
    expect(sorted[0].severity).toBe('critical');
    expect(sorted[1].severity).toBe('warning');
    expect(sorted[2].severity).toBe('info');
  });

  it('same severity: earlier date first', () => {
    const alerts = [
      { severity: 'warning', date: new Date('2026-03-17') },
      { severity: 'warning', date: new Date('2026-03-15') },
      { severity: 'warning', date: new Date('2026-03-16') },
    ];
    const sorted = sortAlerts(alerts);
    expect(sorted[0].date.getDate()).toBe(15);
    expect(sorted[1].date.getDate()).toBe(16);
    expect(sorted[2].date.getDate()).toBe(17);
  });

  it('handles empty', () => {
    expect(sortAlerts([])).toEqual([]);
  });
});

// ===== DATE LABEL GENERATION =====
describe('Date Label Generation', () => {
  function getDateLabel(dayOffset: number, date: Date): string {
    if (dayOffset === 0) return 'Hoje';
    if (dayOffset === 1) return 'Amanhã';
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  it('today', () => {
    expect(getDateLabel(0, new Date())).toBe('Hoje');
  });

  it('tomorrow', () => {
    expect(getDateLabel(1, new Date())).toBe('Amanhã');
  });

  it('day after tomorrow shows dd/MM', () => {
    const date = new Date('2026-03-20');
    expect(getDateLabel(2, date)).toBe('20/03');
  });

  it('pads single-digit day and month', () => {
    const date = new Date('2026-01-05');
    expect(getDateLabel(3, date)).toBe('05/01');
  });
});

// ===== JOB STATUS FILTERING FOR CAPACITY =====
describe('Job Status Filtering for Capacity', () => {
  function shouldIncludeInCapacity(status: string): boolean {
    return !['finished', 'cancelled'].includes(status);
  }

  function isPendingJob(status: string, scheduledDate: string | null): boolean {
    if (['finished', 'cancelled', 'paused'].includes(status)) return false;
    return ['queue', 'ready'].includes(status) && !scheduledDate;
  }

  it('includes active statuses', () => {
    expect(shouldIncludeInCapacity('scheduled')).toBe(true);
    expect(shouldIncludeInCapacity('production')).toBe(true);
    expect(shouldIncludeInCapacity('queue')).toBe(true);
    expect(shouldIncludeInCapacity('ready')).toBe(true);
    expect(shouldIncludeInCapacity('paused')).toBe(true);
  });

  it('excludes terminal statuses', () => {
    expect(shouldIncludeInCapacity('finished')).toBe(false);
    expect(shouldIncludeInCapacity('cancelled')).toBe(false);
  });

  it('queue without date is pending', () => {
    expect(isPendingJob('queue', null)).toBe(true);
    expect(isPendingJob('ready', null)).toBe(true);
  });

  it('queue with date is NOT pending', () => {
    expect(isPendingJob('queue', '2026-03-15')).toBe(false);
  });

  it('paused jobs are NOT pending', () => {
    expect(isPendingJob('paused', null)).toBe(false);
  });

  it('production jobs are NOT pending', () => {
    expect(isPendingJob('production', null)).toBe(false);
  });
});

// ===== CSV GENERATION =====
describe('CSV Generation', () => {
  function convertToCSV(data: Record<string, unknown>[], columns?: string[]): string {
    if (data.length === 0) return '';
    const keys = columns ?? Object.keys(data[0]);
    const header = keys.join(',');
    const rows = data.map(row =>
      keys.map(key => {
        const value = row[key];
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    );
    return [header, ...rows].join('\n');
  }

  it('generates header from keys', () => {
    const csv = convertToCSV([{ name: 'Test', value: 1 }]);
    expect(csv.split('\n')[0]).toBe('name,value');
  });

  it('generates rows', () => {
    const csv = convertToCSV([
      { name: 'A', value: 1 },
      { name: 'B', value: 2 },
    ]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3); // header + 2 rows
    expect(lines[1]).toBe('A,1');
    expect(lines[2]).toBe('B,2');
  });

  it('handles null/undefined values', () => {
    const csv = convertToCSV([{ name: null as unknown, value: undefined as unknown }]);
    expect(csv.split('\n')[1]).toBe(',');
  });

  it('escapes commas', () => {
    const csv = convertToCSV([{ name: 'hello, world' }]);
    expect(csv.split('\n')[1]).toBe('"hello, world"');
  });

  it('escapes quotes', () => {
    const csv = convertToCSV([{ name: 'say "hi"' }]);
    expect(csv.split('\n')[1]).toBe('"say ""hi"""');
  });

  it('escapes newlines', () => {
    const csv = convertToCSV([{ name: 'line1\nline2' }]);
    expect(csv.split('\n')[1]).toBe('"line1');
    // Note: the CSV contains a literal newline in the quoted field
  });

  it('respects column filter', () => {
    const csv = convertToCSV([{ a: 1, b: 2, c: 3 }], ['a', 'c']);
    expect(csv.split('\n')[0]).toBe('a,c');
    expect(csv.split('\n')[1]).toBe('1,3');
  });

  it('returns empty for empty data', () => {
    expect(convertToCSV([])).toBe('');
  });

  it('handles boolean values', () => {
    const csv = convertToCSV([{ active: true, deleted: false }]);
    expect(csv.split('\n')[1]).toBe('true,false');
  });

  it('handles arrays as strings', () => {
    const csv = convertToCSV([{ tags: [1, 2, 3] }]);
    expect(csv.split('\n')[1]).toBe('"1,2,3"'); // Array.toString() contains commas
  });

  it('handles objects as strings', () => {
    const csv = convertToCSV([{ meta: { key: 'val' } }]);
    expect(csv.split('\n')[1]).toBe('[object Object]');
  });

  it('handles large dataset', () => {
    const data = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
    const csv = convertToCSV(data);
    expect(csv.split('\n')).toHaveLength(1001);
  });
});

// ===== BOTTLENECK RECOMMENDATION MESSAGES =====
describe('Bottleneck Recommendation Generation', () => {
  function generateRecommendation(severity: string, jobCount: number, pendingCount: number): string {
    if (severity === 'critical') {
      const movable = jobCount - Math.floor(jobCount * 0.7);
      return `Considere redistribuir ${movable} jobs para outras datas ou técnicas alternativas`;
    }
    if (severity === 'warning') {
      return 'Monitore novos agendamentos para esta técnica';
    }
    return `${pendingCount} jobs na fila aguardam agendamento - distribua em datas alternativas`;
  }

  it('critical: suggests redistribution', () => {
    const rec = generateRecommendation('critical', 10, 5);
    expect(rec).toContain('redistribuir');
    expect(rec).toContain('3'); // 10 - floor(7) = 3
  });

  it('warning: suggests monitoring', () => {
    const rec = generateRecommendation('warning', 5, 2);
    expect(rec).toContain('Monitore');
  });

  it('info: mentions pending queue', () => {
    const rec = generateRecommendation('info', 5, 8);
    expect(rec).toContain('8 jobs na fila');
  });

  it('critical redistribution scales with job count', () => {
    const rec5 = generateRecommendation('critical', 5, 0);
    const rec20 = generateRecommendation('critical', 20, 0);
    // 5 - floor(3.5) = 2 vs 20 - floor(14) = 6
    expect(rec5).toContain('2');
    expect(rec20).toContain('6');
  });
});

// ===== DAYS AHEAD ANALYSIS =====
describe('Days Ahead Analysis Window', () => {
  const DAYS_AHEAD = 5;

  function generateDateRange(startDate: Date, days: number): string[] {
    const dates: string[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }

  it('generates 5 dates starting from today', () => {
    const dates = generateDateRange(new Date('2026-03-15'), DAYS_AHEAD);
    expect(dates).toHaveLength(5);
    expect(dates[0]).toBe('2026-03-15');
    expect(dates[4]).toBe('2026-03-19');
  });

  it('handles month boundary', () => {
    const dates = generateDateRange(new Date('2026-03-29'), DAYS_AHEAD);
    expect(dates[2]).toBe('2026-03-31');
    expect(dates[3]).toBe('2026-04-01');
  });

  it('handles year boundary', () => {
    const dates = generateDateRange(new Date('2026-12-30'), DAYS_AHEAD);
    expect(dates[2]).toBe('2027-01-01');
  });
});

// ===== PRODUCTIVITY REPORT FORMAT VALUES =====
describe('Productivity Report Value Formatting', () => {
  function formatValue(val: number, type: string): string {
    if (type === 'efficiency' || type === 'loss_rate') return `${val.toFixed(1)}%`;
    return val.toLocaleString('pt-BR');
  }

  it('formats percentage types', () => {
    expect(formatValue(85.7, 'efficiency')).toBe('85.7%');
    expect(formatValue(3.2, 'loss_rate')).toBe('3.2%');
  });

  it('formats count types with locale', () => {
    const result = formatValue(1500, 'pieces_produced');
    // pt-BR uses dots as thousands separator
    expect(result).toMatch(/1[\.\,]?500/);
  });

  it('handles zero', () => {
    expect(formatValue(0, 'efficiency')).toBe('0.0%');
  });

  it('handles decimal precision', () => {
    expect(formatValue(99.999, 'efficiency')).toBe('100.0%');
    expect(formatValue(0.1, 'loss_rate')).toBe('0.1%');
  });
});

// ===== EFFICIENCY COLOR CODING =====
describe('Efficiency Color Coding', () => {
  function getEfficiencyColor(value: number): string {
    if (value >= 80) return 'green';
    if (value >= 60) return 'yellow';
    return 'red';
  }

  it('green for 80%+', () => {
    expect(getEfficiencyColor(80)).toBe('green');
    expect(getEfficiencyColor(95)).toBe('green');
    expect(getEfficiencyColor(100)).toBe('green');
  });

  it('yellow for 60-79%', () => {
    expect(getEfficiencyColor(60)).toBe('yellow');
    expect(getEfficiencyColor(79)).toBe('yellow');
  });

  it('red for <60%', () => {
    expect(getEfficiencyColor(59)).toBe('red');
    expect(getEfficiencyColor(0)).toBe('red');
    expect(getEfficiencyColor(30)).toBe('red');
  });

  it('boundary cases', () => {
    expect(getEfficiencyColor(79.9)).toBe('yellow');
    expect(getEfficiencyColor(80)).toBe('green');
    expect(getEfficiencyColor(59.9)).toBe('red');
    expect(getEfficiencyColor(60)).toBe('yellow');
  });
});
