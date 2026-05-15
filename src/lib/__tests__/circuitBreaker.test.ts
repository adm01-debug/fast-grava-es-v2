import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CircuitBreaker, CircuitOpenError } from '../circuitBreaker';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    vi.useFakeTimers();
    breaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeout: 1000,
      successThreshold: 2,
      name: 'test-breaker'
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in CLOSED state', () => {
    expect(breaker.state).toBe('closed');
  });

  it('allows requests in CLOSED state', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    const result = await breaker.execute(fn);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(breaker.state).toBe('closed');
  });

  it('transitions to OPEN state after failure threshold is reached', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    
    // First failure
    await expect(breaker.execute(fn)).rejects.toThrow('fail');
    expect(breaker.state).toBe('closed');
    
    // Second failure (threshold)
    await expect(breaker.execute(fn)).rejects.toThrow('fail');
    expect(breaker.state).toBe('open');
  });

  it('fails fast when in OPEN state', async () => {
    const failFn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(breaker.execute(failFn)).rejects.toThrow();
    await expect(breaker.execute(failFn)).rejects.toThrow();
    expect(breaker.state).toBe('open');

    const successFn = vi.fn().mockResolvedValue('ok');
    await expect(breaker.execute(successFn)).rejects.toThrow(CircuitOpenError);
    expect(successFn).not.toHaveBeenCalled();
  });

  it('transitions to HALF_OPEN after resetTimeout', async () => {
    const failFn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(breaker.execute(failFn)).rejects.toThrow();
    await expect(breaker.execute(failFn)).rejects.toThrow();
    expect(breaker.state).toBe('open');

    // Advance time
    vi.advanceTimersByTime(1100);
    expect(breaker.state).toBe('half_open');
  });

  it('closes circuit after successful calls in HALF_OPEN state', async () => {
    // Force open
    const failFn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(breaker.execute(failFn)).rejects.toThrow();
    await expect(breaker.execute(failFn)).rejects.toThrow();
    
    vi.advanceTimersByTime(1100);
    expect(breaker.state).toBe('half_open');

    // First success in half-open
    const successFn = vi.fn().mockResolvedValue('ok');
    await breaker.execute(successFn);
    expect(breaker.state).toBe('half_open');

    // Second success (threshold)
    await breaker.execute(successFn);
    expect(breaker.state).toBe('closed');
  });

  it('re-opens circuit on failure in HALF_OPEN state', async () => {
    // Force open
    const failFn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(breaker.execute(failFn)).rejects.toThrow();
    await expect(breaker.execute(failFn)).rejects.toThrow();
    
    vi.advanceTimersByTime(1100);
    expect(breaker.state).toBe('half_open');

    // Failure in half-open
    const newFailFn = vi.fn().mockRejectedValue(new Error('new fail'));
    await expect(breaker.execute(newFailFn)).rejects.toThrow('new fail');
    expect(breaker.state).toBe('open');
  });
});

