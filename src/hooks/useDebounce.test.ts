import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback,
  useDebouncedState,
  useDebounceWithLoading,
  useSearchDebounce,
} from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'update1' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: 'update2' });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    rerender({ value: 'update3' });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('update3');
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce callback execution', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current.debouncedCallback('arg1');
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledWith('arg1');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should cancel pending execution', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current.debouncedCallback('arg1');
    });

    act(() => {
      result.current.cancel();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should flush pending execution immediately', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current.debouncedCallback('arg1');
    });

    act(() => {
      result.current.flush();
    });

    expect(callback).toHaveBeenCalledWith('arg1');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should track isPending state', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    expect(result.current.isPending).toBe(false);

    act(() => {
      result.current.debouncedCallback('arg1');
    });

    expect(result.current.isPending).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isPending).toBe(false);
  });

  it('should only execute last call when multiple calls are made', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current.debouncedCallback('arg1');
      result.current.debouncedCallback('arg2');
      result.current.debouncedCallback('arg3');
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg3');
  });
});

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useThrottle('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should throttle value updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 500),
      { initialProps: { value: 'initial' } }
    );

    // First update should go through immediately (first render)
    rerender({ value: 'update1' });
    
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Should not update yet
    rerender({ value: 'update2' });
    
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'update3' });

    // After throttle period, should have latest value
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('update3');
  });
});

describe('useThrottledCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should execute immediately on first call', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 500));

    act(() => {
      result.current('arg1');
    });

    expect(callback).toHaveBeenCalledWith('arg1');
  });

  it('should throttle subsequent calls', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 500));

    act(() => {
      result.current('arg1');
      result.current('arg2');
      result.current('arg3');
    });

    // Only first call should go through immediately
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg1');

    // After throttle period, last call should execute
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('arg3');
  });
});

describe('useDebouncedState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return debounced value, setter, and immediate value', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 500));

    const [debouncedValue, setValue, immediateValue] = result.current;

    expect(debouncedValue).toBe('initial');
    expect(immediateValue).toBe('initial');
    expect(typeof setValue).toBe('function');
  });

  it('should update immediate value immediately and debounce main value', () => {
    const { result } = renderHook(() => useDebouncedState('initial', 500));

    act(() => {
      result.current[1]('updated');
    });

    // Immediate value updates immediately
    expect(result.current[2]).toBe('updated');
    // Debounced value is still old
    expect(result.current[0]).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now debounced value is updated
    expect(result.current[0]).toBe('updated');
  });
});

describe('useDebounceWithLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not show loading on initial render', () => {
    const { result } = renderHook(() => useDebounceWithLoading('initial', 500));

    expect(result.current.debouncedValue).toBe('initial');
    expect(result.current.isDebouncing).toBe(false);
  });

  it('should show loading during debounce', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounceWithLoading(value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    expect(result.current.isDebouncing).toBe(true);
    expect(result.current.debouncedValue).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isDebouncing).toBe(false);
    expect(result.current.debouncedValue).toBe('updated');
  });
});

describe('useSearchDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return empty string when value is below minLength', () => {
    const { result } = renderHook(() =>
      useSearchDebounce('ab', { delay: 300, minLength: 3 })
    );

    expect(result.current.debouncedValue).toBe('');
    expect(result.current.isValid).toBe(false);
  });

  it('should return value when valid', () => {
    const { result } = renderHook(() =>
      useSearchDebounce('search term', { delay: 300, minLength: 3 })
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.debouncedValue).toBe('search term');
    expect(result.current.isValid).toBe(true);
  });

  it('should detect empty state', () => {
    const { result } = renderHook(() => useSearchDebounce('', { delay: 300 }));

    expect(result.current.isEmpty).toBe(true);
    expect(result.current.isSearching).toBe(false);
  });

  it('should show isSearching during debounce for valid input', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useSearchDebounce(value, { delay: 300, minLength: 3 }),
      { initialProps: { value: '' } }
    );

    rerender({ value: 'search' });

    expect(result.current.isSearching).toBe(true);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isSearching).toBe(false);
  });

  it('should trim value by default', () => {
    const { result } = renderHook(() =>
      useSearchDebounce('  search  ', { delay: 300 })
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.debouncedValue).toBe('search');
  });

  it('should not trim value when disabled', () => {
    const { result } = renderHook(() =>
      useSearchDebounce('  search  ', { delay: 300, trimValue: false })
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.debouncedValue).toBe('  search  ');
  });
});
