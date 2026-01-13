import { useMemo } from 'react';
import Fuse, { IFuseOptions } from 'fuse.js';

export interface UseFuseSearchOptions<T> {
  keys: (keyof T | string)[];
  threshold?: number;
  distance?: number;
  minMatchCharLength?: number;
  includeScore?: boolean;
  includeMatches?: boolean;
  ignoreLocation?: boolean;
  useExtendedSearch?: boolean;
  findAllMatches?: boolean;
}

export interface FuseSearchResult<T> {
  item: T;
  score: number;
  matches?: ReadonlyArray<{
    key?: string;
    value?: string;
    indices: ReadonlyArray<[number, number]>;
  }>;
}

/**
 * Hook for fuzzy searching with Fuse.js
 * 
 * @param items - Array of items to search through
 * @param searchTerm - Search query string
 * @param options - Fuse.js options with required 'keys' field
 * @returns Filtered and sorted items based on fuzzy match
 */
export function useFuseSearch<T>(
  items: T[],
  searchTerm: string,
  options: UseFuseSearchOptions<T>
): T[] {
  const fuse = useMemo(() => {
    const fuseOptions: IFuseOptions<T> = {
      threshold: options.threshold ?? 0.4,
      distance: options.distance ?? 100,
      minMatchCharLength: options.minMatchCharLength ?? 1,
      includeScore: options.includeScore ?? true,
      includeMatches: options.includeMatches ?? true,
      ignoreLocation: options.ignoreLocation ?? true,
      useExtendedSearch: options.useExtendedSearch ?? false,
      findAllMatches: options.findAllMatches ?? true,
      keys: options.keys as string[],
    };
    return new Fuse<T>(items, fuseOptions);
  }, [items, options]);

  const results = useMemo((): T[] => {
    if (!searchTerm || searchTerm.trim() === '') {
      return items;
    }

    const searchResults = fuse.search(searchTerm.trim());
    return searchResults.map(result => result.item);
  }, [fuse, searchTerm, items]);

  return results;
}

/**
 * Hook for fuzzy searching with detailed results (including score and matches)
 */
export function useFuseSearchWithDetails<T>(
  items: T[],
  searchTerm: string,
  options: UseFuseSearchOptions<T>
): FuseSearchResult<T>[] {
  const fuse = useMemo(() => {
    const fuseOptions: IFuseOptions<T> = {
      threshold: options.threshold ?? 0.4,
      distance: options.distance ?? 100,
      minMatchCharLength: options.minMatchCharLength ?? 1,
      includeScore: options.includeScore ?? true,
      includeMatches: options.includeMatches ?? true,
      ignoreLocation: options.ignoreLocation ?? true,
      useExtendedSearch: options.useExtendedSearch ?? false,
      findAllMatches: options.findAllMatches ?? true,
      keys: options.keys as string[],
    };
    return new Fuse<T>(items, fuseOptions);
  }, [items, options]);

  const results = useMemo((): FuseSearchResult<T>[] => {
    if (!searchTerm || searchTerm.trim() === '') {
      return items.map(item => ({
        item,
        score: 0,
        matches: undefined,
      }));
    }

    const searchResults = fuse.search(searchTerm.trim());
    return searchResults.map(result => ({
      item: result.item,
      score: result.score ?? 0,
      matches: result.matches,
    }));
  }, [fuse, searchTerm, items]);

  return results;
}

/**
 * Simple function to create a Fuse instance for one-time use
 */
export function createFuseInstance<T>(
  items: T[],
  keys: (keyof T | string)[],
  customOptions?: Partial<UseFuseSearchOptions<T>>
): Fuse<T> {
  const fuseOptions: IFuseOptions<T> = {
    threshold: customOptions?.threshold ?? 0.4,
    distance: customOptions?.distance ?? 100,
    minMatchCharLength: customOptions?.minMatchCharLength ?? 1,
    includeScore: customOptions?.includeScore ?? true,
    includeMatches: customOptions?.includeMatches ?? true,
    ignoreLocation: customOptions?.ignoreLocation ?? true,
    useExtendedSearch: customOptions?.useExtendedSearch ?? false,
    findAllMatches: customOptions?.findAllMatches ?? true,
    keys: keys as string[],
  };
  return new Fuse<T>(items, fuseOptions);
}

/**
 * Highlight matched text in search results
 */
export function highlightMatches(
  text: string,
  indices: ReadonlyArray<[number, number]>
): { text: string; highlighted: boolean }[] {
  if (!indices || indices.length === 0) {
    return [{ text, highlighted: false }];
  }

  const result: { text: string; highlighted: boolean }[] = [];
  let lastIndex = 0;

  indices.forEach(([start, end]) => {
    // Add non-matched text before this match
    if (start > lastIndex) {
      result.push({
        text: text.slice(lastIndex, start),
        highlighted: false,
      });
    }
    // Add matched text
    result.push({
      text: text.slice(start, end + 1),
      highlighted: true,
    });
    lastIndex = end + 1;
  });

  // Add remaining non-matched text
  if (lastIndex < text.length) {
    result.push({
      text: text.slice(lastIndex),
      highlighted: false,
    });
  }

  return result;
}
