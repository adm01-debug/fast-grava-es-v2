import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreaker, CircuitOpenError } from '@/lib/circuitBreaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      name: 'test',
      failureThreshold: 3,
      resetTimeout: 1000,
      successThreshold: 2,
    });
  });

  it('starts in closed state', () => {
    expect(breaker.state).toBe('closed');
  });

  it('passes through successful calls', async () => {
    const result = await breaker.execute(() => Promise.resolve(42));
    expect(result).toBe(42);
    expect(breaker.state).toBe('closed');
  });

  it('opens after reaching failure threshold', async () => {
    const fail = () => breaker.execute(() => Promise.reject(new Error('fail')));

    await expect(fail()).rejects.toThrow('fail');
    await expect(fail()).rejects.toThrow('fail');
    await expect(fail()).rejects.toThrow('fail');

    expect(breaker.state).toBe('open');
  });

  it('rejects immediately when open', async () => {
    // Force open
    for (let i = 0; i < 3; i++) {
      await breaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    }

    await expect(
      breaker.execute(() => Promise.resolve('should not run'))
    ).rejects.toThrow(CircuitOpenError);
  });

  it('transitions to half-open after resetTimeout', async () => {
    vi.useFakeTimers();

    for (let i = 0; i < 3; i++) {
      await breaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    }
    expect(breaker.state).toBe('open');

    vi.advanceTimersByTime(1100);
    expect(breaker.state).toBe('half_open');

    vi.useRealTimers();
  });

  it('closes after enough successes in half-open', async () => {
    vi.useFakeTimers();

    for (let i = 0; i < 3; i++) {
      await breaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    }

    vi.advanceTimersByTime(1100);
    expect(breaker.state).toBe('half_open');

    await breaker.execute(() => Promise.resolve('ok'));
    await breaker.execute(() => Promise.resolve('ok'));

    expect(breaker.state).toBe('closed');
    vi.useRealTimers();
  });

  it('goes back to open on failure in half-open', async () => {
    vi.useFakeTimers();

    for (let i = 0; i < 3; i++) {
      await breaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    }

    vi.advanceTimersByTime(1100);
    expect(breaker.state).toBe('half_open');

    await breaker.execute(() => Promise.reject(new Error('still failing'))).catch(() => {});
    expect(breaker.state).toBe('open');

    vi.useRealTimers();
  });

  it('resets failure count on success', async () => {
    await breaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    await breaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    expect(breaker.failureCount).toBe(2);

    await breaker.execute(() => Promise.resolve('ok'));
    expect(breaker.failureCount).toBe(0);
  });

  it('notifies listeners on state changes', async () => {
    const listener = vi.fn();
    breaker.onStateChange(listener);

    for (let i = 0; i < 3; i++) {
      await breaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    }

    expect(listener).toHaveBeenCalledWith('open');
  });

  it('unsubscribe removes listener', async () => {
    const listener = vi.fn();
    const unsubscribe = breaker.onStateChange(listener);
    unsubscribe();

    for (let i = 0; i < 3; i++) {
      await breaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    }

    expect(listener).not.toHaveBeenCalled();
  });

  it('manual reset returns to closed', async () => {
    for (let i = 0; i < 3; i++) {
      await breaker.execute(() => Promise.reject(new Error('fail'))).catch(() => {});
    }
    expect(breaker.state).toBe('open');

    breaker.reset();
    expect(breaker.state).toBe('closed');
    expect(breaker.failureCount).toBe(0);
  });

  it('preserves last error', async () => {
    await breaker.execute(() => Promise.reject(new Error('specific error'))).catch(() => {});
    expect(breaker.lastError?.message).toBe('specific error');
  });
});
