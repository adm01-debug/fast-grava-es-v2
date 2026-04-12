import { describe, it, expect } from 'vitest';
import { canTransition, getValidTransitions, assertTransition, type JobStatus } from '@/lib/jobStateMachine';

describe('jobStateMachine', () => {
  it('allows valid transitions', () => {
    expect(canTransition('queue', 'scheduled')).toBe(true);
    expect(canTransition('production', 'finished')).toBe(true);
    expect(canTransition('paused', 'production')).toBe(true);
    expect(canTransition('cancelled', 'queue')).toBe(true);
  });

  it('blocks invalid transitions', () => {
    expect(canTransition('finished', 'queue')).toBe(false);
    expect(canTransition('queue', 'finished')).toBe(false);
    expect(canTransition('queue', 'production')).toBe(false);
  });

  it('returns valid transitions for a status', () => {
    const transitions = getValidTransitions('production');
    expect(transitions).toContain('finished');
    expect(transitions).toContain('paused');
    expect(transitions).not.toContain('queue');
  });

  it('finished is terminal', () => {
    expect(getValidTransitions('finished')).toEqual([]);
  });

  it('assertTransition throws on invalid transition', () => {
    expect(() => assertTransition('finished', 'queue')).toThrow('Transição inválida');
  });

  it('assertTransition does not throw on valid transition', () => {
    expect(() => assertTransition('queue', 'scheduled')).not.toThrow();
  });
});
