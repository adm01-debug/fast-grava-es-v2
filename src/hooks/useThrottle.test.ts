import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThrottle, useThrottleCallback, useThrottleState } from './useThrottle';

describe('useThrottle', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  describe('useThrottle', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useThrottle('initial', 300));
      expect(result.current).toBe('initial');
    });

    it('should throttle value updates', () => {
      const { result, rerender } = renderHook(({ value }) => useThrottle(value, 300), { initialProps: { value: 'first' } });
      expect(result.current).toBe('first');

      rerender({ value: 'second' });
      expect(result.current).toBe('first');

      act(() => { vi.advanceTimersByTime(300); });
      expect(result.current).toBe('second');
    });

    it('should update immediately after delay has passed', () => {
      const { result, rerender } = renderHook(({ value }) => useThrottle(value, 300), { initialProps: { value: 'first' } });

      act(() => { vi.advanceTimersByTime(300); });
      rerender({ value: 'second' });
      expect(result.current).toBe('second');
    });
  });

  describe('useThrottleCallback', () => {
    it('should call callback immediately on first call', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useThrottleCallback(callback, 300));

      act(() => { result.current('arg1'); });
      expect(callback).toHaveBeenCalledWith('arg1');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should throttle subsequent calls', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useThrottleCallback(callback, 300));

      act(() => { result.current('call1'); });
      act(() => { result.current('call2'); });
      act(() => { result.current('call3'); });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenLastCalledWith('call1');

      act(() => { vi.advanceTimersByTime(300); });
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith('call3');
    });
  });

  describe('useThrottleState', () => {
    it('should return initial value', () => {
      const { result } = renderHook(() => useThrottleState('initial', 300));
      const [value, _, throttledValue] = result.current;
      expect(value).toBe('initial');
      expect(throttledValue).toBe('initial');
    });

    it('should update value immediately but throttle throttledValue', () => {
      const { result } = renderHook(() => useThrottleState('initial', 300));

      act(() => { result.current[1]('updated'); });
      expect(result.current[0]).toBe('updated');
      expect(result.current[2]).toBe('initial');

      act(() => { vi.advanceTimersByTime(300); });
      expect(result.current[2]).toBe('updated');
    });
  });
});
