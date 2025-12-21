import { useState, useCallback } from 'react';

export function useArray<T>(initialValue: T[] = []) {
  const [array, setArray] = useState(initialValue);

  const push = useCallback((item: T) => setArray(a => [...a, item]), []);
  const pop = useCallback(() => setArray(a => a.slice(0, -1)), []);
  const shift = useCallback(() => setArray(a => a.slice(1)), []);
  const unshift = useCallback((item: T) => setArray(a => [item, ...a]), []);
  const remove = useCallback((index: number) => setArray(a => a.filter((_, i) => i !== index)), []);
  const update = useCallback((index: number, item: T) => setArray(a => a.map((v, i) => i === index ? item : v)), []);
  const clear = useCallback(() => setArray([]), []);
  const filter = useCallback((fn: (item: T) => boolean) => setArray(a => a.filter(fn)), []);

  return { array, set: setArray, push, pop, shift, unshift, remove, update, clear, filter };
}
