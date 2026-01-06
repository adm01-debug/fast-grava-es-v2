// Utility hooks - simplified exports
export { useLocalStorage } from '@/hooks/useLocalStorage';

import { useState, useCallback, useEffect, useRef } from 'react';

// Simple utility hooks implementations
export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    window.sessionStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue];
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), timeout);
  }, [timeout]);

  return { copy, copied };
}

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  return { isFullscreen, toggle };
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}

export function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

export function useScrollPosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setPosition({ x: window.scrollX, y: window.scrollY });
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return position;
}

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: WindowEventMap[K]) => savedHandler.current(event);
    window.addEventListener(eventName, eventListener);
    return () => window.removeEventListener(eventName, eventListener);
  }, [eventName]);
}

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [url]);

  return { data, isLoading, error };
}

export function useAsync<T>(asyncFn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    asyncFn()
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, deps);

  return { data, isLoading, error };
}

export function useToggle(initialValue = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle];
}

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  return {
    count,
    increment: () => setCount(c => c + 1),
    decrement: () => setCount(c => c - 1),
    reset: () => setCount(initialValue),
  };
}

export function useArray<T>(initialValue: T[] = []) {
  const [array, setArray] = useState(initialValue);
  return {
    array,
    push: (item: T) => setArray(a => [...a, item]),
    remove: (index: number) => setArray(a => a.filter((_, i) => i !== index)),
    clear: () => setArray([]),
  };
}

export function useMap<K, V>(initialValue: Map<K, V> = new Map()) {
  const [map, setMap] = useState(initialValue);
  return {
    map,
    set: (key: K, value: V) => setMap(m => new Map(m).set(key, value)),
    remove: (key: K) => {
      setMap(m => {
        const newMap = new Map(m);
        newMap.delete(key);
        return newMap;
      });
    },
  };
}

export function useSet<T>(initialValue: Set<T> = new Set()) {
  const [set, setSet] = useState(initialValue);
  return {
    set,
    add: (item: T) => setSet(s => new Set(s).add(item)),
    remove: (item: T) => {
      setSet(s => {
        const newSet = new Set(s);
        newSet.delete(item);
        return newSet;
      });
    },
  };
}

export function useQueue<T>(initialValue: T[] = []) {
  const [queue, setQueue] = useState(initialValue);
  return {
    queue,
    enqueue: (item: T) => setQueue(q => [...q, item]),
    dequeue: () => {
      const [first, ...rest] = queue;
      setQueue(rest);
      return first;
    },
  };
}

export function useUndo<T>(initialValue: T) {
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [index, setIndex] = useState(0);

  return {
    value: history[index],
    set: (value: T) => {
      setHistory(h => [...h.slice(0, index + 1), value]);
      setIndex(i => i + 1);
    },
    undo: () => setIndex(i => Math.max(0, i - 1)),
    redo: () => setIndex(i => Math.min(history.length - 1, i + 1)),
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  };
}

export function useForm<T extends Record<string, unknown>>(initialValues: T) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  return {
    values,
    errors,
    setFieldValue: (field: keyof T, value: unknown) => setValues(v => ({ ...v, [field]: value })),
    setFieldError: (field: keyof T, error: string) => setErrors(e => ({ ...e, [field]: error })),
    reset: () => {
      setValues(initialValues);
      setErrors({});
    },
  };
}

export function useValidation<T>(value: T, validators: ((v: T) => string | null)[]) {
  const [errors, setErrors] = useState<string[]>([]);

  const validate = useCallback(() => {
    const newErrors = validators.map(v => v(value)).filter(Boolean) as string[];
    setErrors(newErrors);
    return newErrors.length === 0;
  }, [value, validators]);

  return { errors, validate, isValid: errors.length === 0 };
}

export function usePagination(totalItems: number, itemsPerPage: number) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return {
    currentPage,
    totalPages,
    setPage: setCurrentPage,
    nextPage: () => setCurrentPage(p => Math.min(totalPages, p + 1)),
    prevPage: () => setCurrentPage(p => Math.max(1, p - 1)),
  };
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(setPosition, setError);
  }, []);

  return { position, error };
}
