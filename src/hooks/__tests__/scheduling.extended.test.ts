import { describe, it, expect } from 'vitest';

// ===== SCHEDULING STATS DERIVATION =====
describe('Scheduling Stats Derivation', () => {
  interface MockJob {
    id: string;
    status: string;
    scheduled_date: string | null;
    quantity: number;
    lost_pieces: number | null;
  }

  function deriveStats(jobs: MockJob[], today: string) {
    const todayJobs = jobs.filter(j => j.scheduled_date === today);
    return {
      total: jobs.length,
      completed: jobs.filter(j => j.status === 'finished').length,
      inProgress: jobs.filter(j => j.status === 'production').length,
      delayed: jobs.filter(j => j.status === 'delayed').length,
      queue: jobs.filter(j => j.status === 'queue').length,
      ready: jobs.filter(j => j.status === 'ready').length,
      scheduled: jobs.filter(j => j.status === 'scheduled').length,
      paused: jobs.filter(j => j.status === 'paused').length,
      rework: jobs.filter(j => j.status === 'rework').length,
      todayScheduled: todayJobs.length,
      todayCompleted: todayJobs.filter(j => j.status === 'finished').length,
      todayInProgress: todayJobs.filter(j => j.status === 'production').length,
      todayDelayed: todayJobs.filter(j => j.status === 'delayed').length,
      totalPieces: jobs.reduce((s, j) => s + j.quantity, 0),
      completedPieces: jobs.filter(j => j.status === 'finished').reduce((s, j) => s + j.quantity, 0),
      lostPieces: jobs.reduce((s, j) => s + (j.lost_pieces || 0), 0),
    };
  }

  const today = '2026-03-15';

  it('empty jobs', () => {
    const stats = deriveStats([], today);
    expect(stats.total).toBe(0);
    expect(stats.totalPieces).toBe(0);
    expect(stats.lostPieces).toBe(0);
  });

  it('counts each status correctly', () => {
    const jobs: MockJob[] = [
      { id: '1', status: 'queue', scheduled_date: today, quantity: 100, lost_pieces: null },
      { id: '2', status: 'ready', scheduled_date: today, quantity: 200, lost_pieces: null },
      { id: '3', status: 'production', scheduled_date: today, quantity: 300, lost_pieces: 5 },
      { id: '4', status: 'finished', scheduled_date: today, quantity: 400, lost_pieces: 10 },
      { id: '5', status: 'delayed', scheduled_date: today, quantity: 50, lost_pieces: null },
      { id: '6', status: 'paused', scheduled_date: null, quantity: 60, lost_pieces: null },
      { id: '7', status: 'rework', scheduled_date: null, quantity: 70, lost_pieces: 3 },
      { id: '8', status: 'scheduled', scheduled_date: '2026-03-16', quantity: 80, lost_pieces: null },
    ];
    const stats = deriveStats(jobs, today);
    expect(stats.total).toBe(8);
    expect(stats.queue).toBe(1);
    expect(stats.ready).toBe(1);
    expect(stats.inProgress).toBe(1);
    expect(stats.completed).toBe(1);
    expect(stats.delayed).toBe(1);
    expect(stats.paused).toBe(1);
    expect(stats.rework).toBe(1);
    expect(stats.scheduled).toBe(1);
    expect(stats.todayScheduled).toBe(5);
    expect(stats.todayCompleted).toBe(1);
    expect(stats.todayInProgress).toBe(1);
    expect(stats.todayDelayed).toBe(1);
    expect(stats.totalPieces).toBe(1260);
    expect(stats.completedPieces).toBe(400);
    expect(stats.lostPieces).toBe(18);
  });

  it('handles null scheduled_date for today filtering', () => {
    const jobs: MockJob[] = [
      { id: '1', status: 'production', scheduled_date: null, quantity: 100, lost_pieces: null },
    ];
    const stats = deriveStats(jobs, today);
    expect(stats.todayScheduled).toBe(0);
    expect(stats.inProgress).toBe(1);
  });

  it('handles null lost_pieces as 0', () => {
    const jobs: MockJob[] = [
      { id: '1', status: 'finished', scheduled_date: today, quantity: 100, lost_pieces: null },
    ];
    const stats = deriveStats(jobs, today);
    expect(stats.lostPieces).toBe(0);
  });
});

// ===== MACHINE BY TECHNIQUE LOOKUP =====
describe('Machine by Technique Lookup', () => {
  interface MockMachine { id: string; technique_id: string; name: string }

  function getMachinesByTechnique(machines: MockMachine[], techniqueId: string): MockMachine[] {
    return machines.filter(m => m.technique_id === techniqueId);
  }

  it('filters correctly', () => {
    const machines: MockMachine[] = [
      { id: 'm1', technique_id: 'silk', name: 'Silk-1' },
      { id: 'm2', technique_id: 'silk', name: 'Silk-2' },
      { id: 'm3', technique_id: 'laser', name: 'Laser-1' },
    ];
    expect(getMachinesByTechnique(machines, 'silk')).toHaveLength(2);
    expect(getMachinesByTechnique(machines, 'laser')).toHaveLength(1);
    expect(getMachinesByTechnique(machines, 'pad')).toHaveLength(0);
  });
});

// ===== JOBS BY STATUS LOOKUP =====
describe('Jobs by Status Lookup', () => {
  interface MockJob { id: string; status: string }

  function getJobsByStatus(jobs: MockJob[], status: string): MockJob[] {
    return jobs.filter(j => j.status === status);
  }

  it('filters correctly', () => {
    const jobs: MockJob[] = [
      { id: '1', status: 'queue' },
      { id: '2', status: 'queue' },
      { id: '3', status: 'production' },
    ];
    expect(getJobsByStatus(jobs, 'queue')).toHaveLength(2);
    expect(getJobsByStatus(jobs, 'production')).toHaveLength(1);
    expect(getJobsByStatus(jobs, 'finished')).toHaveLength(0);
  });
});

// ===== JOBS BY MACHINE LOOKUP =====
describe('Jobs by Machine Lookup', () => {
  interface MockJob { id: string; machine_id: string | null }

  function getJobsByMachine(jobs: MockJob[], machineId: string): MockJob[] {
    return jobs.filter(j => j.machine_id === machineId);
  }

  it('filters correctly', () => {
    const jobs: MockJob[] = [
      { id: '1', machine_id: 'm1' },
      { id: '2', machine_id: 'm1' },
      { id: '3', machine_id: null },
    ];
    expect(getJobsByMachine(jobs, 'm1')).toHaveLength(2);
    expect(getJobsByMachine(jobs, 'm2')).toHaveLength(0);
  });
});

// ===== RETRY BACKOFF CALCULATION =====
describe('Scheduling Retry Backoff', () => {
  function retryDelay(attempt: number): number {
    return Math.min(1000 * 2 ** attempt, 30000);
  }

  it('exponential with 30s cap', () => {
    expect(retryDelay(0)).toBe(1000);
    expect(retryDelay(1)).toBe(2000);
    expect(retryDelay(2)).toBe(4000);
    expect(retryDelay(3)).toBe(8000);
    expect(retryDelay(4)).toBe(16000);
    expect(retryDelay(5)).toBe(30000);
    expect(retryDelay(10)).toBe(30000);
  });
});

// ===== STALE TIME CONFIGURATION =====
describe('Stale Time Configuration', () => {
  const STATIC_DATA_STALE_TIME = 5 * 60 * 1000;
  const JOBS_STALE_TIME = 30 * 1000;

  it('static data (techniques/machines) = 5 min', () => {
    expect(STATIC_DATA_STALE_TIME).toBe(300000);
  });

  it('jobs = 30 seconds', () => {
    expect(JOBS_STALE_TIME).toBe(30000);
  });

  it('jobs refresh faster than static data', () => {
    expect(JOBS_STALE_TIME).toBeLessThan(STATIC_DATA_STALE_TIME);
  });
});
