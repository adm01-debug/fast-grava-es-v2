import { describe, it, expect } from 'vitest';

// ===== LOT NUMBER VALIDATION =====
describe('Lot Number Validation', () => {
  function isValidLotNumber(lotNumber: string): boolean {
    // Format: LOT-YYYYMMDD-XXXX
    return /^LOT-\d{8}-[A-Z0-9]{4}$/.test(lotNumber);
  }

  it('accepts valid lot numbers', () => {
    expect(isValidLotNumber('LOT-20260315-AB01')).toBe(true);
    expect(isValidLotNumber('LOT-20260101-0001')).toBe(true);
    expect(isValidLotNumber('LOT-20260315-ZZZZ')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(isValidLotNumber('LOT-2026031-AB01')).toBe(false); // short date
    expect(isValidLotNumber('LOT-20260315-ab01')).toBe(false); // lowercase
    expect(isValidLotNumber('LOT-20260315-AB0')).toBe(false); // short suffix
    expect(isValidLotNumber('20260315-AB01')).toBe(false); // no prefix
    expect(isValidLotNumber('')).toBe(false);
    expect(isValidLotNumber('random-string')).toBe(false);
  });
});

// ===== LOT STATUS TRANSITIONS =====
describe('Lot Status Transitions', () => {
  const validTransitions: Record<string, string[]> = {
    'created': ['in_production', 'cancelled'],
    'in_production': ['quality_check', 'quarantine', 'cancelled'],
    'quality_check': ['approved', 'rejected', 'quarantine'],
    'approved': ['shipped', 'quarantine'],
    'rejected': ['rework', 'scrapped'],
    'quarantine': ['quality_check', 'scrapped'],
    'rework': ['quality_check'],
    'shipped': [],
    'scrapped': [],
    'cancelled': [],
  };

  function isValidTransition(from: string, to: string): boolean {
    return validTransitions[from]?.includes(to) ?? false;
  }

  it('allows created -> in_production', () => {
    expect(isValidTransition('created', 'in_production')).toBe(true);
  });

  it('allows quality_check -> approved/rejected', () => {
    expect(isValidTransition('quality_check', 'approved')).toBe(true);
    expect(isValidTransition('quality_check', 'rejected')).toBe(true);
  });

  it('shipped is terminal', () => {
    Object.keys(validTransitions).forEach(status => {
      expect(isValidTransition('shipped', status)).toBe(false);
    });
  });

  it('scrapped is terminal', () => {
    Object.keys(validTransitions).forEach(status => {
      expect(isValidTransition('scrapped', status)).toBe(false);
    });
  });

  it('rework returns to quality_check', () => {
    expect(isValidTransition('rework', 'quality_check')).toBe(true);
    expect(isValidTransition('rework', 'approved')).toBe(false);
  });

  it('quarantine can go to quality_check or scrapped', () => {
    expect(isValidTransition('quarantine', 'quality_check')).toBe(true);
    expect(isValidTransition('quarantine', 'scrapped')).toBe(true);
    expect(isValidTransition('quarantine', 'approved')).toBe(false);
  });

  it('prevents skipping quality check', () => {
    expect(isValidTransition('in_production', 'approved')).toBe(false);
    expect(isValidTransition('in_production', 'shipped')).toBe(false);
  });

  it('all statuses have rules', () => {
    const expected = ['created', 'in_production', 'quality_check', 'approved', 'rejected', 'quarantine', 'rework', 'shipped', 'scrapped', 'cancelled'];
    expected.forEach(s => expect(validTransitions).toHaveProperty(s));
  });
});

// ===== LOT GENEALOGY (TREE) =====
describe('Lot Genealogy Tree', () => {
  interface LotNode {
    id: string;
    lotNumber: string;
    parentIds: string[];
    childIds: string[];
  }

  function buildGenealogy(lots: LotNode[]) {
    const lotMap = new Map(lots.map(l => [l.id, l]));
    
    function getAncestors(id: string, visited = new Set<string>()): string[] {
      if (visited.has(id)) return []; // prevent cycles
      visited.add(id);
      const lot = lotMap.get(id);
      if (!lot) return [];
      const ancestors: string[] = [...lot.parentIds];
      lot.parentIds.forEach(pid => ancestors.push(...getAncestors(pid, visited)));
      return [...new Set(ancestors)];
    }

    function getDescendants(id: string, visited = new Set<string>()): string[] {
      if (visited.has(id)) return [];
      visited.add(id);
      const lot = lotMap.get(id);
      if (!lot) return [];
      const descendants: string[] = [...lot.childIds];
      lot.childIds.forEach(cid => descendants.push(...getDescendants(cid, visited)));
      return [...new Set(descendants)];
    }

    return { getAncestors, getDescendants };
  }

  const lots: LotNode[] = [
    { id: 'L1', lotNumber: 'LOT-001', parentIds: [], childIds: ['L2', 'L3'] },
    { id: 'L2', lotNumber: 'LOT-002', parentIds: ['L1'], childIds: ['L4'] },
    { id: 'L3', lotNumber: 'LOT-003', parentIds: ['L1'], childIds: ['L4'] },
    { id: 'L4', lotNumber: 'LOT-004', parentIds: ['L2', 'L3'], childIds: [] },
  ];

  it('finds direct ancestors', () => {
    const { getAncestors } = buildGenealogy(lots);
    expect(getAncestors('L4')).toContain('L2');
    expect(getAncestors('L4')).toContain('L3');
  });

  it('finds transitive ancestors', () => {
    const { getAncestors } = buildGenealogy(lots);
    const ancestors = getAncestors('L4');
    expect(ancestors).toContain('L1'); // grandparent
  });

  it('root lot has no ancestors', () => {
    const { getAncestors } = buildGenealogy(lots);
    expect(getAncestors('L1')).toHaveLength(0);
  });

  it('finds descendants', () => {
    const { getDescendants } = buildGenealogy(lots);
    expect(getDescendants('L1')).toContain('L2');
    expect(getDescendants('L1')).toContain('L3');
    expect(getDescendants('L1')).toContain('L4');
  });

  it('leaf lot has no descendants', () => {
    const { getDescendants } = buildGenealogy(lots);
    expect(getDescendants('L4')).toHaveLength(0);
  });

  it('handles missing lot', () => {
    const { getAncestors, getDescendants } = buildGenealogy(lots);
    expect(getAncestors('unknown')).toHaveLength(0);
    expect(getDescendants('unknown')).toHaveLength(0);
  });

  it('handles circular references without infinite loop', () => {
    const circular: LotNode[] = [
      { id: 'A', lotNumber: 'LOT-A', parentIds: ['B'], childIds: ['B'] },
      { id: 'B', lotNumber: 'LOT-B', parentIds: ['A'], childIds: ['A'] },
    ];
    const { getAncestors, getDescendants } = buildGenealogy(circular);
    // Should not infinite loop
    expect(getAncestors('A').length).toBeLessThan(10);
    expect(getDescendants('A').length).toBeLessThan(10);
  });
});

// ===== QUALITY INSPECTION SCORING =====
describe('Quality Inspection Scoring', () => {
  function calculateDefectRate(sampleSize: number, defectsFound: number): number {
    if (sampleSize <= 0) return 0;
    return (defectsFound / sampleSize) * 100;
  }

  function getInspectionResult(defectRate: number, threshold: number): string {
    return defectRate <= threshold ? 'approved' : 'rejected';
  }

  function shouldEscalate(consecutiveRejections: number): boolean {
    return consecutiveRejections >= 3;
  }

  it('calculates defect rate correctly', () => {
    expect(calculateDefectRate(100, 5)).toBe(5);
    expect(calculateDefectRate(200, 1)).toBe(0.5);
    expect(calculateDefectRate(100, 0)).toBe(0);
  });

  it('handles zero sample size', () => {
    expect(calculateDefectRate(0, 5)).toBe(0);
  });

  it('approves within threshold', () => {
    expect(getInspectionResult(2, 5)).toBe('approved');
    expect(getInspectionResult(5, 5)).toBe('approved');
  });

  it('rejects above threshold', () => {
    expect(getInspectionResult(6, 5)).toBe('rejected');
    expect(getInspectionResult(100, 5)).toBe('rejected');
  });

  it('escalates after 3 consecutive rejections', () => {
    expect(shouldEscalate(2)).toBe(false);
    expect(shouldEscalate(3)).toBe(true);
    expect(shouldEscalate(5)).toBe(true);
  });
});

// ===== GAMIFICATION: RANKING CALCULATION =====
describe('Gamification Ranking Calculation', () => {
  function calculatePoints(stats: { produced: number; efficiency: number; quality: number; jobs: number }): number {
    return Math.round(stats.produced + stats.efficiency * 10 + stats.quality * 5 + stats.jobs * 2);
  }

  function calculateRankings(operators: Array<{ id: string; points: number }>) {
    return [...operators]
      .sort((a, b) => b.points - a.points)
      .map((op, i) => ({ ...op, position: i + 1 }));
  }

  it('higher production = more points', () => {
    const a = calculatePoints({ produced: 1000, efficiency: 80, quality: 95, jobs: 10 });
    const b = calculatePoints({ produced: 500, efficiency: 80, quality: 95, jobs: 10 });
    expect(a).toBeGreaterThan(b);
  });

  it('efficiency contributes significantly', () => {
    const a = calculatePoints({ produced: 100, efficiency: 90, quality: 90, jobs: 5 });
    const b = calculatePoints({ produced: 100, efficiency: 50, quality: 90, jobs: 5 });
    expect(a - b).toBe(400); // (90-50) * 10
  });

  it('quality contributes meaningfully', () => {
    const a = calculatePoints({ produced: 100, efficiency: 80, quality: 100, jobs: 5 });
    const b = calculatePoints({ produced: 100, efficiency: 80, quality: 80, jobs: 5 });
    expect(a - b).toBe(100); // (100-80) * 5
  });

  it('ranks by points descending', () => {
    const operators = [
      { id: 'op1', points: 500 },
      { id: 'op2', points: 1000 },
      { id: 'op3', points: 750 },
    ];
    const ranked = calculateRankings(operators);
    expect(ranked[0].id).toBe('op2');
    expect(ranked[0].position).toBe(1);
    expect(ranked[1].id).toBe('op3');
    expect(ranked[2].id).toBe('op1');
    expect(ranked[2].position).toBe(3);
  });

  it('handles tie in points', () => {
    const operators = [
      { id: 'op1', points: 500 },
      { id: 'op2', points: 500 },
    ];
    const ranked = calculateRankings(operators);
    expect(ranked).toHaveLength(2);
    expect(ranked[0].position).toBe(1);
    expect(ranked[1].position).toBe(2);
  });

  it('handles empty operator list', () => {
    expect(calculateRankings([])).toEqual([]);
  });

  it('single operator is #1', () => {
    const ranked = calculateRankings([{ id: 'op1', points: 100 }]);
    expect(ranked[0].position).toBe(1);
  });
});

// ===== GAMIFICATION: ACHIEVEMENT BADGES =====
describe('Achievement Badge Logic', () => {
  function checkAchievements(stats: {
    produced: number;
    efficiency: number;
    quality: number;
    consecutiveDaysWorked: number;
    jobsCompleted: number;
  }): string[] {
    const badges: string[] = [];

    if (stats.produced >= 10000) badges.push('production_master');
    else if (stats.produced >= 5000) badges.push('production_expert');
    else if (stats.produced >= 1000) badges.push('production_starter');

    if (stats.efficiency >= 95) badges.push('efficiency_champion');
    if (stats.quality >= 99) badges.push('quality_perfectionist');
    if (stats.quality >= 95) badges.push('quality_master');

    if (stats.consecutiveDaysWorked >= 30) badges.push('dedication_gold');
    else if (stats.consecutiveDaysWorked >= 14) badges.push('dedication_silver');
    else if (stats.consecutiveDaysWorked >= 7) badges.push('dedication_bronze');

    if (stats.jobsCompleted >= 100) badges.push('century_club');
    if (stats.jobsCompleted >= 50) badges.push('fifty_milestone');

    return badges;
  }

  it('production_master at 10000+ pieces', () => {
    const badges = checkAchievements({ produced: 15000, efficiency: 50, quality: 50, consecutiveDaysWorked: 0, jobsCompleted: 0 });
    expect(badges).toContain('production_master');
    expect(badges).not.toContain('production_expert'); // highest tier only
  });

  it('efficiency_champion at 95%+', () => {
    const badges = checkAchievements({ produced: 0, efficiency: 96, quality: 50, consecutiveDaysWorked: 0, jobsCompleted: 0 });
    expect(badges).toContain('efficiency_champion');
  });

  it('both quality badges at 99%', () => {
    const badges = checkAchievements({ produced: 0, efficiency: 0, quality: 99, consecutiveDaysWorked: 0, jobsCompleted: 0 });
    expect(badges).toContain('quality_perfectionist');
    expect(badges).toContain('quality_master');
  });

  it('dedication tiers are exclusive', () => {
    const gold = checkAchievements({ produced: 0, efficiency: 0, quality: 0, consecutiveDaysWorked: 30, jobsCompleted: 0 });
    expect(gold).toContain('dedication_gold');
    expect(gold).not.toContain('dedication_silver');
  });

  it('multiple badges stack', () => {
    const badges = checkAchievements({ produced: 10000, efficiency: 95, quality: 99, consecutiveDaysWorked: 30, jobsCompleted: 100 });
    expect(badges.length).toBeGreaterThanOrEqual(5);
  });

  it('no badges for minimal stats', () => {
    const badges = checkAchievements({ produced: 0, efficiency: 0, quality: 0, consecutiveDaysWorked: 0, jobsCompleted: 0 });
    expect(badges).toHaveLength(0);
  });
});

// ===== OFFLINE SYNC: PENDING ACTION PRIORITY =====
describe('Offline Pending Action Priority', () => {
  interface PendingAction {
    id: string;
    priority: 'high' | 'normal' | 'low';
    createdAt: string;
  }

  function sortPendingActions(actions: PendingAction[]): PendingAction[] {
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    return [...actions].sort((a, b) => {
      const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  it('high priority first', () => {
    const actions: PendingAction[] = [
      { id: '1', priority: 'low', createdAt: '2026-01-01' },
      { id: '2', priority: 'high', createdAt: '2026-01-02' },
      { id: '3', priority: 'normal', createdAt: '2026-01-03' },
    ];
    const sorted = sortPendingActions(actions);
    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('3');
    expect(sorted[2].id).toBe('1');
  });

  it('within same priority, oldest first', () => {
    const actions: PendingAction[] = [
      { id: '1', priority: 'normal', createdAt: '2026-01-03' },
      { id: '2', priority: 'normal', createdAt: '2026-01-01' },
      { id: '3', priority: 'normal', createdAt: '2026-01-02' },
    ];
    const sorted = sortPendingActions(actions);
    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('3');
    expect(sorted[2].id).toBe('1');
  });

  it('handles empty list', () => {
    expect(sortPendingActions([])).toEqual([]);
  });
});

// ===== MOVEMENT TYPE VALIDATION =====
describe('Movement Type Validation', () => {
  const validMovementTypes = ['production', 'transfer', 'return', 'adjustment', 'scrap', 'rework', 'shipping'];

  function isValidMovementType(type: string): boolean {
    return validMovementTypes.includes(type);
  }

  it('accepts valid movement types', () => {
    validMovementTypes.forEach(t => expect(isValidMovementType(t)).toBe(true));
  });

  it('rejects invalid types', () => {
    expect(isValidMovementType('unknown')).toBe(false);
    expect(isValidMovementType('')).toBe(false);
    expect(isValidMovementType('Production')).toBe(false); // case sensitive
  });

  it('has 7 movement types', () => {
    expect(validMovementTypes).toHaveLength(7);
  });
});

// ===== EXPIRATION DATE CHECKING =====
describe('Lot Expiration Checking', () => {
  function checkExpiration(expirationDate: string | null, now: Date): { isExpired: boolean; daysLeft: number | null; urgency: string } {
    if (!expirationDate) return { isExpired: false, daysLeft: null, urgency: 'none' };
    
    const exp = new Date(expirationDate);
    if (isNaN(exp.getTime())) return { isExpired: false, daysLeft: null, urgency: 'none' };
    
    const diffMs = exp.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 0) return { isExpired: true, daysLeft: 0, urgency: 'expired' };
    if (daysLeft <= 7) return { isExpired: false, daysLeft, urgency: 'critical' };
    if (daysLeft <= 30) return { isExpired: false, daysLeft, urgency: 'warning' };
    return { isExpired: false, daysLeft, urgency: 'ok' };
  }

  const now = new Date('2026-03-15');

  it('detects expired lot', () => {
    const result = checkExpiration('2026-03-10', now);
    expect(result.isExpired).toBe(true);
    expect(result.urgency).toBe('expired');
  });

  it('detects critical (< 7 days)', () => {
    const result = checkExpiration('2026-03-20', now);
    expect(result.isExpired).toBe(false);
    expect(result.urgency).toBe('critical');
    expect(result.daysLeft).toBe(5);
  });

  it('detects warning (< 30 days)', () => {
    const result = checkExpiration('2026-04-10', now);
    expect(result.urgency).toBe('warning');
  });

  it('ok for distant expiration', () => {
    const result = checkExpiration('2027-01-01', now);
    expect(result.urgency).toBe('ok');
  });

  it('handles null expiration', () => {
    const result = checkExpiration(null, now);
    expect(result.isExpired).toBe(false);
    expect(result.daysLeft).toBeNull();
    expect(result.urgency).toBe('none');
  });

  it('handles invalid date', () => {
    const result = checkExpiration('not-a-date', now);
    expect(result.urgency).toBe('none');
  });
});
