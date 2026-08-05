import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CircuitBreaker, CircuitOpenError } from '@/lib/circuitBreaker';

const fail = () => Promise.reject(new Error('service error'));
const succeed = () => Promise.resolve('ok');

describe('CircuitBreaker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in closed state', () => {
    const cb = new CircuitBreaker({ failureThreshold: 3 });
    expect(cb.state).toBe('closed');
  });

  it('opens after failureThreshold failures', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 3, name: 'test' });

    for (let i = 0; i < 3; i++) {
      await expect(cb.execute(fail)).rejects.toThrow('service error');
    }

    expect(cb.state).toBe('open');
  });

  it('throws CircuitOpenError immediately when open', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1 });
    await expect(cb.execute(fail)).rejects.toThrow();
    await expect(cb.execute(succeed)).rejects.toThrow(CircuitOpenError);
  });

  it('transitions to half_open after resetTimeout', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1, resetTimeout: 5000 });
    await expect(cb.execute(fail)).rejects.toThrow();

    expect(cb.state).toBe('open');
    vi.advanceTimersByTime(5001);
    expect(cb.state).toBe('half_open');
  });

  it('closes after successThreshold successes in half_open', async () => {
    const cb = new CircuitBreaker({
      failureThreshold: 1,
      resetTimeout: 1000,
      successThreshold: 2,
    });

    await expect(cb.execute(fail)).rejects.toThrow();
    vi.advanceTimersByTime(1001);

    await cb.execute(succeed);
    await cb.execute(succeed);
    expect(cb.state).toBe('closed');
  });

  it('goes back to open on failure in half_open', async () => {
    const cb = new CircuitBreaker({
      failureThreshold: 1,
      resetTimeout: 1000,
      successThreshold: 2,
    });

    await expect(cb.execute(fail)).rejects.toThrow();
    vi.advanceTimersByTime(1001);

    await expect(cb.execute(fail)).rejects.toThrow();
    expect(cb.state).toBe('open');
  });

  it('notifies listeners on state changes', async () => {
    const states: string[] = [];
    const cb = new CircuitBreaker({ failureThreshold: 1, name: 'notify-test' });
    cb.onStateChange((s) => states.push(s));

    await expect(cb.execute(fail)).rejects.toThrow();
    expect(states).toContain('open');
  });

  it('reset clears state', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1 });
    await expect(cb.execute(fail)).rejects.toThrow();
    cb.reset();
    expect(cb.state).toBe('closed');
    expect(cb.failureCount).toBe(0);
  });
});
