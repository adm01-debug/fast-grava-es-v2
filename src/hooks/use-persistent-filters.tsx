import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

// ============================================
// PERSISTENT FILTERS HOOK
// ============================================

interface UsePersistentFiltersOptions<T> {
  key: string;
  defaultFilters: T;
  syncToUrl?: boolean;
  debounceMs?: number;
}

export function usePersistentFilters<T extends Record<string, unknown>>({
  key,
  defaultFilters,
  syncToUrl = false,
  debounceMs = 300
}: UsePersistentFiltersOptions<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize from URL or localStorage
  const getInitialFilters = useCallback((): T => {
    if (syncToUrl) {
      const urlFilters: Partial<T> = {};
      searchParams.forEach((value, key) => {
        try {
          urlFilters[key as keyof T] = JSON.parse(value) as T[keyof T];
        } catch {
          urlFilters[key as keyof T] = value as T[keyof T];
        }
      });
      if (Object.keys(urlFilters).length > 0) {
        return { ...defaultFilters, ...urlFilters };
      }
    }

    try {
      const stored = localStorage.getItem(`filters_${key}`);
      if (stored) {
        return { ...defaultFilters, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore parse errors
    }

    return defaultFilters;
  }, [key, defaultFilters, syncToUrl, searchParams]);

  const [filters, setFiltersInternal] = useState<T>(getInitialFilters);
  const [isDirty, setIsDirty] = useState(false);

  // Debounced persistence
  useEffect(() => {
    const timer = setTimeout(() => {
      // Save to localStorage
      localStorage.setItem(`filters_${key}`, JSON.stringify(filters));

      // Sync to URL if enabled
      if (syncToUrl) {
        const newParams = new URLSearchParams();
        Object.entries(filters).forEach(([filterKey, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'object') {
              newParams.set(filterKey, JSON.stringify(value));
            } else {
              newParams.set(filterKey, String(value));
            }
          }
        });
        setSearchParams(newParams, { replace: true });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [filters, key, syncToUrl, debounceMs, setSearchParams]);

  // Set a single filter
  const setFilter = useCallback(<K extends keyof T>(filterKey: K, value: T[K]) => {
    setFiltersInternal(prev => {
      const newFilters = { ...prev, [filterKey]: value };
      setIsDirty(true);
      return newFilters;
    });
  }, []);

  // Set multiple filters at once
  const setFilters = useCallback((newFilters: Partial<T>) => {
    setFiltersInternal(prev => {
      const updated = { ...prev, ...newFilters };
      setIsDirty(true);
      return updated;
    });
  }, []);

  // Reset to defaults
  const resetFilters = useCallback(() => {
    setFiltersInternal(defaultFilters);
    setIsDirty(false);
    localStorage.removeItem(`filters_${key}`);
    if (syncToUrl) {
      setSearchParams(new URLSearchParams(), { replace: true });
    }
  }, [defaultFilters, key, syncToUrl, setSearchParams]);

  // Check if filters match defaults
  const isDefault = useMemo(() => {
    return JSON.stringify(filters) === JSON.stringify(defaultFilters);
  }, [filters, defaultFilters]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      const defaultValue = defaultFilters[key as keyof T];
      return value !== defaultValue && value !== '' && value !== null && value !== undefined;
    }).length;
  }, [filters, defaultFilters]);

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    isDirty,
    isDefault,
    activeFilterCount
  };
}

// ============================================
// SAVED FILTERS HOOK
// ============================================

interface SavedFilter<T> {
  id: string;
  name: string;
  filters: T;
  createdAt: string;
  isDefault?: boolean;
}

interface UseSavedFiltersOptions<T> {
  key: string;
  maxSaved?: number;
}

export function useSavedFilters<T extends Record<string, unknown>>({
  key,
  maxSaved = 10
}: UseSavedFiltersOptions<T>) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter<T>[]>(() => {
    try {
      const stored = localStorage.getItem(`saved_filters_${key}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(`saved_filters_${key}`, JSON.stringify(savedFilters));
  }, [savedFilters, key]);

  // Save current filters
  const saveFilter = useCallback((name: string, filters: T) => {
    const newFilter: SavedFilter<T> = {
      id: `filter_${Date.now()}`,
      name,
      filters,
      createdAt: new Date().toISOString()
    };

    setSavedFilters(prev => {
      const updated = [newFilter, ...prev].slice(0, maxSaved);
      return updated;
    });

    return newFilter.id;
  }, [maxSaved]);

  // Delete a saved filter
  const deleteFilter = useCallback((id: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== id));
  }, []);

  // Update a saved filter
  const updateFilter = useCallback((id: string, updates: Partial<SavedFilter<T>>) => {
    setSavedFilters(prev => 
      prev.map(f => f.id === id ? { ...f, ...updates } : f)
    );
  }, []);

  // Set default filter
  const setDefaultFilter = useCallback((id: string | null) => {
    setSavedFilters(prev => 
      prev.map(f => ({ ...f, isDefault: f.id === id }))
    );
  }, []);

  // Get default filter
  const defaultFilter = useMemo(() => {
    return savedFilters.find(f => f.isDefault);
  }, [savedFilters]);

  return {
    savedFilters,
    saveFilter,
    deleteFilter,
    updateFilter,
    setDefaultFilter,
    defaultFilter
  };
}

// ============================================
// FILTER PRESETS HOOK
// ============================================

interface FilterPreset<T> {
  id: string;
  label: string;
  description?: string;
  filters: Partial<T>;
  icon?: string;
}

interface UseFilterPresetsOptions<T> {
  presets: FilterPreset<T>[];
  onApply?: (filters: Partial<T>) => void;
}

export function useFilterPresets<T extends Record<string, unknown>>({
  presets,
  onApply
}: UseFilterPresetsOptions<T>) {
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const applyPreset = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setActivePresetId(presetId);
      onApply?.(preset.filters);
    }
  }, [presets, onApply]);

  const clearPreset = useCallback(() => {
    setActivePresetId(null);
  }, []);

  const activePreset = useMemo(() => {
    return presets.find(p => p.id === activePresetId);
  }, [presets, activePresetId]);

  return {
    presets,
    activePresetId,
    activePreset,
    applyPreset,
    clearPreset
  };
}

// ============================================
// QUICK FILTERS HOOK
// ============================================

interface QuickFilter {
  id: string;
  label: string;
  isActive: boolean;
}

export function useQuickFilters(initialFilters: QuickFilter[]) {
  const [quickFilters, setQuickFilters] = useState(initialFilters);

  const toggleFilter = useCallback((id: string) => {
    setQuickFilters(prev => 
      prev.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f)
    );
  }, []);

  const setFilterActive = useCallback((id: string, isActive: boolean) => {
    setQuickFilters(prev => 
      prev.map(f => f.id === id ? { ...f, isActive } : f)
    );
  }, []);

  const clearAll = useCallback(() => {
    setQuickFilters(prev => prev.map(f => ({ ...f, isActive: false })));
  }, []);

  const activeFilters = useMemo(() => {
    return quickFilters.filter(f => f.isActive);
  }, [quickFilters]);

  const activeIds = useMemo(() => {
    return activeFilters.map(f => f.id);
  }, [activeFilters]);

  return {
    quickFilters,
    toggleFilter,
    setFilterActive,
    clearAll,
    activeFilters,
    activeIds
  };
}

// ============================================
// SEARCH HISTORY HOOK
// ============================================

interface UseSearchHistoryOptions {
  key: string;
  maxItems?: number;
}

export function useSearchHistory({
  key,
  maxItems = 10
}: UseSearchHistoryOptions) {
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`search_history_${key}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(`search_history_${key}`, JSON.stringify(history));
  }, [history, key]);

  const addToHistory = useCallback((term: string) => {
    if (!term.trim()) return;
    
    setHistory(prev => {
      const filtered = prev.filter(t => t !== term);
      return [term, ...filtered].slice(0, maxItems);
    });
  }, [maxItems]);

  const removeFromHistory = useCallback((term: string) => {
    setHistory(prev => prev.filter(t => t !== term));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(`search_history_${key}`);
  }, [key]);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory
  };
}
