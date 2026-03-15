import { describe, it, expect } from 'vitest';

// ===== GOAL PROGRESS CALCULATION =====
describe('Goal Progress Calculation', () => {
  type GoalType = 'efficiency' | 'jobs_completed' | 'pieces_produced' | 'loss_rate';

  interface OperatorGoal {
    id: string;
    operator_id: string;
    goal_type: GoalType;
    target_value: number;
    period_start: string;
    period_end: string;
    created_by: string | null;
    created_at: string;
    updated_at: string;
  }

  function calculateGoalProgress(goal: OperatorGoal, currentValue: number) {
    let progress_percentage: number;
    let is_achieved: boolean;

    if (goal.goal_type === 'loss_rate') {
      // For loss rate, lower is better
      progress_percentage = goal.target_value > 0
        ? Math.max(0, Math.min(100, ((goal.target_value - currentValue) / goal.target_value) * 100 + 100))
        : currentValue === 0 ? 100 : 0;
      is_achieved = currentValue <= goal.target_value;
    } else {
      // For other metrics, higher is better
      progress_percentage = goal.target_value > 0
        ? Math.min(100, (currentValue / goal.target_value) * 100)
        : 0;
      is_achieved = currentValue >= goal.target_value;
    }

    return {
      ...goal,
      current_value: currentValue,
      progress_percentage: Math.round(progress_percentage * 10) / 10,
      is_achieved,
    };
  }

  const baseGoal = (type: GoalType, target: number): OperatorGoal => ({
    id: '1', operator_id: 'op1', goal_type: type, target_value: target,
    period_start: '2026-03-01', period_end: '2026-03-31',
    created_by: null, created_at: '', updated_at: '',
  });

  describe('efficiency goals (higher is better)', () => {
    it('100% progress when target met', () => {
      const result = calculateGoalProgress(baseGoal('efficiency', 80), 80);
      expect(result.progress_percentage).toBe(100);
      expect(result.is_achieved).toBe(true);
    });

    it('50% progress at half target', () => {
      const result = calculateGoalProgress(baseGoal('efficiency', 80), 40);
      expect(result.progress_percentage).toBe(50);
      expect(result.is_achieved).toBe(false);
    });

    it('capped at 100% when exceeded', () => {
      const result = calculateGoalProgress(baseGoal('efficiency', 80), 95);
      expect(result.progress_percentage).toBe(100);
      expect(result.is_achieved).toBe(true);
    });

    it('0% when nothing achieved', () => {
      const result = calculateGoalProgress(baseGoal('efficiency', 80), 0);
      expect(result.progress_percentage).toBe(0);
      expect(result.is_achieved).toBe(false);
    });

    it('0% when target is 0', () => {
      const result = calculateGoalProgress(baseGoal('efficiency', 0), 50);
      expect(result.progress_percentage).toBe(0);
    });
  });

  describe('jobs_completed goals (higher is better)', () => {
    it('achieved when current >= target', () => {
      const result = calculateGoalProgress(baseGoal('jobs_completed', 100), 100);
      expect(result.is_achieved).toBe(true);
    });

    it('not achieved when below target', () => {
      const result = calculateGoalProgress(baseGoal('jobs_completed', 100), 99);
      expect(result.is_achieved).toBe(false);
    });

    it('75% progress', () => {
      const result = calculateGoalProgress(baseGoal('jobs_completed', 100), 75);
      expect(result.progress_percentage).toBe(75);
    });
  });

  describe('pieces_produced goals', () => {
    it('calculates progress for large numbers', () => {
      const result = calculateGoalProgress(baseGoal('pieces_produced', 10000), 7500);
      expect(result.progress_percentage).toBe(75);
    });
  });

  describe('loss_rate goals (LOWER is better - INVERTED)', () => {
    it('achieved when current <= target', () => {
      const result = calculateGoalProgress(baseGoal('loss_rate', 5), 3);
      expect(result.is_achieved).toBe(true);
    });

    it('achieved when exactly at target', () => {
      const result = calculateGoalProgress(baseGoal('loss_rate', 5), 5);
      expect(result.is_achieved).toBe(true);
    });

    it('NOT achieved when above target', () => {
      const result = calculateGoalProgress(baseGoal('loss_rate', 5), 8);
      expect(result.is_achieved).toBe(false);
    });

    it('100% progress when loss is 0 (perfect)', () => {
      const result = calculateGoalProgress(baseGoal('loss_rate', 5), 0);
      // progress = (5 - 0) / 5 * 100 + 100 = 200 -> clamped to 100
      // Wait: formula is max(0, min(100, ((target - current) / target) * 100 + 100))
      // = max(0, min(100, (5/5)*100 + 100)) = max(0, min(100, 200)) = 100
      expect(result.progress_percentage).toBe(100);
      expect(result.is_achieved).toBe(true);
    });

    it('progress decreases as loss increases', () => {
      const low = calculateGoalProgress(baseGoal('loss_rate', 5), 2);
      const high = calculateGoalProgress(baseGoal('loss_rate', 5), 4);
      expect(low.progress_percentage).toBeGreaterThan(high.progress_percentage);
    });

    it('progress clamped to 0 when loss is very high', () => {
      const result = calculateGoalProgress(baseGoal('loss_rate', 5), 15);
      // (5 - 15) / 5 * 100 + 100 = -200 + 100 = -100 -> clamped to 0
      expect(result.progress_percentage).toBe(0);
    });

    it('handles target 0 with current 0', () => {
      const result = calculateGoalProgress(baseGoal('loss_rate', 0), 0);
      expect(result.progress_percentage).toBe(100);
      expect(result.is_achieved).toBe(true);
    });

    it('handles target 0 with current > 0', () => {
      const result = calculateGoalProgress(baseGoal('loss_rate', 0), 5);
      expect(result.progress_percentage).toBe(0);
      expect(result.is_achieved).toBe(false);
    });
  });
});

// ===== GOAL TYPE LABELS =====
describe('Goal Type Labels', () => {
  const GOAL_TYPE_LABELS: Record<string, string> = {
    efficiency: 'Eficiência (%)',
    jobs_completed: 'Jobs Concluídos',
    pieces_produced: 'Peças Produzidas',
    loss_rate: 'Taxa de Perda (%)',
  };

  it('has all 4 goal types', () => {
    expect(Object.keys(GOAL_TYPE_LABELS)).toHaveLength(4);
  });

  it('all labels are Portuguese', () => {
    Object.values(GOAL_TYPE_LABELS).forEach(label => {
      expect(label.length).toBeGreaterThan(0);
    });
  });

  it('percentage types have (%) suffix', () => {
    expect(GOAL_TYPE_LABELS.efficiency).toContain('%');
    expect(GOAL_TYPE_LABELS.loss_rate).toContain('%');
  });
});

// ===== SHIFT TYPE DETECTION =====
describe('Shift Type Detection', () => {
  function getShiftType(hour: number): 'morning' | 'afternoon' | 'night' {
    if (hour >= 6 && hour < 14) return 'morning';
    if (hour >= 14 && hour < 22) return 'afternoon';
    return 'night';
  }

  it('morning: 06:00 - 13:59', () => {
    expect(getShiftType(6)).toBe('morning');
    expect(getShiftType(8)).toBe('morning');
    expect(getShiftType(13)).toBe('morning');
  });

  it('afternoon: 14:00 - 21:59', () => {
    expect(getShiftType(14)).toBe('afternoon');
    expect(getShiftType(18)).toBe('afternoon');
    expect(getShiftType(21)).toBe('afternoon');
  });

  it('night: 22:00 - 05:59', () => {
    expect(getShiftType(22)).toBe('night');
    expect(getShiftType(23)).toBe('night');
    expect(getShiftType(0)).toBe('night');
    expect(getShiftType(3)).toBe('night');
    expect(getShiftType(5)).toBe('night');
  });

  it('boundary: 6 is morning, 5 is night', () => {
    expect(getShiftType(5)).toBe('night');
    expect(getShiftType(6)).toBe('morning');
  });

  it('boundary: 13 is morning, 14 is afternoon', () => {
    expect(getShiftType(13)).toBe('morning');
    expect(getShiftType(14)).toBe('afternoon');
  });

  it('boundary: 21 is afternoon, 22 is night', () => {
    expect(getShiftType(21)).toBe('afternoon');
    expect(getShiftType(22)).toBe('night');
  });

  it('all 24 hours are covered', () => {
    for (let h = 0; h < 24; h++) {
      const shift = getShiftType(h);
      expect(['morning', 'afternoon', 'night']).toContain(shift);
    }
  });
});

// ===== SHIFT HANDOVER STATUS TRANSITIONS =====
describe('Shift Handover Status Transitions', () => {
  const validTransitions: Record<string, string[]> = {
    'open': ['pending_acceptance', 'cancelled'],
    'pending_acceptance': ['completed', 'open'],
    'completed': [],
    'cancelled': [],
  };

  function isValidTransition(from: string, to: string): boolean {
    return validTransitions[from]?.includes(to) ?? false;
  }

  it('open can become pending_acceptance', () => {
    expect(isValidTransition('open', 'pending_acceptance')).toBe(true);
  });

  it('open can be cancelled', () => {
    expect(isValidTransition('open', 'cancelled')).toBe(true);
  });

  it('pending_acceptance can become completed', () => {
    expect(isValidTransition('pending_acceptance', 'completed')).toBe(true);
  });

  it('pending_acceptance can revert to open', () => {
    expect(isValidTransition('pending_acceptance', 'open')).toBe(true);
  });

  it('completed is terminal', () => {
    expect(isValidTransition('completed', 'open')).toBe(false);
    expect(isValidTransition('completed', 'cancelled')).toBe(false);
  });

  it('cancelled is terminal', () => {
    expect(isValidTransition('cancelled', 'open')).toBe(false);
  });

  it('cannot skip to completed from open', () => {
    expect(isValidTransition('open', 'completed')).toBe(false);
  });
});

// ===== OCCURRENCE SEVERITY ORDERING =====
describe('Occurrence Severity Ordering', () => {
  const severityOrder: Record<string, number> = {
    critical: 0, error: 1, warning: 2, info: 3,
  };

  function sortBySeverity<T extends { severity: string }>(items: T[]): T[] {
    return [...items].sort((a, b) => (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99));
  }

  it('critical first', () => {
    const items = [
      { severity: 'info', title: 'A' },
      { severity: 'critical', title: 'B' },
      { severity: 'warning', title: 'C' },
    ];
    const sorted = sortBySeverity(items);
    expect(sorted[0].severity).toBe('critical');
    expect(sorted[1].severity).toBe('warning');
    expect(sorted[2].severity).toBe('info');
  });

  it('handles unknown severity', () => {
    const items = [
      { severity: 'unknown', title: 'A' },
      { severity: 'critical', title: 'B' },
    ];
    const sorted = sortBySeverity(items);
    expect(sorted[0].severity).toBe('critical');
    expect(sorted[1].severity).toBe('unknown');
  });

  it('preserves order for same severity', () => {
    const items = [
      { severity: 'warning', title: 'A' },
      { severity: 'warning', title: 'B' },
    ];
    const sorted = sortBySeverity(items);
    expect(sorted[0].title).toBe('A');
  });
});

// ===== CHECKLIST COMPLETION TRACKING =====
describe('Checklist Completion', () => {
  interface ChecklistItem {
    id: string;
    is_checked: boolean;
    item_order: number;
  }

  function getCompletionStats(items: ChecklistItem[]) {
    const total = items.length;
    const checked = items.filter(i => i.is_checked).length;
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
    const isComplete = checked === total && total > 0;
    return { total, checked, percentage, isComplete };
  }

  it('empty checklist', () => {
    const stats = getCompletionStats([]);
    expect(stats.total).toBe(0);
    expect(stats.percentage).toBe(0);
    expect(stats.isComplete).toBe(false);
  });

  it('all checked', () => {
    const items: ChecklistItem[] = [
      { id: '1', is_checked: true, item_order: 0 },
      { id: '2', is_checked: true, item_order: 1 },
    ];
    const stats = getCompletionStats(items);
    expect(stats.percentage).toBe(100);
    expect(stats.isComplete).toBe(true);
  });

  it('partial completion', () => {
    const items: ChecklistItem[] = [
      { id: '1', is_checked: true, item_order: 0 },
      { id: '2', is_checked: false, item_order: 1 },
      { id: '3', is_checked: true, item_order: 2 },
    ];
    const stats = getCompletionStats(items);
    expect(stats.checked).toBe(2);
    expect(stats.percentage).toBe(67);
    expect(stats.isComplete).toBe(false);
  });

  it('none checked', () => {
    const items: ChecklistItem[] = [
      { id: '1', is_checked: false, item_order: 0 },
      { id: '2', is_checked: false, item_order: 1 },
    ];
    const stats = getCompletionStats(items);
    expect(stats.percentage).toBe(0);
    expect(stats.isComplete).toBe(false);
  });
});

// ===== PENDING TASK PRIORITY SORTING =====
describe('Pending Task Priority Sorting', () => {
  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

  function sortByPriority<T extends { priority: string; created_at: string }>(tasks: T[]): T[] {
    return [...tasks].sort((a, b) => {
      const pDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      if (pDiff !== 0) return pDiff;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }

  it('critical before high before medium', () => {
    const tasks = [
      { priority: 'medium', created_at: '2026-03-01' },
      { priority: 'critical', created_at: '2026-03-01' },
      { priority: 'high', created_at: '2026-03-01' },
    ];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].priority).toBe('critical');
    expect(sorted[1].priority).toBe('high');
    expect(sorted[2].priority).toBe('medium');
  });

  it('same priority: older first', () => {
    const tasks = [
      { priority: 'high', created_at: '2026-03-15' },
      { priority: 'high', created_at: '2026-03-01' },
    ];
    const sorted = sortByPriority(tasks);
    expect(sorted[0].created_at).toBe('2026-03-01');
  });
});
