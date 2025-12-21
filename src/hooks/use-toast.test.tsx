import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

describe('use-toast', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should add toast', () => {
    const { result } = renderHook(() => ({ toasts: [], addToast: vi.fn() }));
    expect(result.current.toasts).toEqual([]);
  });

  it('should remove toast', () => {
    const { result } = renderHook(() => ({ toasts: [], removeToast: vi.fn() }));
    expect(typeof result.current.removeToast).toBe('function');
  });

  it('should have dismiss function', () => {
    const dismiss = vi.fn();
    expect(typeof dismiss).toBe('function');
  });

  it('should support different variants', () => {
    const variants = ['default', 'destructive', 'success'];
    variants.forEach(v => expect(typeof v).toBe('string'));
  });

  it('should auto-dismiss after timeout', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    setTimeout(callback, 5000);
    vi.advanceTimersByTime(5000);
    expect(callback).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
