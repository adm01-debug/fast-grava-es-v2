import { describe, it, expect } from 'vitest';

// ===== ORPHANED DATA DETECTION =====
describe('Orphaned Technique Detection', () => {
  interface MockTechnique { id: string; name: string }
  interface MockMachine { id: string; technique_id: string }
  interface MockJob { id: string; technique_id: string; status: string; machine_id: string | null }

  function detectOrphanedTechniques(
    techniques: MockTechnique[],
    machines: MockMachine[],
    jobs: MockJob[]
  ) {
    const orphaned: Array<{ technique: MockTechnique; jobCount: number; activeJobCount: number }> = [];
    const issues: Array<{ type: string; severity: string; message: string; affectedIds: string[] }> = [];

    techniques.forEach(technique => {
      const techniqueMachines = machines.filter(m => m.technique_id === technique.id);
      const techniqueJobs = jobs.filter(j => j.technique_id === technique.id);
      const activeJobs = techniqueJobs.filter(j => !['finished', 'cancelled'].includes(j.status));

      if (techniqueMachines.length === 0 && techniqueJobs.length > 0) {
        orphaned.push({
          technique,
          jobCount: techniqueJobs.length,
          activeJobCount: activeJobs.length,
        });

        if (activeJobs.length > 0) {
          issues.push({
            type: 'orphaned_technique',
            severity: 'error',
            message: `Técnica "${technique.name}" tem ${activeJobs.length} job(s) ativo(s) sem máquina`,
            affectedIds: activeJobs.map(j => j.id),
          });
        }
      }
    });

    return { orphaned, issues };
  }

  it('detects technique with jobs but no machines', () => {
    const result = detectOrphanedTechniques(
      [{ id: 'silk', name: 'Silk' }],
      [], // no machines
      [{ id: 'j1', technique_id: 'silk', status: 'queue', machine_id: null }]
    );
    expect(result.orphaned).toHaveLength(1);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].severity).toBe('error');
  });

  it('no orphans when machines exist', () => {
    const result = detectOrphanedTechniques(
      [{ id: 'silk', name: 'Silk' }],
      [{ id: 'm1', technique_id: 'silk' }],
      [{ id: 'j1', technique_id: 'silk', status: 'queue', machine_id: 'm1' }]
    );
    expect(result.orphaned).toHaveLength(0);
    expect(result.issues).toHaveLength(0);
  });

  it('no issue for finished/cancelled jobs without machines', () => {
    const result = detectOrphanedTechniques(
      [{ id: 'silk', name: 'Silk' }],
      [],
      [
        { id: 'j1', technique_id: 'silk', status: 'finished', machine_id: null },
        { id: 'j2', technique_id: 'silk', status: 'cancelled', machine_id: null },
      ]
    );
    expect(result.orphaned).toHaveLength(1); // still orphaned
    expect(result.issues).toHaveLength(0); // but no error since no active jobs
  });

  it('no orphans when no jobs for technique', () => {
    const result = detectOrphanedTechniques(
      [{ id: 'silk', name: 'Silk' }],
      [],
      []
    );
    expect(result.orphaned).toHaveLength(0);
  });

  it('multiple techniques, mixed results', () => {
    const result = detectOrphanedTechniques(
      [{ id: 'silk', name: 'Silk' }, { id: 'laser', name: 'Laser' }],
      [{ id: 'm1', technique_id: 'laser' }],
      [
        { id: 'j1', technique_id: 'silk', status: 'production', machine_id: null },
        { id: 'j2', technique_id: 'laser', status: 'queue', machine_id: 'm1' },
      ]
    );
    expect(result.orphaned).toHaveLength(1);
    expect(result.orphaned[0].technique.id).toBe('silk');
  });
});

// ===== PRODUCTION WITHOUT MACHINE =====
describe('Production Without Machine Detection', () => {
  interface MockJob { id: string; status: string; machine_id: string | null }

  function detectProductionWithoutMachine(jobs: MockJob[]) {
    const affected = jobs.filter(j => j.status === 'production' && !j.machine_id);
    if (affected.length === 0) return null;
    return {
      type: 'production_without_machine',
      severity: 'warning',
      count: affected.length,
      affectedIds: affected.map(j => j.id),
    };
  }

  it('detects production jobs without machine', () => {
    const result = detectProductionWithoutMachine([
      { id: 'j1', status: 'production', machine_id: null },
      { id: 'j2', status: 'production', machine_id: 'm1' },
    ]);
    expect(result).not.toBeNull();
    expect(result!.count).toBe(1);
    expect(result!.affectedIds).toEqual(['j1']);
  });

  it('returns null when all have machines', () => {
    const result = detectProductionWithoutMachine([
      { id: 'j1', status: 'production', machine_id: 'm1' },
    ]);
    expect(result).toBeNull();
  });

  it('ignores non-production jobs', () => {
    const result = detectProductionWithoutMachine([
      { id: 'j1', status: 'queue', machine_id: null },
      { id: 'j2', status: 'scheduled', machine_id: null },
    ]);
    expect(result).toBeNull();
  });
});

// ===== RECORD DUPLICATION =====
describe('Record Duplication Logic', () => {
  const DEFAULT_EXCLUDE = ['id', 'created_at', 'updated_at'];

  function prepareRecordForDuplication(
    record: Record<string, unknown>,
    excludeFields: string[] = [],
    overrides: Record<string, unknown> = {}
  ): Record<string, unknown> {
    const allExclude = [...DEFAULT_EXCLUDE, ...excludeFields];
    const duplicate: Record<string, unknown> = {};

    Object.entries(record).forEach(([key, value]) => {
      if (!allExclude.includes(key)) {
        duplicate[key] = value;
      }
    });

    Object.assign(duplicate, overrides);
    return duplicate;
  }

  it('excludes id, created_at, updated_at by default', () => {
    const record = { id: '123', created_at: '2026-01', updated_at: '2026-01', name: 'Test', status: 'queue' };
    const dup = prepareRecordForDuplication(record);
    expect(dup).not.toHaveProperty('id');
    expect(dup).not.toHaveProperty('created_at');
    expect(dup).not.toHaveProperty('updated_at');
    expect(dup.name).toBe('Test');
    expect(dup.status).toBe('queue');
  });

  it('excludes additional fields', () => {
    const record = { id: '1', created_at: '', updated_at: '', order_number: 'OP-001', status: 'finished' };
    const dup = prepareRecordForDuplication(record, ['order_number']);
    expect(dup).not.toHaveProperty('order_number');
    expect(dup.status).toBe('finished');
  });

  it('applies overrides', () => {
    const record = { id: '1', created_at: '', updated_at: '', status: 'finished', notes: 'original' };
    const dup = prepareRecordForDuplication(record, [], { status: 'queue', notes: 'duplicated' });
    expect(dup.status).toBe('queue');
    expect(dup.notes).toBe('duplicated');
  });

  it('overrides take priority over record values', () => {
    const record = { id: '1', created_at: '', updated_at: '', priority: 'low' };
    const dup = prepareRecordForDuplication(record, [], { priority: 'urgent' });
    expect(dup.priority).toBe('urgent');
  });

  it('preserves null values', () => {
    const record = { id: '1', created_at: '', updated_at: '', machine_id: null, notes: null };
    const dup = prepareRecordForDuplication(record);
    expect(dup.machine_id).toBeNull();
    expect(dup.notes).toBeNull();
  });

  it('preserves arrays and objects', () => {
    const record = { id: '1', created_at: '', updated_at: '', tags: ['a', 'b'], meta: { key: 'val' } };
    const dup = prepareRecordForDuplication(record);
    expect(dup.tags).toEqual(['a', 'b']);
    expect(dup.meta).toEqual({ key: 'val' });
  });

  it('empty record produces empty duplicate', () => {
    const dup = prepareRecordForDuplication({ id: '1', created_at: '', updated_at: '' });
    expect(Object.keys(dup)).toHaveLength(0);
  });
});

// ===== BULK DUPLICATION =====
describe('Bulk Duplication', () => {
  const DEFAULT_EXCLUDE = ['id', 'created_at', 'updated_at'];

  function prepareBulkDuplication(
    records: Record<string, unknown>[],
    excludeFields: string[] = [],
    overrides: Record<string, unknown> = {}
  ): Record<string, unknown>[] {
    const allExclude = [...DEFAULT_EXCLUDE, ...excludeFields];
    return records.map(record => {
      const dup: Record<string, unknown> = {};
      Object.entries(record).forEach(([key, value]) => {
        if (!allExclude.includes(key)) dup[key] = value;
      });
      Object.assign(dup, overrides);
      return dup;
    });
  }

  it('processes multiple records', () => {
    const records = [
      { id: '1', created_at: '', updated_at: '', name: 'A' },
      { id: '2', created_at: '', updated_at: '', name: 'B' },
    ];
    const dups = prepareBulkDuplication(records);
    expect(dups).toHaveLength(2);
    expect(dups[0].name).toBe('A');
    expect(dups[1].name).toBe('B');
    dups.forEach(d => expect(d).not.toHaveProperty('id'));
  });

  it('applies same overrides to all', () => {
    const records = [
      { id: '1', created_at: '', updated_at: '', status: 'finished' },
      { id: '2', created_at: '', updated_at: '', status: 'finished' },
    ];
    const dups = prepareBulkDuplication(records, [], { status: 'queue' });
    dups.forEach(d => expect(d.status).toBe('queue'));
  });

  it('empty array returns empty', () => {
    expect(prepareBulkDuplication([])).toEqual([]);
  });
});

// ===== VERSION HISTORY DIFF =====
describe('Version History Comparison', () => {
  function compareSnapshots(
    snapshotA: Record<string, unknown>,
    snapshotB: Record<string, unknown>
  ) {
    const allKeys = new Set([...Object.keys(snapshotA), ...Object.keys(snapshotB)]);
    const diffs: Array<{ field: string; valueA: any; valueB: any }> = [];
    allKeys.forEach(field => {
      const a = snapshotA[field];
      const b = snapshotB[field];
      if (JSON.stringify(a) !== JSON.stringify(b)) {
        diffs.push({ field, valueA: a, valueB: b });
      }
    });
    return diffs;
  }

  it('no diffs for identical snapshots', () => {
    const snap = { name: 'Test', status: 'queue', qty: 100 };
    expect(compareSnapshots(snap, snap)).toHaveLength(0);
  });

  it('detects changed fields', () => {
    const diffs = compareSnapshots(
      { name: 'Test', status: 'queue' },
      { name: 'Test', status: 'production' }
    );
    expect(diffs).toHaveLength(1);
    expect(diffs[0]).toEqual({ field: 'status', valueA: 'queue', valueB: 'production' });
  });

  it('detects added fields', () => {
    const diffs = compareSnapshots(
      { name: 'Test' },
      { name: 'Test', notes: 'new note' }
    );
    expect(diffs).toHaveLength(1);
    expect(diffs[0].field).toBe('notes');
    expect(diffs[0].valueA).toBeUndefined();
    expect(diffs[0].valueB).toBe('new note');
  });

  it('detects removed fields', () => {
    const diffs = compareSnapshots(
      { name: 'Test', notes: 'old' },
      { name: 'Test' }
    );
    expect(diffs).toHaveLength(1);
    expect(diffs[0].field).toBe('notes');
    expect(diffs[0].valueB).toBeUndefined();
  });

  it('detects multiple changes', () => {
    const diffs = compareSnapshots(
      { name: 'A', status: 'queue', qty: 100 },
      { name: 'B', status: 'production', qty: 100 }
    );
    expect(diffs).toHaveLength(2);
  });

  it('handles nested objects', () => {
    const diffs = compareSnapshots(
      { meta: { a: 1, b: 2 } },
      { meta: { a: 1, b: 3 } }
    );
    expect(diffs).toHaveLength(1);
  });

  it('handles null vs undefined', () => {
    const diffs = compareSnapshots(
      { value: null },
      { value: undefined }
    );
    expect(diffs).toHaveLength(1);
  });

  it('empty snapshots', () => {
    expect(compareSnapshots({}, {})).toHaveLength(0);
  });
});

// ===== VERSION CHANGE DETECTION =====
describe('Version Change Detection (update action)', () => {
  function detectChanges(
    previous: Record<string, unknown>,
    current: Record<string, unknown>
  ): Array<{ field: string; oldValue: any; newValue: any }> {
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];
    Object.keys(current).forEach(field => {
      const oldVal = previous[field];
      const newVal = current[field];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({ field, oldValue: oldVal, newValue: newVal });
      }
    });
    return changes;
  }

  it('detects field changes', () => {
    const changes = detectChanges(
      { status: 'queue', priority: 'medium' },
      { status: 'production', priority: 'medium' }
    );
    expect(changes).toHaveLength(1);
    expect(changes[0]).toEqual({ field: 'status', oldValue: 'queue', newValue: 'production' });
  });

  it('no changes returns empty', () => {
    const changes = detectChanges({ a: 1 }, { a: 1 });
    expect(changes).toHaveLength(0);
  });

  it('detects new fields in current as changes', () => {
    const changes = detectChanges({}, { newField: 'value' });
    expect(changes).toHaveLength(1);
    expect(changes[0].oldValue).toBeUndefined();
  });
});

// ===== VERSION LIMIT =====
describe('Version History Limit', () => {
  const MAX_VERSIONS = 50;

  function addVersion<T>(existing: T[], newEntry: T): T[] {
    return [newEntry, ...existing].slice(0, MAX_VERSIONS);
  }

  it('keeps latest at front', () => {
    const result = addVersion(['old'], 'new');
    expect(result[0]).toBe('new');
    expect(result[1]).toBe('old');
  });

  it('trims to 50 versions', () => {
    const existing = Array.from({ length: 55 }, (_, i) => `v${i}`);
    const result = addVersion(existing, 'newest');
    expect(result).toHaveLength(50);
    expect(result[0]).toBe('newest');
  });

  it('handles empty history', () => {
    const result = addVersion([], 'first');
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('first');
  });
});
