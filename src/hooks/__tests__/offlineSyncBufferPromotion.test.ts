import { describe, it, expect } from 'vitest';

// ===== PENDING ACTION PRIORITY SORTING =====
describe('Pending Action Priority Sorting', () => {
  interface PendingAction {
    id: string;
    type: string;
    priority: 'high' | 'normal' | 'low';
    createdAt: string;
    retryCount: number;
  }

  function sortPendingActions(actions: PendingAction[]): PendingAction[] {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    return [...actions].sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  it('high before normal before low', () => {
    const sorted = sortPendingActions([
      { id: '1', type: 'update_job', priority: 'low', createdAt: '2026-03-15T10:00:00Z', retryCount: 0 },
      { id: '2', type: 'qr_scan', priority: 'high', createdAt: '2026-03-15T10:00:00Z', retryCount: 0 },
      { id: '3', type: 'create_lot', priority: 'normal', createdAt: '2026-03-15T10:00:00Z', retryCount: 0 },
    ]);
    expect(sorted[0].priority).toBe('high');
    expect(sorted[1].priority).toBe('normal');
    expect(sorted[2].priority).toBe('low');
  });

  it('same priority: FIFO order', () => {
    const sorted = sortPendingActions([
      { id: '2', type: 'update_job', priority: 'normal', createdAt: '2026-03-15T12:00:00Z', retryCount: 0 },
      { id: '1', type: 'update_job', priority: 'normal', createdAt: '2026-03-15T08:00:00Z', retryCount: 0 },
    ]);
    expect(sorted[0].id).toBe('1');
    expect(sorted[1].id).toBe('2');
  });

  it('handles empty', () => {
    expect(sortPendingActions([])).toEqual([]);
  });

  it('handles single item', () => {
    const actions = [{ id: '1', type: 'qr_scan', priority: 'high' as const, createdAt: '2026-03-15T10:00:00Z', retryCount: 0 }];
    expect(sortPendingActions(actions)).toHaveLength(1);
  });

  it('mixed: high+old before normal+new', () => {
    const sorted = sortPendingActions([
      { id: '1', type: 'update_job', priority: 'normal', createdAt: '2026-03-10T08:00:00Z', retryCount: 0 },
      { id: '2', type: 'qr_scan', priority: 'high', createdAt: '2026-03-15T12:00:00Z', retryCount: 0 },
    ]);
    expect(sorted[0].id).toBe('2'); // high priority wins
  });
});

// ===== SYNC METADATA MANAGEMENT =====
describe('Sync Metadata Management', () => {
  interface SyncMetadata {
    lastFullSync: string | null;
    lastPartialSync: string | null;
    syncInProgress: boolean;
    offlineSince: string | null;
  }

  const DEFAULT_METADATA: SyncMetadata = {
    lastFullSync: null,
    lastPartialSync: null,
    syncInProgress: false,
    offlineSince: null,
  };

  function mergeSyncMetadata(current: SyncMetadata | null, updates: Partial<SyncMetadata>): SyncMetadata {
    return { ...(current || DEFAULT_METADATA), ...updates };
  }

  it('returns defaults when no current state', () => {
    const merged = mergeSyncMetadata(null, {});
    expect(merged).toEqual(DEFAULT_METADATA);
  });

  it('preserves existing values', () => {
    const current: SyncMetadata = { ...DEFAULT_METADATA, lastFullSync: '2026-03-15T10:00:00Z' };
    const merged = mergeSyncMetadata(current, { syncInProgress: true });
    expect(merged.lastFullSync).toBe('2026-03-15T10:00:00Z');
    expect(merged.syncInProgress).toBe(true);
  });

  it('can track offline status', () => {
    const merged = mergeSyncMetadata(DEFAULT_METADATA, { offlineSince: '2026-03-15T10:00:00Z' });
    expect(merged.offlineSince).toBe('2026-03-15T10:00:00Z');
    // Come back online
    const online = mergeSyncMetadata(merged, { offlineSince: null, lastPartialSync: '2026-03-15T11:00:00Z' });
    expect(online.offlineSince).toBeNull();
    expect(online.lastPartialSync).toBe('2026-03-15T11:00:00Z');
  });
});

// ===== BUFFER PROMOTION LOGIC =====
describe('Buffer Promotion Need Calculation', () => {
  const BUFFER_TARGET = 3;

  function calculatePromotionNeed(readyCount: number, queueCount: number): number {
    const needed = Math.max(0, BUFFER_TARGET - readyCount);
    return Math.min(needed, queueCount); // can't promote more than available
  }

  it('needs 3 when buffer is empty', () => {
    expect(calculatePromotionNeed(0, 10)).toBe(3);
  });

  it('needs 1 when 2 ready', () => {
    expect(calculatePromotionNeed(2, 5)).toBe(1);
  });

  it('needs 0 when buffer is full', () => {
    expect(calculatePromotionNeed(3, 5)).toBe(0);
    expect(calculatePromotionNeed(5, 5)).toBe(0);
  });

  it('limited by available queue jobs', () => {
    expect(calculatePromotionNeed(0, 2)).toBe(2); // needs 3 but only 2 available
    expect(calculatePromotionNeed(0, 0)).toBe(0);
    expect(calculatePromotionNeed(1, 1)).toBe(1);
  });
});

// ===== PROMOTION PRIORITY SORTING =====
describe('Promotion Priority Sorting', () => {
  interface MockJob {
    id: string;
    priority: string;
    created_at: string;
  }

  function sortForPromotion(jobs: MockJob[]): MockJob[] {
    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    return [...jobs].sort((a, b) => {
      const pDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      if (pDiff !== 0) return pDiff;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }

  it('urgent first', () => {
    const sorted = sortForPromotion([
      { id: '1', priority: 'low', created_at: '2026-03-01' },
      { id: '2', priority: 'urgent', created_at: '2026-03-15' },
      { id: '3', priority: 'medium', created_at: '2026-03-10' },
    ]);
    expect(sorted[0].id).toBe('2');
  });

  it('same priority: older first (FIFO)', () => {
    const sorted = sortForPromotion([
      { id: '1', priority: 'medium', created_at: '2026-03-15' },
      { id: '2', priority: 'medium', created_at: '2026-03-01' },
    ]);
    expect(sorted[0].id).toBe('2');
  });

  it('unknown priority treated as medium', () => {
    const sorted = sortForPromotion([
      { id: '1', priority: 'unknown', created_at: '2026-03-01' },
      { id: '2', priority: 'high', created_at: '2026-03-01' },
    ]);
    expect(sorted[0].id).toBe('2'); // high before unknown (=medium)
  });
});

// ===== BUFFER HEALTH STATUS =====
describe('Buffer Health Status', () => {
  const BUFFER_TARGET = 3;

  function getBufferHealth(readyCount: number, queueCount: number): 'healthy' | 'warning' | 'critical' | 'empty' {
    if (readyCount >= BUFFER_TARGET) return 'healthy';
    if (readyCount > 0) return 'warning';
    if (queueCount > 0) return 'critical'; // no ready but have queue
    return 'empty'; // nothing at all
  }

  it('healthy when target met', () => {
    expect(getBufferHealth(3, 5)).toBe('healthy');
    expect(getBufferHealth(10, 0)).toBe('healthy');
  });

  it('warning when partially filled', () => {
    expect(getBufferHealth(1, 5)).toBe('warning');
    expect(getBufferHealth(2, 3)).toBe('warning');
  });

  it('critical when empty but queue has jobs', () => {
    expect(getBufferHealth(0, 5)).toBe('critical');
  });

  it('empty when nothing at all', () => {
    expect(getBufferHealth(0, 0)).toBe('empty');
  });
});

// ===== PROMOTION COOLDOWN =====
describe('Promotion Cooldown Logic', () => {
  const COOLDOWN_MS = 30000; // 30 seconds

  function shouldPromote(lastPromotion: number, now: number): boolean {
    return now - lastPromotion >= COOLDOWN_MS;
  }

  it('allows promotion after cooldown', () => {
    const lastPromotion = Date.now() - 31000;
    expect(shouldPromote(lastPromotion, Date.now())).toBe(true);
  });

  it('blocks promotion during cooldown', () => {
    const now = Date.now();
    expect(shouldPromote(now - 10000, now)).toBe(false); // 10s ago
    expect(shouldPromote(now - 29000, now)).toBe(false); // 29s ago
  });

  it('allows promotion when never promoted (lastPromotion = 0)', () => {
    expect(shouldPromote(0, Date.now())).toBe(true);
  });

  it('allows exactly at cooldown boundary', () => {
    const now = Date.now();
    expect(shouldPromote(now - 30000, now)).toBe(true);
  });
});

// ===== PENDING ACTION TYPE VALIDATION =====
describe('Pending Action Type Validation', () => {
  const VALID_TYPES = ['update_job', 'register_production', 'qr_scan', 'create_lot', 'record_maintenance'];

  function isValidActionType(type: string): boolean {
    return VALID_TYPES.includes(type);
  }

  it('accepts all valid types', () => {
    VALID_TYPES.forEach(type => {
      expect(isValidActionType(type)).toBe(true);
    });
  });

  it('rejects invalid types', () => {
    expect(isValidActionType('delete_job')).toBe(false);
    expect(isValidActionType('')).toBe(false);
    expect(isValidActionType('UPDATE_JOB')).toBe(false); // case sensitive
  });
});

// ===== RETRY COUNT MANAGEMENT =====
describe('Retry Count Management', () => {
  const MAX_RETRIES = 5;

  function shouldRetry(retryCount: number): boolean {
    return retryCount < MAX_RETRIES;
  }

  function getBackoffMs(retryCount: number): number {
    return Math.min(30000, 1000 * Math.pow(2, retryCount)); // exponential with 30s cap
  }

  it('allows retries up to max', () => {
    expect(shouldRetry(0)).toBe(true);
    expect(shouldRetry(4)).toBe(true);
    expect(shouldRetry(5)).toBe(false);
    expect(shouldRetry(10)).toBe(false);
  });

  it('exponential backoff', () => {
    expect(getBackoffMs(0)).toBe(1000);    // 1s
    expect(getBackoffMs(1)).toBe(2000);    // 2s
    expect(getBackoffMs(2)).toBe(4000);    // 4s
    expect(getBackoffMs(3)).toBe(8000);    // 8s
    expect(getBackoffMs(4)).toBe(16000);   // 16s
  });

  it('caps at 30 seconds', () => {
    expect(getBackoffMs(5)).toBe(30000);
    expect(getBackoffMs(10)).toBe(30000);
  });
});

// ===== OFFLINE JOB LOCAL MODIFICATION TRACKING =====
describe('Offline Job Modification Tracking', () => {
  function markAsLocallyModified(job: Record<string, unknown>, updates: Record<string, unknown>): Record<string, unknown> {
    return {
      ...job,
      ...updates,
      _locallyModified: true,
      _modifiedAt: new Date().toISOString(),
    };
  }

  it('adds modification markers', () => {
    const modified = markAsLocallyModified(
      { id: '1', status: 'queue' },
      { status: 'production' }
    );
    expect(modified._locallyModified).toBe(true);
    expect(modified._modifiedAt).toBeDefined();
    expect(modified.status).toBe('production');
    expect(modified.id).toBe('1');
  });

  it('preserves existing fields', () => {
    const modified = markAsLocallyModified(
      { id: '1', client: 'Acme', notes: 'test' },
      { status: 'ready' }
    );
    expect(modified.client).toBe('Acme');
    expect(modified.notes).toBe('test');
  });
});

// ===== STORAGE QUOTA CALCULATION =====
describe('Storage Quota Calculation', () => {
  function calculatePercentUsed(usage: number, quota: number): number {
    return quota > 0 ? (usage / quota) * 100 : 0;
  }

  it('calculates percentage correctly', () => {
    expect(calculatePercentUsed(50, 100)).toBe(50);
    expect(calculatePercentUsed(100, 100)).toBe(100);
    expect(calculatePercentUsed(0, 100)).toBe(0);
  });

  it('handles zero quota', () => {
    expect(calculatePercentUsed(50, 0)).toBe(0);
  });

  it('can exceed 100%', () => {
    expect(calculatePercentUsed(150, 100)).toBe(150);
  });
});

// ===== ACTIVE STATUS FILTER FOR CONFLICT DETECTION =====
describe('Active Status Filter for Conflicts', () => {
  const activeStatuses = ['scheduled', 'ready', 'production'];

  function isActiveForConflictCheck(job: { status: string; scheduled_date: string | null; start_time: string | null; end_time: string | null; machine_id: string | null }): boolean {
    return (
      activeStatuses.includes(job.status) &&
      !!job.scheduled_date &&
      !!job.start_time &&
      !!job.end_time &&
      !!job.machine_id
    );
  }

  it('accepts fully scheduled active job', () => {
    expect(isActiveForConflictCheck({ status: 'scheduled', scheduled_date: '2026-03-15', start_time: '08:00', end_time: '10:00', machine_id: 'm1' })).toBe(true);
  });

  it('rejects queue jobs', () => {
    expect(isActiveForConflictCheck({ status: 'queue', scheduled_date: '2026-03-15', start_time: '08:00', end_time: '10:00', machine_id: 'm1' })).toBe(false);
  });

  it('rejects jobs without scheduled_date', () => {
    expect(isActiveForConflictCheck({ status: 'scheduled', scheduled_date: null, start_time: '08:00', end_time: '10:00', machine_id: 'm1' })).toBe(false);
  });

  it('rejects jobs without times', () => {
    expect(isActiveForConflictCheck({ status: 'scheduled', scheduled_date: '2026-03-15', start_time: null, end_time: '10:00', machine_id: 'm1' })).toBe(false);
    expect(isActiveForConflictCheck({ status: 'scheduled', scheduled_date: '2026-03-15', start_time: '08:00', end_time: null, machine_id: 'm1' })).toBe(false);
  });

  it('rejects jobs without machine', () => {
    expect(isActiveForConflictCheck({ status: 'scheduled', scheduled_date: '2026-03-15', start_time: '08:00', end_time: '10:00', machine_id: null })).toBe(false);
  });

  it('rejects finished/cancelled', () => {
    expect(isActiveForConflictCheck({ status: 'finished', scheduled_date: '2026-03-15', start_time: '08:00', end_time: '10:00', machine_id: 'm1' })).toBe(false);
    expect(isActiveForConflictCheck({ status: 'cancelled', scheduled_date: '2026-03-15', start_time: '08:00', end_time: '10:00', machine_id: 'm1' })).toBe(false);
  });
});
