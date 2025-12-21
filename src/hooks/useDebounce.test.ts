import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock implementation of useDebounce
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

import React from 'react';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 500));

      expect(result.current).toBe('initial');
    });

    it('should debounce value updates', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      expect(result.current).toBe('initial');

      rerender({ value: 'updated', delay: 500 });

      // Before delay
      expect(result.current).toBe('initial');

      // After delay
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('updated');
    });

    it('should reset timer on rapid updates', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'a', delay: 500 } }
      );

      rerender({ value: 'b', delay: 500 });
      act(() => {
        vi.advanceTimersByTime(200);
      });

      rerender({ value: 'c', delay: 500 });
      act(() => {
        vi.advanceTimersByTime(200);
      });

      rerender({ value: 'd', delay: 500 });
      
      // Still showing initial value
      expect(result.current).toBe('a');

      // Complete the delay
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Should show final value
      expect(result.current).toBe('d');
    });
  });

  describe('Delay Handling', () => {
    it('should work with zero delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 0 } }
      );

      rerender({ value: 'updated', delay: 0 });

      act(() => {
        vi.advanceTimersByTime(0);
      });

      expect(result.current).toBe('updated');
    });

    it('should handle delay changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      rerender({ value: 'updated', delay: 1000 });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Still initial because delay changed to 1000
      expect(result.current).toBe('initial');

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('updated');
    });
  });

  describe('Type Handling', () => {
    it('should work with numbers', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 0, delay: 500 } }
      );

      rerender({ value: 42, delay: 500 });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe(42);
    });

    it('should work with objects', () => {
      const initialObj = { name: 'test' };
      const updatedObj = { name: 'updated' };

      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: initialObj, delay: 500 } }
      );

      rerender({ value: updatedObj, delay: 500 });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toEqual(updatedObj);
    });

    it('should work with arrays', () => {
      const initialArr = [1, 2, 3];
      const updatedArr = [4, 5, 6];

      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: initialArr, delay: 500 } }
      );

      rerender({ value: updatedArr, delay: 500 });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toEqual(updatedArr);
    });

    it('should work with null', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial' as string | null, delay: 500 } }
      );

      rerender({ value: null, delay: 500 });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBeNull();
    });

    it('should work with undefined', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial' as string | undefined, delay: 500 } }
      );

      rerender({ value: undefined, delay: 500 });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBeUndefined();
    });
  });

  describe('Cleanup', () => {
    it('should cancel timeout on unmount', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { unmount } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });

    it('should cancel previous timeout on value change', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'a', delay: 500 } }
      );

      rerender({ value: 'b', delay: 500 });
      rerender({ value: 'c', delay: 500 });

      // clearTimeout should be called for each update
      expect(clearTimeoutSpy.mock.calls.length).toBeGreaterThan(0);
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle same value updates', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'same', delay: 500 } }
      );

      rerender({ value: 'same', delay: 500 });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('same');
    });

    it('should handle very long delays', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 10000 } }
      );

      rerender({ value: 'updated', delay: 10000 });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current).toBe('initial');

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current).toBe('updated');
    });
  });
});
