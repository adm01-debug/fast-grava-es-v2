import { useCallback, useRef } from 'react';

/**
 * Returns a throttled version of the callback that executes at most once per `delay` ms.
 */
export function useThrottle<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    ((...args: unknown[]) => {
      const now = Date.now();
      const remaining = delay - (now - lastCall.current);

      if (remaining <= 0) {
        lastCall.current = now;
        callback(...args);
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          timeoutRef.current = null;
          callback(...args);
        }, remaining);
      }
    }) as T,
    [callback, delay]
  );
}
