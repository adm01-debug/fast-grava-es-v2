/**
 * Job Status State Machine
 * 
 * Defines valid transitions between job statuses,
 * preventing illegal state changes (e.g., completed → pending).
 * 
 * State diagram:
 *   pending → scheduled → ready → production → completed
 *                ↓          ↓         ↓
 *             cancelled  cancelled  cancelled
 *                         ↓
 *                      on_hold → ready
 */

export type JobStatus = 
  | 'pending'
  | 'scheduled'
  | 'ready'
  | 'production'
  | 'completed'
  | 'cancelled'
  | 'on_hold';

const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  pending:    ['scheduled', 'cancelled'],
  scheduled:  ['ready', 'cancelled', 'pending'],
  ready:      ['production', 'on_hold', 'cancelled', 'scheduled'],
  production: ['completed', 'cancelled', 'on_hold'],
  completed:  [], // Terminal state
  cancelled:  ['pending'], // Can be reopened
  on_hold:    ['ready', 'cancelled'],
};

export interface TransitionResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Check if a status transition is valid.
 */
export function canTransition(from: JobStatus, to: JobStatus): TransitionResult {
  if (from === to) {
    return { allowed: false, reason: 'Status já é o mesmo' };
  }

  const validTargets = VALID_TRANSITIONS[from];
  if (!validTargets) {
    return { allowed: false, reason: `Status desconhecido: ${from}` };
  }

  if (validTargets.includes(to)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Transição de "${getStatusLabel(from)}" para "${getStatusLabel(to)}" não é permitida`,
  };
}

/**
 * Get all valid next statuses from current status.
 */
export function getValidNextStatuses(current: JobStatus): JobStatus[] {
  return VALID_TRANSITIONS[current] || [];
}

/**
 * Check if a status is terminal (no further transitions).
 */
export function isTerminalStatus(status: JobStatus): boolean {
  return (VALID_TRANSITIONS[status] || []).length === 0;
}

/**
 * Human-readable status labels (PT-BR).
 */
const STATUS_LABELS: Record<JobStatus, string> = {
  pending:    'Pendente',
  scheduled:  'Agendado',
  ready:      'No Jeito',
  production: 'Em Produção',
  completed:  'Concluído',
  cancelled:  'Cancelado',
  on_hold:    'Em Espera',
};

export function getStatusLabel(status: JobStatus): string {
  return STATUS_LABELS[status] || status;
}

/**
 * Status colors for UI consistency.
 */
const STATUS_COLORS: Record<JobStatus, string> = {
  pending:    'bg-muted text-muted-foreground',
  scheduled:  'bg-blue-500/20 text-blue-400',
  ready:      'bg-yellow-500/20 text-yellow-400',
  production: 'bg-green-500/20 text-green-400',
  completed:  'bg-primary/20 text-primary',
  cancelled:  'bg-destructive/20 text-destructive',
  on_hold:    'bg-orange-500/20 text-orange-400',
};

export function getStatusColor(status: JobStatus): string {
  return STATUS_COLORS[status] || 'bg-muted text-muted-foreground';
}

/**
 * Validate and execute a transition, throwing if invalid.
 */
export function assertTransition(from: JobStatus, to: JobStatus): void {
  const result = canTransition(from, to);
  if (!result.allowed) {
    throw new Error(result.reason);
  }
}
