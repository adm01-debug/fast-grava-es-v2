/**
 * Job State Machine — defines valid status transitions.
 * Prevents illegal state changes (e.g. "finished" → "queue").
 */

export type JobStatus =
  | 'queue'
  | 'scheduled'
  | 'ready'
  | 'production'
  | 'paused'
  | 'delayed'
  | 'finished'
  | 'cancelled'
  | 'rework'
  | 'buffer';

const TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  queue: ['scheduled', 'ready', 'cancelled'],
  scheduled: ['ready', 'production', 'queue', 'cancelled'],
  ready: ['production', 'scheduled', 'queue', 'cancelled'],
  production: ['paused', 'delayed', 'finished', 'rework', 'cancelled'],
  paused: ['production', 'cancelled'],
  delayed: ['production', 'cancelled'],
  rework: ['production', 'finished', 'cancelled'],
  buffer: ['ready', 'scheduled', 'cancelled'],
  finished: [], // terminal
  cancelled: ['queue'], // allow re-queue
};

export function canTransition(from: JobStatus, to: JobStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function getValidTransitions(current: JobStatus): JobStatus[] {
  return TRANSITIONS[current] ?? [];
}

export function assertTransition(from: JobStatus, to: JobStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(
      `Transição inválida: "${from}" → "${to}". Transições válidas: ${getValidTransitions(from).join(', ') || 'nenhuma (estado terminal)'}`
    );
  }
}
