import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * useDebounce - Delays updating a value until after a specified delay
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 * 
 * @example
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 300);
 * 
 * useEffect(() => {
 *   // This will only run after 300ms of no changes
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useDebouncedCallback - Returns a debounced version of a callback
 * 
 * @param callback - The callback function to debounce
 * @param delay - Delay in milliseconds
 * @param deps - Dependencies array (like useCallback)
 * @returns Object with debounced callback, cancel, and flush functions
 * 
 * @example
 * const { debouncedCallback, cancel, flush } = useDebouncedCallback(
 *   (value) => saveToServer(value),
 *   500,
 *   [saveToServer]
 * );
 * 
 * // Use debouncedCallback in onChange handlers
 * <input onChange={(e) => debouncedCallback(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): {
  debouncedCallback: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: () => void;
  isPending: boolean;
} {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Update callback ref on each render
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      lastArgsRef.current = null;
      setIsPending(false);
    }
  }, []);

  const flush = useCallback(() => {
    if (timerRef.current && lastArgsRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      callbackRef.current(...lastArgsRef.current);
      lastArgsRef.current = null;
      setIsPending(false);
    }
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      lastArgsRef.current = args;
      
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      setIsPending(true);
      
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
        timerRef.current = null;
        lastArgsRef.current = null;
        setIsPending(false);
      }, delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay, ...deps]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { debouncedCallback, cancel, flush, isPending };
}

/**
 * useThrottle - Limits how often a value can update
 * 
 * @param value - The value to throttle
 * @param limit - Minimum time between updates in milliseconds
 * @returns The throttled value
 * 
 * @example
 * const [scrollY, setScrollY] = useState(0);
 * const throttledScrollY = useThrottle(scrollY, 100);
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    
    if (now - lastRan.current >= limit) {
      setThrottledValue(value);
      lastRan.current = now;
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }, limit - (now - lastRan.current));

      return () => {
        clearTimeout(timer);
      };
    }
  }, [value, limit]);

  return throttledValue;
}

/**
 * useThrottledCallback - Returns a throttled version of a callback
 * 
 * @param callback - The callback function to throttle
 * @param limit - Minimum time between calls in milliseconds
 * @param deps - Dependencies array
 * @returns Throttled callback function
 * 
 * @example
 * const handleScroll = useThrottledCallback(
 *   () => updateScrollPosition(),
 *   100,
 *   []
 * );
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
  const lastRan = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref on each render
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastRan.current >= limit) {
        callbackRef.current(...args);
        lastRan.current = now;
      } else {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        
        timerRef.current = setTimeout(() => {
          callbackRef.current(...args);
          lastRan.current = Date.now();
          timerRef.current = null;
        }, limit - (now - lastRan.current));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [limit, ...deps]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

/**
 * useDebouncedState - State that debounces updates
 * 
 * @param initialValue - Initial state value
 * @param delay - Delay in milliseconds
 * @returns [debouncedValue, setValue, immediateValue]
 * 
 * @example
 * const [debouncedSearch, setSearch, immediateSearch] = useDebouncedState('', 300);
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): [T, (value: T) => void, T] {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(value, delay);

  return [debouncedValue, setValue, value];
}

/**
 * useDebounceWithLoading - Debounce with loading state indicator
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns Object with debounced value and loading state
 * 
 * @example
 * const { debouncedValue, isDebouncing } = useDebounceWithLoading(search, 300);
 * 
 * return (
 *   <>
 *     <input value={search} onChange={(e) => setSearch(e.target.value)} />
 *     {isDebouncing && <Spinner />}
 *   </>
 * );
 */
export function useDebounceWithLoading<T>(
  value: T,
  delay: number
): { debouncedValue: T; isDebouncing: boolean } {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setIsDebouncing(true);

    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return { debouncedValue, isDebouncing };
}

/**
 * useSearchDebounce - Specialized debounce for search inputs
 * Includes minimum character requirement and loading state
 * 
 * @param value - The search value
 * @param options - Configuration options
 * @returns Object with debounced value, loading state, and validation
 * 
 * @example
 * const { debouncedValue, isSearching, isValid } = useSearchDebounce(search, {
 *   delay: 300,
 *   minLength: 3,
 * });
 */
export function useSearchDebounce(
  value: string,
  options: {
    delay?: number;
    minLength?: number;
    trimValue?: boolean;
  } = {}
): {
  debouncedValue: string;
  isSearching: boolean;
  isValid: boolean;
  isEmpty: boolean;
} {
  const { delay = 300, minLength = 0, trimValue = true } = options;
  
  const processedValue = useMemo(
    () => (trimValue ? value.trim() : value),
    [value, trimValue]
  );
  
  const { debouncedValue, isDebouncing } = useDebounceWithLoading(
    processedValue,
    delay
  );

  const isValid = processedValue.length >= minLength;
  const isEmpty = processedValue.length === 0;
  const isSearching = isDebouncing && isValid && !isEmpty;

  return {
    debouncedValue: isValid ? debouncedValue : '',
    isSearching,
    isValid,
    isEmpty,
  };
}
