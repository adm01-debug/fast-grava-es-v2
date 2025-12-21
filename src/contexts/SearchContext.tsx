import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SearchResult {
  id: string;
  type: 'job' | 'operator' | 'machine' | 'document';
  title: string;
  description?: string;
  url: string;
}

interface SearchContextType {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  const search = useCallback(async (searchQuery: string) => {
    setIsSearching(true);
    try {
      // Simulated search - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQueryState('');
    setResults([]);
  }, []);

  return (
    <SearchContext.Provider value={{ query, results, isSearching, setQuery, search, clearSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) throw new Error('useSearch must be used within SearchProvider');
  return context;
}
