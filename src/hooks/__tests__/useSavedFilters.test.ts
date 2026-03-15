import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSavedFilters } from '../../hooks/useSavedFilters';

describe('useSavedFilters', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
    });
  });

  it('starts with empty filters', () => {
    const { result } = renderHook(() => useSavedFilters('test'));
    expect(result.current.savedFilters).toEqual([]);
    expect(result.current.activeFilter).toBeNull();
  });

  it('saves a filter', () => {
    const { result } = renderHook(() => useSavedFilters('test'));
    
    act(() => {
      result.current.saveFilter('My Filter', { status: 'active' });
    });
    
    expect(result.current.savedFilters).toHaveLength(1);
    expect(result.current.savedFilters[0].name).toBe('My Filter');
    expect(result.current.savedFilters[0].filters).toEqual({ status: 'active' });
  });

  it('persists filters to localStorage', () => {
    const { result } = renderHook(() => useSavedFilters('test'));
    
    act(() => {
      result.current.saveFilter('Persisted', { foo: 'bar' });
    });
    
    const stored = JSON.parse(localStorage.getItem('saved-filters-test') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Persisted');
  });

  it('loads filters from localStorage', () => {
    const existing = [{ id: 'x', name: 'Existing', filters: { a: 'b' }, createdAt: new Date().toISOString(), isDefault: false }];
    localStorage.setItem('saved-filters-load', JSON.stringify(existing));
    
    const { result } = renderHook(() => useSavedFilters('load'));
    expect(result.current.savedFilters).toHaveLength(1);
    expect(result.current.savedFilters[0].name).toBe('Existing');
  });

  it('deletes a filter', () => {
    const { result } = renderHook(() => useSavedFilters('test'));
    
    let filterId: string;
    act(() => {
      const f = result.current.saveFilter('ToDelete', { x: 'y' });
      filterId = f.id;
    });
    
    expect(result.current.savedFilters).toHaveLength(1);
    
    act(() => {
      result.current.deleteFilter(filterId!);
    });
    
    expect(result.current.savedFilters).toHaveLength(0);
  });

  it('sets a filter as default', () => {
    const { result } = renderHook(() => useSavedFilters('test'));
    
    let id1: string, id2: string;
    act(() => {
      id1 = result.current.saveFilter('Filter1', {}).id;
    });
    act(() => {
      id2 = result.current.saveFilter('Filter2', {}).id;
    });
    
    act(() => {
      result.current.setAsDefault(id2!);
    });
    
    const f2 = result.current.savedFilters.find(f => f.id === id2!);
    const f1 = result.current.savedFilters.find(f => f.id === id1!);
    expect(f2?.isDefault).toBe(true);
    expect(f1?.isDefault).toBe(false);
  });

  it('applies a filter sets it as active', () => {
    const { result } = renderHook(() => useSavedFilters('test'));
    
    let filterId: string;
    act(() => {
      filterId = result.current.saveFilter('Active', { status: 'queue' }).id;
    });
    
    act(() => {
      result.current.applyFilter(filterId!);
    });
    
    expect(result.current.activeFilterId).toBe(filterId!);
    expect(result.current.activeFilter?.name).toBe('Active');
  });

  it('clears active filter', () => {
    const { result } = renderHook(() => useSavedFilters('test'));
    
    let filterId: string;
    act(() => {
      filterId = result.current.saveFilter('X', {}).id;
      result.current.applyFilter(filterId);
    });
    
    act(() => {
      result.current.clearActiveFilter();
    });
    
    expect(result.current.activeFilterId).toBeNull();
    expect(result.current.activeFilter).toBeNull();
  });

  it('renames a filter', () => {
    const { result } = renderHook(() => useSavedFilters('test'));
    
    let filterId: string;
    act(() => {
      filterId = result.current.saveFilter('OldName', {}).id;
    });
    
    act(() => {
      result.current.renameFilter(filterId!, 'NewName');
    });
    
    expect(result.current.savedFilters[0].name).toBe('NewName');
  });

  it('getDefaultFilter returns null when no default', () => {
    const { result } = renderHook(() => useSavedFilters('test'));
    expect(result.current.getDefaultFilter()).toBeNull();
  });

  it('getDefaultFilter returns default filter', () => {
    const { result } = renderHook(() => useSavedFilters('test'));
    
    let filterId: string;
    act(() => {
      filterId = result.current.saveFilter('Default', {}).id;
    });
    act(() => {
      result.current.setAsDefault(filterId!);
    });
    
    expect(result.current.getDefaultFilter()?.name).toBe('Default');
  });

  it('uses different storage keys per context', () => {
    const { result: r1 } = renderHook(() => useSavedFilters('context1'));
    const { result: r2 } = renderHook(() => useSavedFilters('context2'));
    
    act(() => {
      r1.current.saveFilter('Filter1', {});
    });
    
    expect(r1.current.savedFilters).toHaveLength(1);
    expect(r2.current.savedFilters).toHaveLength(0);
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem('saved-filters-corrupt', 'not-json{{{');
    
    const { result } = renderHook(() => useSavedFilters('corrupt'));
    expect(result.current.savedFilters).toEqual([]);
  });

  it('saves filter with sort options', () => {
    const { result } = renderHook(() => useSavedFilters('test'));
    
    act(() => {
      result.current.saveFilter('Sorted', { status: 'queue' }, { sortBy: 'created_at', sortOrder: 'desc' });
    });
    
    expect(result.current.savedFilters[0].sortBy).toBe('created_at');
    expect(result.current.savedFilters[0].sortOrder).toBe('desc');
  });

  it('clears active when deleted filter is active', () => {
    const { result } = renderHook(() => useSavedFilters('test'));
    
    let filterId: string;
    act(() => {
      filterId = result.current.saveFilter('Active', {}).id;
    });
    act(() => {
      result.current.applyFilter(filterId!);
    });
    
    expect(result.current.activeFilterId).toBe(filterId!);
    
    act(() => {
      result.current.deleteFilter(filterId!);
    });
    
    expect(result.current.activeFilterId).toBeNull();
  });

  it('only one default at a time', () => {
    const { result } = renderHook(() => useSavedFilters('test'));
    
    let id1: string, id2: string;
    act(() => {
      id1 = result.current.saveFilter('F1', {}).id;
      id2 = result.current.saveFilter('F2', {}).id;
    });
    
    act(() => { result.current.setAsDefault(id1!); });
    act(() => { result.current.setAsDefault(id2!); });
    
    const defaults = result.current.savedFilters.filter(f => f.isDefault);
    expect(defaults).toHaveLength(1);
    expect(defaults[0].id).toBe(id2!);
  });
});
