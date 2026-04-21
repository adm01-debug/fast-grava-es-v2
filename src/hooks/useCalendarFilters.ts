import { useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { DbJob } from './useJobs';
import { CalendarFilterState, EMPTY_FILTERS } from '@/components/calendar/types';

/**
 * Persistent advanced calendar filters with derived helpers.
 * Persists per-user via localStorage key.
 */
export function useCalendarFilters(storageKey = 'calendar-filters-v1') {
  const [filters, setFilters, clearFilters] = useLocalStorage<CalendarFilterState>(
    storageKey,
    EMPTY_FILTERS
  );

  const updateFilter = useCallback(
    <K extends keyof CalendarFilterState>(key: K, value: CalendarFilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [setFilters]
  );

  const toggleArrayValue = useCallback(
    (key: 'techniques' | 'machines' | 'statuses' | 'priorities' | 'clients', value: string) => {
      setFilters((prev) => {
        const current = prev[key];
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [key]: next };
      });
    },
    [setFilters]
  );

  const activeCount = useMemo(() => {
    let count = 0;
    count += filters.techniques.length;
    count += filters.machines.length;
    count += filters.statuses.length;
    count += filters.priorities.length;
    count += filters.clients.length;
    if (filters.onlyDelayed) count++;
    if (filters.onlyInProduction) count++;
    if (filters.searchQuery.trim()) count++;
    return count;
  }, [filters]);

  const applyFilters = useCallback(
    (jobs: DbJob[]): DbJob[] => {
      const q = filters.searchQuery.trim().toLowerCase();
      return jobs.filter((job) => {
        if (filters.techniques.length && !filters.techniques.includes(job.technique_id)) return false;
        if (filters.machines.length && (!job.machine_id || !filters.machines.includes(job.machine_id))) return false;
        if (filters.statuses.length && !filters.statuses.includes(job.status)) return false;
        if (filters.priorities.length && !filters.priorities.includes(job.priority)) return false;
        if (filters.clients.length && !filters.clients.includes(job.client)) return false;
        if (filters.onlyDelayed && job.status !== 'delayed') return false;
        if (filters.onlyInProduction && job.status !== 'production') return false;
        if (q) {
          const hay = `${job.order_number} ${job.client} ${job.product}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
    },
    [filters]
  );

  return {
    filters,
    setFilters,
    updateFilter,
    toggleArrayValue,
    clearFilters,
    activeCount,
    applyFilters,
    isEmpty: activeCount === 0,
  };
}
