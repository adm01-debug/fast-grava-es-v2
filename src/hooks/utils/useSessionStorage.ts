import { useState, useCallback } from 'react';

export function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    window.sessionStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}
