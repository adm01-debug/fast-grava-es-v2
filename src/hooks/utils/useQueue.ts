import { useState, useCallback } from 'react';

export function useQueue<T>(initialValue: T[] = []) {
  const [queue, setQueue] = useState(initialValue);

  const enqueue = useCallback((item: T) => setQueue(q => [...q, item]), []);
  const dequeue = useCallback(() => { let item: T | undefined; setQueue(q => { item = q[0]; return q.slice(1); }); return item; }, []);
  const peek = useCallback(() => queue[0], [queue]);
  const clear = useCallback(() => setQueue([]), []);

  return { queue, enqueue, dequeue, peek, clear, size: queue.length, isEmpty: queue.length === 0 };
}
