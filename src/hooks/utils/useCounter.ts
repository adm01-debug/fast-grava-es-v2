import { useState, useCallback } from 'react';

export function useCounter(initialValue = 0, { min, max, step = 1 }: { min?: number; max?: number; step?: number } = {}) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => setCount(c => max !== undefined ? Math.min(c + step, max) : c + step), [max, step]);
  const decrement = useCallback(() => setCount(c => min !== undefined ? Math.max(c - step, min) : c - step), [min, step]);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  const set = useCallback((value: number) => {
    let newValue = value;
    if (min !== undefined) newValue = Math.max(newValue, min);
    if (max !== undefined) newValue = Math.min(newValue, max);
    setCount(newValue);
  }, [min, max]);

  return { count, increment, decrement, reset, set };
}
