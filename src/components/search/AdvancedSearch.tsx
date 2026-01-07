import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp, Command, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/utils';

// ============================================
// SEARCH BAR BÁSICO
// ============================================

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (value: string) => void;
  loading?: boolean;
  className?: string;
  showClear?: boolean;
  showShortcut?: boolean;
  shortcut?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  onSearch,
  loading = false,
  className,
  showClear = true,
  showShortcut = true,
  shortcut = "⌘K"
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
    if (e.key === 'Escape') {
      onChange('');
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pl-10 pr-20"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {showClear && value && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        {showShortcut && !value && (
          <Badge variant="outline" className="text-xs font-normal">
            {shortcut}
          </Badge>
        )}
      </div>
    </div>
  );
}

// ============================================
// SEARCH COM SUGESTÕES
// ============================================

interface Suggestion {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  category?: string;
}

interface SearchWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: Suggestion[];
  recentSearches?: string[];
  trendingSearches?: string[];
  onSelect: (suggestion: Suggestion) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
}

export function SearchWithSuggestions({
  value,
  onChange,
  suggestions,
  recentSearches = [],
  trendingSearches = [],
  onSelect,
  onSearch,
  placeholder = "Buscar...",
  loading = false,
  className
}: SearchWithSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedValue = useDebounce(value, 300);

  const allItems = value
    ? suggestions
    : [
        ...recentSearches.map((s, i) => ({ id: `recent-${i}`, label: s, category: 'recent' })),
        ...trendingSearches.map((s, i) => ({ id: `trending-${i}`, label: s, category: 'trending' }))
      ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, allItems.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && allItems[selectedIndex]) {
          onSelect(allItems[selectedIndex] as Suggestion);
          setIsOpen(false);
        } else if (onSearch) {
          onSearch(value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [debouncedValue]);

  const groupedSuggestions = allItems.reduce((acc, item) => {
    const category = (item as any).category || 'results';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item as any);
    return acc;
  }, {} as Record<string, Suggestion[]>);

  const categoryLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    recent: { label: 'Recentes', icon: <Clock className="h-4 w-4" /> },
    trending: { label: 'Em alta', icon: <TrendingUp className="h-4 w-4" /> },
    results: { label: 'Resultados', icon: <Search className="h-4 w-4" /> }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && allItems.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-80 overflow-auto">
          {Object.entries(groupedSuggestions).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                {categoryLabels[category]?.icon}
                {categoryLabels[category]?.label || category}
              </div>
              {items.map((item, index) => {
                const globalIndex = allItems.findIndex(i => i.id === item.id);
                return (
                  <button
                    key={item.id}
                    className={cn(
                      "w-full text-left px-3 py-2 hover:bg-accent transition-colors",
                      globalIndex === selectedIndex && "bg-accent"
                    )}
                    onClick={() => {
                      const suggestion: Suggestion = {
                        id: item.id,
                        label: item.label,
                        description: (item as Suggestion).description,
                        icon: (item as Suggestion).icon,
                        category: (item as any).category
                      };
                      onSelect(suggestion);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {(item as any).icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {(item as Suggestion).description && (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {(item as Suggestion).description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// GLOBAL SEARCH (Command Palette Style)
// ============================================

interface SearchCategory {
  id: string;
  label: string;
  icon?: React.ReactNode;
  items: Suggestion[];
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  categories: SearchCategory[];
  onSelect: (item: Suggestion, categoryId: string) => void;
  placeholder?: string;
}

export function GlobalSearch({
  isOpen,
  onClose,
  categories,
  onSelect,
  placeholder = "Buscar em tudo..."
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedCategory(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const filteredCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  const displayedCategories = selectedCategory
    ? filteredCategories.filter(c => c.id === selectedCategory)
    : filteredCategories;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-xl bg-popover border rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-4 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
          <Badge variant="outline" className="shrink-0">
            ESC
          </Badge>
        </div>

        {categories.length > 1 && !selectedCategory && (
          <div className="flex items-center gap-1 p-2 border-b overflow-x-auto">
            {categories.map(cat => (
              <Button
                key={cat.id}
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.icon}
                <span className="ml-1">{cat.label}</span>
              </Button>
            ))}
          </div>
        )}

        {selectedCategory && (
          <div className="flex items-center gap-2 p-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              ← Voltar
            </Button>
            <span className="text-sm text-muted-foreground">
              Buscando em: {categories.find(c => c.id === selectedCategory)?.label}
            </span>
          </div>
        )}

        <div className="max-h-80 overflow-auto">
          {displayedCategories.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum resultado encontrado</p>
            </div>
          ) : (
            displayedCategories.map(category => (
              <div key={category.id}>
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                  {category.label}
                </div>
                {category.items.map(item => (
                  <button
                    key={item.id}
                    className="w-full text-left px-3 py-2 hover:bg-accent transition-colors flex items-center gap-3"
                    onClick={() => {
                      onSelect(item, category.id);
                      onClose();
                    }}
                  >
                    {item.icon || <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-xs">
                      {item.label.charAt(0).toUpperCase()}
                    </div>}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.label}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground truncate">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between px-3 py-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑↓</kbd>
            <span>navegar</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↵</kbd>
            <span>selecionar</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">esc</kbd>
            <span>fechar</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HOOK: useSearch
// ============================================

interface UseSearchOptions<T> {
  data: T[];
  searchKeys: (keyof T)[];
  debounceMs?: number;
}

export function useSearch<T>({ data, searchKeys, debounceMs = 300 }: UseSearchOptions<T>) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceMs);

  const results = React.useMemo(() => {
    if (!debouncedQuery) return data;

    const lowerQuery = debouncedQuery.toLowerCase();
    return data.filter(item =>
      searchKeys.some(key => {
        const value = item[key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerQuery);
        }
        if (typeof value === 'number') {
          return value.toString().includes(lowerQuery);
        }
        return false;
      })
    );
  }, [data, debouncedQuery, searchKeys]);

  const highlight = useCallback((text: string) => {
    if (!debouncedQuery) return text;

    const regex = new RegExp(`(${debouncedQuery})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  }, [debouncedQuery]);

  return {
    query,
    setQuery,
    results,
    highlight,
    isSearching: query !== debouncedQuery
  };
}
