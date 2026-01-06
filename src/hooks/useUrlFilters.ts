import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

type FilterValue = string | number | boolean | string[] | null;

interface UseUrlFiltersOptions<T extends Record<string, FilterValue>> {
  defaults: T;
  prefix?: string;
}

export function useUrlFilters<T extends Record<string, FilterValue>>({ 
  defaults, 
  prefix = '' 
}: UseUrlFiltersOptions<T>) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const result = { ...defaults } as T;

    Object.keys(defaults).forEach((key) => {
      const paramKey = prefix ? `${prefix}_${key}` : key;
      const value = searchParams.get(paramKey);
      
      if (value !== null) {
        const defaultValue = defaults[key as keyof T];
        
        if (typeof defaultValue === 'boolean') {
          (result as any)[key] = value === 'true';
        } else if (typeof defaultValue === 'number') {
          const parsed = parseFloat(value);
          if (!isNaN(parsed)) {
            (result as any)[key] = parsed;
          }
        } else if (Array.isArray(defaultValue)) {
          (result as any)[key] = value.split(',').filter(Boolean);
        } else {
          (result as any)[key] = value;
        }
      }
    });

    return result;
  }, [searchParams, defaults, prefix]);

  const setFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      const paramKey = prefix ? `${prefix}_${key as string}` : (key as string);
      const defaultValue = defaults[key];

      // Remove if same as default
      if (value === defaultValue || value === null || value === undefined) {
        params.delete(paramKey);
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          params.delete(paramKey);
        } else {
          params.set(paramKey, value.join(','));
        }
      } else {
        params.set(paramKey, String(value));
      }

      return params;
    }, { replace: true });
  }, [setSearchParams, defaults, prefix]);

  const setFilters = useCallback((newFilters: Partial<T>) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);

      Object.entries(newFilters).forEach(([key, value]) => {
        const paramKey = prefix ? `${prefix}_${key}` : key;
        const defaultValue = defaults[key as keyof T];

        if (value === defaultValue || value === null || value === undefined) {
          params.delete(paramKey);
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            params.delete(paramKey);
          } else {
            params.set(paramKey, value.join(','));
          }
        } else {
          params.set(paramKey, String(value));
        }
      });

      return params;
    }, { replace: true });
  }, [setSearchParams, defaults, prefix]);

  const resetFilters = useCallback(() => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      
      Object.keys(defaults).forEach((key) => {
        const paramKey = prefix ? `${prefix}_${key}` : key;
        params.delete(paramKey);
      });

      return params;
    }, { replace: true });
  }, [setSearchParams, defaults, prefix]);

  const hasActiveFilters = useMemo(() => {
    return Object.keys(defaults).some((key) => {
      const paramKey = prefix ? `${prefix}_${key}` : key;
      return searchParams.has(paramKey);
    });
  }, [searchParams, defaults, prefix]);

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    hasActiveFilters,
  };
}

// Helper to generate shareable URL with current filters
export function getShareableUrl(): string {
  return window.location.href;
}

// Helper to copy URL to clipboard
export async function copyFiltersUrl(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(window.location.href);
    return true;
  } catch {
    return false;
  }
}
