import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebouncedCallback, useDebouncedState, useDebounceWithLoading } from '../../hooks/useDebounce';

describe('useDebouncedCallback', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('delays callback execution', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => { result.current.debouncedCallback('test'); });
    expect(callback).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(300); });
    expect(callback).toHaveBeenCalledWith('test');
  });

  it('cancels pending callback', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => { result.current.debouncedCallback('test'); });
    act(() => { result.current.cancel(); });

    act(() => { vi.advanceTimersByTime(300); });
    expect(callback).not.toHaveBeenCalled();
  });

  it('flushes pending callback immediately', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => { result.current.debouncedCallback('test'); });
    act(() => { result.current.flush(); });

    expect(callback).toHaveBeenCalledWith('test');
  });

  it('reports isPending correctly', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    expect(result.current.isPending).toBe(false);

    act(() => { result.current.debouncedCallback('test'); });
    expect(result.current.isPending).toBe(true);

    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current.isPending).toBe(false);
  });

  it('debounces rapid calls', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current.debouncedCallback('a');
      result.current.debouncedCallback('b');
      result.current.debouncedCallback('c');
    });

    act(() => { vi.advanceTimersByTime(300); });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('c');
  });
});

describe('useDebouncedState', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns initial value', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 300));
    const [debounced, , immediate] = result.current;
    expect(debounced).toBe('initial');
    expect(immediate).toBe('initial');
  });

  it('updates immediate value instantly', () => {
    const { result } = renderHook(() => useDebouncedState('', 300));

    act(() => { result.current[1]('new'); });

    const [debounced, , immediate] = result.current;
    expect(immediate).toBe('new');
    expect(debounced).toBe(''); // still debouncing
  });

  it('updates debounced value after delay', () => {
    const { result } = renderHook(() => useDebouncedState('', 300));

    act(() => { result.current[1]('new'); });
    act(() => { vi.advanceTimersByTime(300); });

    expect(result.current[0]).toBe('new');
  });
});

describe('useDebounceWithLoading', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('not debouncing on initial render', () => {
    const { result } = renderHook(() => useDebounceWithLoading('test', 300));
    expect(result.current.isDebouncing).toBe(false);
    expect(result.current.debouncedValue).toBe('test');
  });

  it('shows debouncing state during delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounceWithLoading(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'ab' });
    expect(result.current.isDebouncing).toBe(true);

    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current.isDebouncing).toBe(false);
    expect(result.current.debouncedValue).toBe('ab');
  });
});
