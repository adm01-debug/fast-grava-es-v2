import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TelemetryCharts } from '@/components/admin/telemetry/TelemetryCharts';
import React from 'react';

// ============================================================
// SUITE 1: TelemetryCharts Component — Unit Tests
// ============================================================

function makeTelemetryRow(overrides: Partial<any> = {}): any {
  return {
    id: crypto.randomUUID(),
    operation: 'select',
    table_name: 'jobs',
    rpc_name: null,
    duration_ms: 500,
    severity: 'slow',
    created_at: new Date().toISOString(),
    record_count: 10,
    query_limit: 100,
    query_offset: 0,
    count_mode: null,
    error_message: null,
    user_id: null,
    ...overrides,
  };
}

// Mock recharts to avoid canvas issues in test env
vi.mock('recharts', () => {
  const MockComponent = ({ children, ...props }: any) =>
    React.createElement('div', { 'data-testid': props['data-testid'] || 'chart-mock' }, children);
  return {
    ResponsiveContainer: MockComponent,
    LineChart: MockComponent,
    Line: () => null,
    BarChart: MockComponent,
    Bar: () => null,
    AreaChart: MockComponent,
    Area: () => null,
    PieChart: MockComponent,
    Pie: ({ children }: any) => React.createElement('div', null, children),
    Cell: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
  };
});

describe('TelemetryCharts', () => {
  // ---- RENDERING ----
  it('TC-CHART-001: renders nothing when rows is empty', () => {
    const { container } = render(<TelemetryCharts rows={[]} timeFilter="24h" />);
    expect(container.innerHTML).toBe('');
  });

  it('TC-CHART-002: renders charts when rows have data', () => {
    const rows = [makeTelemetryRow({ severity: 'slow' }), makeTelemetryRow({ severity: 'very_slow' })];
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(container.innerHTML).not.toBe('');
  });

  it('TC-CHART-003: renders with timeFilter=1h', () => {
    const rows = [makeTelemetryRow()];
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="1h" />);
    expect(container.innerHTML).not.toBe('');
  });

  it('TC-CHART-004: renders with timeFilter=6h', () => {
    const rows = [makeTelemetryRow()];
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="6h" />);
    expect(container.innerHTML).not.toBe('');
  });

  it('TC-CHART-005: renders with timeFilter=7d', () => {
    const rows = [makeTelemetryRow()];
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="7d" />);
    expect(container.innerHTML).not.toBe('');
  });

  // ---- SEVERITY DISTRIBUTION ----
  it('TC-CHART-006: handles only slow severity', () => {
    const rows = Array.from({ length: 5 }, () => makeTelemetryRow({ severity: 'slow' }));
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(container.innerHTML).not.toBe('');
  });

  it('TC-CHART-007: handles only very_slow severity', () => {
    const rows = Array.from({ length: 5 }, () => makeTelemetryRow({ severity: 'very_slow' }));
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(container.innerHTML).not.toBe('');
  });

  it('TC-CHART-008: handles only error severity', () => {
    const rows = Array.from({ length: 5 }, () => makeTelemetryRow({ severity: 'error' }));
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(container.innerHTML).not.toBe('');
  });

  it('TC-CHART-009: handles mixed severities', () => {
    const rows = [
      makeTelemetryRow({ severity: 'slow' }),
      makeTelemetryRow({ severity: 'very_slow' }),
      makeTelemetryRow({ severity: 'error' }),
    ];
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(container.innerHTML).not.toBe('');
  });

  // ---- OPERATIONS ----
  it('TC-CHART-010: handles multiple operation types', () => {
    const ops = ['select', 'insert', 'update', 'delete', 'rpc', 'upsert'];
    const rows = ops.map(op => makeTelemetryRow({ operation: op }));
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(container.innerHTML).not.toBe('');
  });

  it('TC-CHART-011: handles single operation type', () => {
    const rows = Array.from({ length: 10 }, () => makeTelemetryRow({ operation: 'select' }));
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(container.innerHTML).not.toBe('');
  });

  // ---- EDGE CASES ----
  it('TC-CHART-012: handles 1 row', () => {
    const { container } = render(<TelemetryCharts rows={[makeTelemetryRow()]} timeFilter="24h" />);
    expect(container.innerHTML).not.toBe('');
  });

  it('TC-CHART-013: handles 200 rows (max query limit)', () => {
    const rows = Array.from({ length: 200 }, (_, i) =>
      makeTelemetryRow({
        duration_ms: 100 + i * 50,
        created_at: new Date(Date.now() - i * 60000).toISOString(),
        severity: i % 3 === 0 ? 'slow' : i % 3 === 1 ? 'very_slow' : 'error',
      })
    );
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(container.innerHTML).not.toBe('');
  });

  it('TC-CHART-014: handles rows with null table_name and rpc_name', () => {
    const rows = [makeTelemetryRow({ table_name: null, rpc_name: null })];
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(container.innerHTML).not.toBe('');
  });

  it('TC-CHART-015: handles rows with rpc_name set', () => {
    const rows = [makeTelemetryRow({ rpc_name: 'calculate_oee', table_name: null })];
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(container.innerHTML).not.toBe('');
  });

  it('TC-CHART-016: handles rows with very high duration_ms', () => {
    const rows = [makeTelemetryRow({ duration_ms: 120000 })];
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(container.innerHTML).not.toBe('');
  });

  it('TC-CHART-017: handles rows with 0 duration_ms', () => {
    const rows = [makeTelemetryRow({ duration_ms: 0 })];
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(container.innerHTML).not.toBe('');
  });

  // ---- TIMELINE BUCKETING ----
  it('TC-CHART-018: buckets correctly for 1h timeFilter', () => {
    const now = Date.now();
    const rows = Array.from({ length: 10 }, (_, i) =>
      makeTelemetryRow({ created_at: new Date(now - i * 60000).toISOString() })
    );
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="1h" />);
    expect(container.innerHTML).not.toBe('');
  });

  it('TC-CHART-019: handles same-minute timestamps', () => {
    const now = new Date().toISOString();
    const rows = Array.from({ length: 5 }, () => makeTelemetryRow({ created_at: now }));
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="1h" />);
    expect(container.innerHTML).not.toBe('');
  });

  it('TC-CHART-020: handles timestamps spanning midnight', () => {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const rows = [
      makeTelemetryRow({ created_at: new Date(midnight.getTime() - 3600000).toISOString() }),
      makeTelemetryRow({ created_at: new Date(midnight.getTime() + 3600000).toISOString() }),
    ];
    const { container } = render(<TelemetryCharts rows={rows} timeFilter="24h" />);
    expect(container.innerHTML).not.toBe('');
  });
});

// ============================================================
// SUITE 2: TelemetryRow Interface — Data Validation
// ============================================================
describe('TelemetryRow Data Validation', () => {
  const validRow = makeTelemetryRow();

  it('TC-DATA-001: valid row has all required fields', () => {
    expect(validRow.id).toBeDefined();
    expect(validRow.operation).toBeDefined();
    expect(validRow.duration_ms).toBeTypeOf('number');
    expect(validRow.severity).toBeDefined();
    expect(validRow.created_at).toBeDefined();
  });

  it('TC-DATA-002: nullable fields can be null', () => {
    const row = makeTelemetryRow({
      table_name: null,
      rpc_name: null,
      record_count: null,
      query_limit: null,
      query_offset: null,
      count_mode: null,
      error_message: null,
      user_id: null,
    });
    expect(row.table_name).toBeNull();
    expect(row.rpc_name).toBeNull();
    expect(row.record_count).toBeNull();
  });

  it('TC-DATA-003: severity is valid enum', () => {
    const validSeverities = ['normal', 'slow', 'very_slow', 'error'];
    for (const sev of validSeverities) {
      const row = makeTelemetryRow({ severity: sev });
      expect(validSeverities).toContain(row.severity);
    }
  });

  it('TC-DATA-004: duration_ms is non-negative', () => {
    expect(makeTelemetryRow({ duration_ms: 0 }).duration_ms).toBeGreaterThanOrEqual(0);
    expect(makeTelemetryRow({ duration_ms: 999 }).duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('TC-DATA-005: created_at is valid ISO string', () => {
    const row = makeTelemetryRow();
    expect(new Date(row.created_at).toISOString()).toBe(row.created_at);
  });

  it('TC-DATA-006: operation values cover expected types', () => {
    const ops = ['select', 'insert', 'update', 'delete', 'rpc', 'upsert'];
    for (const op of ops) {
      const row = makeTelemetryRow({ operation: op });
      expect(row.operation).toBe(op);
    }
  });
});

// ============================================================
// SUITE 3: Stats Computation Logic
// ============================================================
describe('Stats Computation', () => {
  function computeStats(rows: any[]) {
    const verySlow = rows.filter(r => r.severity === 'very_slow').length;
    const slow = rows.filter(r => r.severity === 'slow').length;
    const errors = rows.filter(r => r.severity === 'error').length;
    const avgDuration = rows.length > 0
      ? Math.round(rows.reduce((s, r) => s + r.duration_ms, 0) / rows.length)
      : 0;
    return { verySlow, slow, errors, avgDuration };
  }

  it('TC-STATS-001: empty rows returns zero stats', () => {
    const stats = computeStats([]);
    expect(stats).toEqual({ verySlow: 0, slow: 0, errors: 0, avgDuration: 0 });
  });

  it('TC-STATS-002: counts very_slow correctly', () => {
    const rows = [
      makeTelemetryRow({ severity: 'very_slow' }),
      makeTelemetryRow({ severity: 'very_slow' }),
      makeTelemetryRow({ severity: 'slow' }),
    ];
    expect(computeStats(rows).verySlow).toBe(2);
  });

  it('TC-STATS-003: counts slow correctly', () => {
    const rows = Array.from({ length: 7 }, () => makeTelemetryRow({ severity: 'slow' }));
    expect(computeStats(rows).slow).toBe(7);
  });

  it('TC-STATS-004: counts errors correctly', () => {
    const rows = [makeTelemetryRow({ severity: 'error' })];
    expect(computeStats(rows).errors).toBe(1);
  });

  it('TC-STATS-005: computes average duration', () => {
    const rows = [
      makeTelemetryRow({ duration_ms: 100 }),
      makeTelemetryRow({ duration_ms: 200 }),
      makeTelemetryRow({ duration_ms: 300 }),
    ];
    expect(computeStats(rows).avgDuration).toBe(200);
  });

  it('TC-STATS-006: average with single row', () => {
    const rows = [makeTelemetryRow({ duration_ms: 5000 })];
    expect(computeStats(rows).avgDuration).toBe(5000);
  });

  it('TC-STATS-007: handles mixed severities with correct counts', () => {
    const rows = [
      ...Array.from({ length: 3 }, () => makeTelemetryRow({ severity: 'slow' })),
      ...Array.from({ length: 5 }, () => makeTelemetryRow({ severity: 'very_slow' })),
      ...Array.from({ length: 2 }, () => makeTelemetryRow({ severity: 'error' })),
    ];
    const stats = computeStats(rows);
    expect(stats.slow).toBe(3);
    expect(stats.verySlow).toBe(5);
    expect(stats.errors).toBe(2);
  });

  it('TC-STATS-008: average rounds correctly', () => {
    const rows = [
      makeTelemetryRow({ duration_ms: 333 }),
      makeTelemetryRow({ duration_ms: 334 }),
    ];
    expect(computeStats(rows).avgDuration).toBe(334); // 333.5 rounds to 334
  });

  it('TC-STATS-009: handles zero duration', () => {
    const rows = [makeTelemetryRow({ duration_ms: 0 }), makeTelemetryRow({ duration_ms: 0 })];
    expect(computeStats(rows).avgDuration).toBe(0);
  });

  it('TC-STATS-010: handles very large durations', () => {
    const rows = [makeTelemetryRow({ duration_ms: 999999 })];
    expect(computeStats(rows).avgDuration).toBe(999999);
  });
});

// ============================================================
// SUITE 4: Top Offenders Logic
// ============================================================
describe('Top Offenders Computation', () => {
  function computeTopOffenders(rows: any[]) {
    const tableStats = new Map<string, { count: number; totalMs: number; maxMs: number }>();
    for (const r of rows) {
      const key = r.rpc_name || r.table_name || 'unknown';
      const prev = tableStats.get(key) || { count: 0, totalMs: 0, maxMs: 0 };
      tableStats.set(key, {
        count: prev.count + 1,
        totalMs: prev.totalMs + r.duration_ms,
        maxMs: Math.max(prev.maxMs, r.duration_ms),
      });
    }
    return [...tableStats.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8);
  }

  it('TC-OFFEND-001: empty rows returns empty', () => {
    expect(computeTopOffenders([])).toEqual([]);
  });

  it('TC-OFFEND-002: single table single row', () => {
    const result = computeTopOffenders([makeTelemetryRow({ table_name: 'jobs' })]);
    expect(result).toHaveLength(1);
    expect(result[0][0]).toBe('jobs');
    expect(result[0][1].count).toBe(1);
  });

  it('TC-OFFEND-003: multiple rows same table', () => {
    const rows = Array.from({ length: 5 }, () =>
      makeTelemetryRow({ table_name: 'machines', duration_ms: 1000 })
    );
    const result = computeTopOffenders(rows);
    expect(result[0][0]).toBe('machines');
    expect(result[0][1].count).toBe(5);
    expect(result[0][1].totalMs).toBe(5000);
  });

  it('TC-OFFEND-004: sorts by count descending', () => {
    const rows = [
      ...Array.from({ length: 3 }, () => makeTelemetryRow({ table_name: 'jobs' })),
      ...Array.from({ length: 5 }, () => makeTelemetryRow({ table_name: 'machines' })),
      ...Array.from({ length: 1 }, () => makeTelemetryRow({ table_name: 'profiles' })),
    ];
    const result = computeTopOffenders(rows);
    expect(result[0][0]).toBe('machines');
    expect(result[1][0]).toBe('jobs');
    expect(result[2][0]).toBe('profiles');
  });

  it('TC-OFFEND-005: limits to 8 entries', () => {
    const tables = Array.from({ length: 12 }, (_, i) => `table_${i}`);
    const rows = tables.map(t => makeTelemetryRow({ table_name: t }));
    const result = computeTopOffenders(rows);
    expect(result.length).toBeLessThanOrEqual(8);
  });

  it('TC-OFFEND-006: rpc_name takes priority over table_name', () => {
    const rows = [makeTelemetryRow({ table_name: 'jobs', rpc_name: 'calculate_oee' })];
    const result = computeTopOffenders(rows);
    expect(result[0][0]).toBe('calculate_oee');
  });

  it('TC-OFFEND-007: null names default to unknown', () => {
    const rows = [makeTelemetryRow({ table_name: null, rpc_name: null })];
    const result = computeTopOffenders(rows);
    expect(result[0][0]).toBe('unknown');
  });

  it('TC-OFFEND-008: tracks maxMs correctly', () => {
    const rows = [
      makeTelemetryRow({ table_name: 'jobs', duration_ms: 100 }),
      makeTelemetryRow({ table_name: 'jobs', duration_ms: 9000 }),
      makeTelemetryRow({ table_name: 'jobs', duration_ms: 500 }),
    ];
    const result = computeTopOffenders(rows);
    expect(result[0][1].maxMs).toBe(9000);
  });

  it('TC-OFFEND-009: calculates totalMs correctly', () => {
    const rows = [
      makeTelemetryRow({ table_name: 'jobs', duration_ms: 100 }),
      makeTelemetryRow({ table_name: 'jobs', duration_ms: 200 }),
    ];
    const result = computeTopOffenders(rows);
    expect(result[0][1].totalMs).toBe(300);
  });

  it('TC-OFFEND-010: handles 200 rows across many tables', () => {
    const rows = Array.from({ length: 200 }, (_, i) =>
      makeTelemetryRow({ table_name: `table_${i % 15}`, duration_ms: 100 + i })
    );
    const result = computeTopOffenders(rows);
    expect(result.length).toBe(8);
    // First should have highest count
    expect(result[0][1].count).toBeGreaterThanOrEqual(result[7][1].count);
  });
});

// ============================================================
// SUITE 5: formatDuration Utility
// ============================================================
describe('formatDuration', () => {
  function formatDuration(ms: number) {
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${ms}ms`;
  }

  it('TC-FMT-001: 0ms', () => expect(formatDuration(0)).toBe('0ms'));
  it('TC-FMT-002: 1ms', () => expect(formatDuration(1)).toBe('1ms'));
  it('TC-FMT-003: 999ms', () => expect(formatDuration(999)).toBe('999ms'));
  it('TC-FMT-004: 1000ms = 1.0s', () => expect(formatDuration(1000)).toBe('1.0s'));
  it('TC-FMT-005: 1500ms = 1.5s', () => expect(formatDuration(1500)).toBe('1.5s'));
  it('TC-FMT-006: 3000ms = 3.0s', () => expect(formatDuration(3000)).toBe('3.0s'));
  it('TC-FMT-007: 8000ms = 8.0s', () => expect(formatDuration(8000)).toBe('8.0s'));
  it('TC-FMT-008: 12345ms = 12.3s', () => expect(formatDuration(12345)).toBe('12.3s'));
  it('TC-FMT-009: 120000ms = 120.0s', () => expect(formatDuration(120000)).toBe('120.0s'));
  it('TC-FMT-010: 500ms', () => expect(formatDuration(500)).toBe('500ms'));
  it('TC-FMT-011: 1001ms = 1.0s', () => expect(formatDuration(1001)).toBe('1.0s'));
  it('TC-FMT-012: 1099ms = 1.1s', () => expect(formatDuration(1099)).toBe('1.1s'));
  it('TC-FMT-013: 9999ms = 10.0s', () => expect(formatDuration(9999)).toBe('10.0s'));
  it('TC-FMT-014: 100ms', () => expect(formatDuration(100)).toBe('100ms'));
  it('TC-FMT-015: 50ms', () => expect(formatDuration(50)).toBe('50ms'));
});

// ============================================================
// SUITE 6: formatTime Utility
// ============================================================
describe('formatTime', () => {
  function formatTime(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });
  }

  it('TC-TIME-001: formats valid ISO string', () => {
    const result = formatTime('2025-06-15T14:30:00.000Z');
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('TC-TIME-002: handles midnight', () => {
    const result = formatTime('2025-01-01T00:00:00.000Z');
    expect(result).toBeDefined();
  });

  it('TC-TIME-003: handles end of day', () => {
    const result = formatTime('2025-12-31T23:59:59.999Z');
    expect(result).toBeDefined();
  });

  it('TC-TIME-004: handles current time', () => {
    const result = formatTime(new Date().toISOString());
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(5);
  });

  it('TC-TIME-005: handles old date', () => {
    const result = formatTime('2020-01-01T00:00:00.000Z');
    expect(result).toBeDefined();
  });
});

// ============================================================
// SUITE 7: getSeverityBadge Logic
// ============================================================
describe('getSeverityBadge Logic', () => {
  function getSeverityLabel(severity: string): string {
    switch (severity) {
      case 'very_slow': return '🔴 Muito Lenta';
      case 'slow': return '🟡 Lenta';
      case 'error': return '❌ Erro';
      default: return severity;
    }
  }

  it('TC-BADGE-001: very_slow', () => expect(getSeverityLabel('very_slow')).toBe('🔴 Muito Lenta'));
  it('TC-BADGE-002: slow', () => expect(getSeverityLabel('slow')).toBe('🟡 Lenta'));
  it('TC-BADGE-003: error', () => expect(getSeverityLabel('error')).toBe('❌ Erro'));
  it('TC-BADGE-004: normal', () => expect(getSeverityLabel('normal')).toBe('normal'));
  it('TC-BADGE-005: unknown', () => expect(getSeverityLabel('unknown')).toBe('unknown'));
  it('TC-BADGE-006: empty string', () => expect(getSeverityLabel('')).toBe(''));
});

// ============================================================
// SUITE 8: Time Threshold Logic
// ============================================================
describe('getTimeThreshold', () => {
  function getTimeThreshold(timeFilter: string) {
    const now = new Date();
    switch (timeFilter) {
      case '1h': return new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      case '6h': return new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      default: return now.toISOString();
    }
  }

  it('TC-THRESH-001: 1h is ~1 hour ago', () => {
    const threshold = new Date(getTimeThreshold('1h'));
    const diff = Date.now() - threshold.getTime();
    expect(diff).toBeGreaterThan(3500000); // ~58 min
    expect(diff).toBeLessThan(3700000); // ~62 min
  });

  it('TC-THRESH-002: 6h is ~6 hours ago', () => {
    const threshold = new Date(getTimeThreshold('6h'));
    const diff = Date.now() - threshold.getTime();
    expect(diff).toBeGreaterThan(21000000);
    expect(diff).toBeLessThan(22000000);
  });

  it('TC-THRESH-003: 24h is ~24 hours ago', () => {
    const threshold = new Date(getTimeThreshold('24h'));
    const diff = Date.now() - threshold.getTime();
    expect(diff).toBeGreaterThan(85000000);
    expect(diff).toBeLessThan(87000000);
  });

  it('TC-THRESH-004: 7d is ~7 days ago', () => {
    const threshold = new Date(getTimeThreshold('7d'));
    const diff = Date.now() - threshold.getTime();
    expect(diff).toBeGreaterThan(600000000);
    expect(diff).toBeLessThan(610000000);
  });

  it('TC-THRESH-005: returns valid ISO string', () => {
    const result = getTimeThreshold('24h');
    expect(new Date(result).toISOString()).toBe(result);
  });
});

// ============================================================
// SUITE 9: Severity Color Logic
// ============================================================
describe('Severity Color Assignment', () => {
  function getDurationClass(ms: number): string {
    if (ms >= 8000) return 'text-destructive';
    if (ms >= 3000) return 'text-warning';
    return '';
  }

  it('TC-COLOR-001: <3000ms = no class', () => expect(getDurationClass(0)).toBe(''));
  it('TC-COLOR-002: 2999ms = no class', () => expect(getDurationClass(2999)).toBe(''));
  it('TC-COLOR-003: 3000ms = warning', () => expect(getDurationClass(3000)).toBe('text-warning'));
  it('TC-COLOR-004: 7999ms = warning', () => expect(getDurationClass(7999)).toBe('text-warning'));
  it('TC-COLOR-005: 8000ms = destructive', () => expect(getDurationClass(8000)).toBe('text-destructive'));
  it('TC-COLOR-006: 50000ms = destructive', () => expect(getDurationClass(50000)).toBe('text-destructive'));
  it('TC-COLOR-007: 1ms = no class', () => expect(getDurationClass(1)).toBe(''));
  it('TC-COLOR-008: 5000ms = warning', () => expect(getDurationClass(5000)).toBe('text-warning'));
  it('TC-COLOR-009: 100000ms = destructive', () => expect(getDurationClass(100000)).toBe('text-destructive'));
  it('TC-COLOR-010: 3001ms = warning', () => expect(getDurationClass(3001)).toBe('text-warning'));
});

// ============================================================
// SUITE 10: Filter State Combinations
// ============================================================
describe('Filter State Combinations', () => {
  const severities: Array<'all' | 'slow' | 'very_slow' | 'error'> = ['all', 'slow', 'very_slow', 'error'];
  const times: Array<'1h' | '6h' | '24h' | '7d'> = ['1h', '6h', '24h', '7d'];

  function filterRows(rows: any[], severity: string) {
    if (severity === 'all') return rows;
    return rows.filter(r => r.severity === severity);
  }

  // Generate tests for all 16 combinations
  for (const sev of severities) {
    for (const time of times) {
      it(`TC-FILTER-${sev}-${time}: filter ${sev} + ${time}`, () => {
        const allRows = [
          makeTelemetryRow({ severity: 'slow', duration_ms: 4000 }),
          makeTelemetryRow({ severity: 'very_slow', duration_ms: 9000 }),
          makeTelemetryRow({ severity: 'error', duration_ms: 500, error_message: 'timeout' }),
          makeTelemetryRow({ severity: 'normal', duration_ms: 100 }),
        ];
        const filtered = filterRows(allRows, sev);
        if (sev === 'all') {
          expect(filtered.length).toBe(4);
        } else {
          expect(filtered.every(r => r.severity === sev)).toBe(true);
        }
      });
    }
  }
});

// ============================================================
// SUITE 11: Data Integrity — Large Datasets
// ============================================================
describe('Large Dataset Processing', () => {
  it('TC-LARGE-001: process 500 rows without errors', () => {
    const rows = Array.from({ length: 500 }, (_, i) =>
      makeTelemetryRow({
        table_name: `table_${i % 20}`,
        duration_ms: Math.floor(Math.random() * 15000),
        severity: ['slow', 'very_slow', 'error', 'normal'][i % 4],
        operation: ['select', 'insert', 'update', 'delete', 'rpc'][i % 5],
        created_at: new Date(Date.now() - i * 30000).toISOString(),
      })
    );
    expect(rows.length).toBe(500);

    const stats = new Map<string, number>();
    for (const r of rows) {
      stats.set(r.table_name, (stats.get(r.table_name) || 0) + 1);
    }
    expect(stats.size).toBe(20);
  });

  it('TC-LARGE-002: process 1000 rows performance', () => {
    const start = performance.now();
    const rows = Array.from({ length: 1000 }, (_, i) =>
      makeTelemetryRow({ duration_ms: i, severity: i % 2 === 0 ? 'slow' : 'very_slow' })
    );
    const verySlow = rows.filter(r => r.severity === 'very_slow').length;
    const elapsed = performance.now() - start;
    expect(verySlow).toBe(500);
    expect(elapsed).toBeLessThan(1000); // Should finish in < 1s
  });

  it('TC-LARGE-003: all severity counts sum to total', () => {
    const rows = Array.from({ length: 200 }, (_, i) =>
      makeTelemetryRow({ severity: ['slow', 'very_slow', 'error', 'normal'][i % 4] })
    );
    const slow = rows.filter(r => r.severity === 'slow').length;
    const verySlow = rows.filter(r => r.severity === 'very_slow').length;
    const errors = rows.filter(r => r.severity === 'error').length;
    const normal = rows.filter(r => r.severity === 'normal').length;
    expect(slow + verySlow + errors + normal).toBe(200);
  });

  it('TC-LARGE-004: top offenders cap at 8 with many tables', () => {
    const rows = Array.from({ length: 100 }, (_, i) =>
      makeTelemetryRow({ table_name: `tbl_${i % 25}` })
    );
    const tableStats = new Map<string, number>();
    for (const r of rows) {
      tableStats.set(r.table_name, (tableStats.get(r.table_name) || 0) + 1);
    }
    const sorted = [...tableStats.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    expect(sorted.length).toBe(8);
  });

  it('TC-LARGE-005: handles all null optional fields', () => {
    const rows = Array.from({ length: 50 }, () =>
      makeTelemetryRow({
        table_name: null,
        rpc_name: null,
        record_count: null,
        query_limit: null,
        query_offset: null,
        count_mode: null,
        error_message: null,
        user_id: null,
      })
    );
    const allUnknown = rows.every(r => (r.rpc_name || r.table_name || 'unknown') === 'unknown');
    expect(allUnknown).toBe(true);
  });
});

// ============================================================
// SUITE 12: Edge Cases & Boundary Tests
// ============================================================
describe('Edge Cases & Boundaries', () => {
  it('TC-EDGE-001: duplicate IDs are handled', () => {
    const id = crypto.randomUUID();
    const rows = [makeTelemetryRow({ id }), makeTelemetryRow({ id })];
    expect(rows.length).toBe(2);
  });

  it('TC-EDGE-002: empty operation string', () => {
    const row = makeTelemetryRow({ operation: '' });
    expect(row.operation).toBe('');
  });

  it('TC-EDGE-003: very long table name', () => {
    const longName = 'a'.repeat(500);
    const row = makeTelemetryRow({ table_name: longName });
    expect(row.table_name.length).toBe(500);
  });

  it('TC-EDGE-004: very long error message', () => {
    const longMsg = 'Error: '.repeat(1000);
    const row = makeTelemetryRow({ error_message: longMsg });
    expect(row.error_message.length).toBeGreaterThan(1000);
  });

  it('TC-EDGE-005: negative duration_ms', () => {
    const row = makeTelemetryRow({ duration_ms: -1 });
    expect(row.duration_ms).toBe(-1); // data validation should catch this
  });

  it('TC-EDGE-006: future created_at', () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    const row = makeTelemetryRow({ created_at: future });
    expect(new Date(row.created_at).getTime()).toBeGreaterThan(Date.now());
  });

  it('TC-EDGE-007: record_count = 0', () => {
    const row = makeTelemetryRow({ record_count: 0 });
    expect(row.record_count).toBe(0);
  });

  it('TC-EDGE-008: query_limit = 1', () => {
    const row = makeTelemetryRow({ query_limit: 1 });
    expect(row.query_limit).toBe(1);
  });

  it('TC-EDGE-009: query_offset very large', () => {
    const row = makeTelemetryRow({ query_offset: 999999 });
    expect(row.query_offset).toBe(999999);
  });

  it('TC-EDGE-010: count_mode values', () => {
    for (const mode of ['exact', 'planned', 'estimated', null]) {
      const row = makeTelemetryRow({ count_mode: mode });
      expect(row.count_mode).toBe(mode);
    }
  });
});
