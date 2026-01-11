import { useState, useCallback, useEffect, useRef } from 'react';

// Selection hook for lists
interface UseSelectionOptions<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  initialSelection?: string[];
  maxSelection?: number;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function useSelection<T>({
  items,
  keyExtractor,
  initialSelection = [],
  maxSelection,
  onSelectionChange,
}: UseSelectionOptions<T>) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelection));

  const isSelected = useCallback((item: T) => {
    return selectedIds.has(keyExtractor(item));
  }, [selectedIds, keyExtractor]);

  const toggle = useCallback((item: T) => {
    const id = keyExtractor(item);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (maxSelection && next.size >= maxSelection) {
          return prev;
        }
        next.add(id);
      }
      onSelectionChange?.(Array.from(next));
      return next;
    });
  }, [keyExtractor, maxSelection, onSelectionChange]);

  const select = useCallback((item: T) => {
    const id = keyExtractor(item);
    setSelectedIds((prev) => {
      if (prev.has(id)) return prev;
      if (maxSelection && prev.size >= maxSelection) return prev;
      const next = new Set(prev).add(id);
      onSelectionChange?.(Array.from(next));
      return next;
    });
  }, [keyExtractor, maxSelection, onSelectionChange]);

  const deselect = useCallback((item: T) => {
    const id = keyExtractor(item);
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      onSelectionChange?.(Array.from(next));
      return next;
    });
  }, [keyExtractor, onSelectionChange]);

  const selectAll = useCallback(() => {
    const allIds = items.map(keyExtractor);
    const limited = maxSelection ? allIds.slice(0, maxSelection) : allIds;
    setSelectedIds(new Set(limited));
    onSelectionChange?.(limited);
  }, [items, keyExtractor, maxSelection, onSelectionChange]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === items.length) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [selectedIds.size, items.length, selectAll, deselectAll]);

  const selectedItems = items.filter((item) => selectedIds.has(keyExtractor(item)));

  return {
    selectedIds: Array.from(selectedIds),
    selectedItems,
    selectedCount: selectedIds.size,
    isAllSelected: selectedIds.size === items.length && items.length > 0,
    isIndeterminate: selectedIds.size > 0 && selectedIds.size < items.length,
    isSelected,
    toggle,
    select,
    deselect,
    selectAll,
    deselectAll,
    toggleAll,
  };
}

// Filter hook
interface UseFilterOptions<T> {
  items: T[];
  filterFn: (item: T, filters: Record<string, unknown>) => boolean;
  initialFilters?: Record<string, unknown>;
}

export function useFilter<T>({
  items,
  filterFn,
  initialFilters = {},
}: UseFilterOptions<T>) {
  const [filters, setFilters] = useState<Record<string, unknown>>(initialFilters);

  const setFilter = useCallback((key: string, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const filteredItems = items.filter((item) => filterFn(item, filters));

  const hasActiveFilters = Object.keys(filters).length > 0;
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return {
    filters,
    filteredItems,
    filteredCount: filteredItems.length,
    totalCount: items.length,
    hasActiveFilters,
    activeFilterCount,
    setFilter,
    removeFilter,
    clearFilters,
    resetFilters,
    setFilters,
  };
}

// Sort hook
type SortDirection = 'asc' | 'desc';

interface UseSortOptions<T> {
  items: T[];
  initialSortKey?: keyof T;
  initialDirection?: SortDirection;
}

export function useSort<T extends Record<string, unknown>>({
  items,
  initialSortKey,
  initialDirection = 'asc',
}: UseSortOptions<T>) {
  const [sortKey, setSortKey] = useState<keyof T | undefined>(initialSortKey);
  const [direction, setDirection] = useState<SortDirection>(initialDirection);

  const toggleSort = useCallback((key: keyof T) => {
    if (sortKey === key) {
      setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setDirection('asc');
    }
  }, [sortKey]);

  const clearSort = useCallback(() => {
    setSortKey(undefined);
    setDirection('asc');
  }, []);

  const sortedItems = [...items].sort((a, b) => {
    if (!sortKey) return 0;
    
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    const comparison = aVal < bVal ? -1 : 1;
    return direction === 'asc' ? comparison : -comparison;
  });

  return {
    sortedItems,
    sortKey,
    direction,
    toggleSort,
    setSortKey,
    setDirection,
    clearSort,
    getSortProps: (key: keyof T) => ({
      onClick: () => toggleSort(key),
      isSorted: sortKey === key,
      direction: sortKey === key ? direction : undefined,
    }),
  };
}

// Search hook
interface UseSearchOptions<T> {
  items: T[];
  searchKeys: (keyof T)[];
  initialQuery?: string;
  debounceMs?: number;
}

export function useSearch<T extends Record<string, unknown>>({
  items,
  searchKeys,
  initialQuery = '',
  debounceMs = 300,
}: UseSearchOptions<T>) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query, debounceMs]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  const searchedItems = items.filter((item) => {
    if (!debouncedQuery) return true;
    
    const lowerQuery = debouncedQuery.toLowerCase();
    return searchKeys.some((key) => {
      const value = item[key];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(lowerQuery);
    });
  });

  return {
    query,
    debouncedQuery,
    setQuery,
    clearSearch,
    searchedItems,
    searchedCount: searchedItems.length,
    isSearching: query !== debouncedQuery,
    hasQuery: debouncedQuery.length > 0,
  };
}

// Combined list management hook
interface UseListOptions<T extends Record<string, unknown>> {
  items: T[];
  keyExtractor: (item: T) => string;
  searchKeys?: (keyof T)[];
  initialFilters?: Record<string, unknown>;
  filterFn?: (item: T, filters: Record<string, unknown>) => boolean;
  initialSortKey?: keyof T;
}

export function useList<T extends Record<string, unknown>>({
  items,
  keyExtractor,
  searchKeys = [],
  initialFilters = {},
  filterFn = () => true,
  initialSortKey,
}: UseListOptions<T>) {
  const selection = useSelection({ items, keyExtractor });
  const filter = useFilter({ items, filterFn, initialFilters });
  const sort = useSort({ items: filter.filteredItems, initialSortKey });
  const search = useSearch({ items: sort.sortedItems, searchKeys });

  return {
    // Final items
    items: search.searchedItems,
    totalCount: items.length,
    displayedCount: search.searchedItems.length,
    
    // Selection
    ...selection,
    
    // Filter
    filters: filter.filters,
    setFilter: filter.setFilter,
    clearFilters: filter.clearFilters,
    
    // Sort
    sortKey: sort.sortKey,
    sortDirection: sort.direction,
    toggleSort: sort.toggleSort,
    
    // Search
    searchQuery: search.query,
    setSearchQuery: search.setQuery,
    clearSearch: search.clearSearch,
  };
}
