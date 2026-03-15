import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useSearchDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );

    rerender({ value: 'ab', delay: 300 });
    expect(result.current).toBe('a');

    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('ab');
  });

  it('resets timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'ab' });
    act(() => { vi.advanceTimersByTime(200); });

    rerender({ value: 'abc' });
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe('a'); // still debouncing

    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe('abc');
  });
});

describe('useSearchDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns empty string for values below minLength', () => {
    const { result } = renderHook(() =>
      useSearchDebounce('ab', { delay: 300, minLength: 3 })
    );
    expect(result.current.debouncedValue).toBe('');
    expect(result.current.isValid).toBe(false);
  });

  it('detects empty values', () => {
    const { result } = renderHook(() =>
      useSearchDebounce('', { delay: 300 })
    );
    expect(result.current.isEmpty).toBe(true);
  });

  it('trims values by default', () => {
    const { result } = renderHook(() =>
      useSearchDebounce('  hello  ', { delay: 0 })
    );
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current.debouncedValue).toBe('hello');
  });
});
