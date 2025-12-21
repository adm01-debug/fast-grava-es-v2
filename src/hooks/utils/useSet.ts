import { useState, useCallback } from 'react';

export function useSet<T>(initialValue: Set<T> = new Set()) {
  const [set, setSet] = useState(initialValue);

  const add = useCallback((item: T) => setSet(s => new Set(s).add(item)), []);
  const remove = useCallback((item: T) => setSet(s => { const ns = new Set(s); ns.delete(item); return ns; }), []);
  const clear = useCallback(() => setSet(new Set()), []);
  const has = useCallback((item: T) => set.has(item), [set]);
  const toggle = useCallback((item: T) => setSet(s => { const ns = new Set(s); ns.has(item) ? ns.delete(item) : ns.add(item); return ns; }), []);

  return { set, add, remove, clear, has, toggle, size: set.size };
}
