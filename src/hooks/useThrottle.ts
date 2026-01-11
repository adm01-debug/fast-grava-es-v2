import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * useThrottle - Returns a throttled value that updates at most once per delay
 */
export function useThrottle<T>(value: T, delay: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastExecuted.current;

    if (elapsed >= delay) {
      setThrottledValue(value);
      lastExecuted.current = now;
    } else {
      const timerId = setTimeout(() => {
        setThrottledValue(value);
        lastExecuted.current = Date.now();
      }, delay - elapsed);

      return () => clearTimeout(timerId);
    }
  }, [value, delay]);

  return throttledValue;
}

/**
 * useThrottleCallback - Returns a throttled version of a callback
 */
export function useThrottleCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300,
  deps: React.DependencyList = []
): T {
  const lastExecuted = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const elapsed = now - lastExecuted.current;
    lastArgsRef.current = args;

    if (elapsed >= delay) {
      callback(...args);
      lastExecuted.current = now;
    } else if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        if (lastArgsRef.current) {
          callback(...lastArgsRef.current);
        }
        lastExecuted.current = Date.now();
        timeoutRef.current = null;
      }, delay - elapsed);
    }
  }, [callback, delay, ...deps]) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

/**
 * useThrottleState - Returns state and setter where setter is throttled
 */
export function useThrottleState<T>(
  initialValue: T,
  delay: number = 300
): [T, (value: T) => void, T] {
  const [value, setValue] = useState<T>(initialValue);
  const [throttledValue, setThrottledValue] = useState<T>(initialValue);
  const lastExecuted = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setThrottled = useCallback((newValue: T) => {
    setValue(newValue);
    const now = Date.now();
    const elapsed = now - lastExecuted.current;

    if (elapsed >= delay) {
      setThrottledValue(newValue);
      lastExecuted.current = now;
    } else if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        setThrottledValue(newValue);
        lastExecuted.current = Date.now();
        timeoutRef.current = null;
      }, delay - elapsed);
    }
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [value, setThrottled, throttledValue];
}

/**
 * useThrottleEffect - Runs an effect at most once per delay
 */
export function useThrottleEffect(
  effect: () => void | (() => void),
  deps: React.DependencyList,
  delay: number = 300
): void {
  const lastExecuted = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleanupRef = useRef<(() => void) | void>();

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastExecuted.current;

    const execute = () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      cleanupRef.current = effect();
      lastExecuted.current = Date.now();
    };

    if (elapsed >= delay) {
      execute();
    } else if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        execute();
        timeoutRef.current = null;
      }, delay - elapsed);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [...deps, delay]);
}

/**
 * useThrottleMemo - Memoized value that updates at most once per delay
 */
export function useThrottleMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  delay: number = 300
): T {
  const value = useMemo(factory, deps);
  return useThrottle(value, delay);
}

export default useThrottle;
