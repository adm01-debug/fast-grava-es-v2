import { useState, useEffect, useCallback, useRef } from 'react';

type SetValue<T> = T | ((prevValue: T) => T);

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  // Use ref to avoid re-creating readValue on each render
  const initialValueRef = useRef(initialValue);
  
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValueRef.current;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValueRef.current;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`Error reading localStorage key "${key}":`, error);
      }
      return initialValueRef.current;
    }
  }, [key]);

  // Initialize state with the value from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => readValue());

  // Store the latest value in a ref to avoid stale closures in setValue
  const storedValueRef = useRef(storedValue);
  storedValueRef.current = storedValue;

  const setValue = useCallback((value: SetValue<T>) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValueRef.current) : value;
      setStoredValue(valueToStore);
      storedValueRef.current = valueToStore;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        window.dispatchEvent(new StorageEvent('local-storage', { key }));
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key]);

  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        setStoredValue(initialValueRef.current);
        storedValueRef.current = initialValueRef.current;
        window.dispatchEvent(new StorageEvent('local-storage', { key }));
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`Error removing localStorage key "${key}":`, error);
      }
    }
  }, [key]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key || event.type === 'local-storage') {
        const newValue = readValue();
        setStoredValue(newValue);
        storedValueRef.current = newValue;
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange as EventListener);
    };
  }, [key, readValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
