import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Search, X, ArrowUp, ArrowDown, ChevronRight, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

// ============================================
// ENHANCED SEARCH INPUT
// ============================================

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'suggestion';
  icon?: React.ReactNode;
}

interface EnhancedSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  onClearRecent?: () => void;
  isLoading?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function EnhancedSearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Buscar...',
  suggestions = [],
  recentSearches = [],
  onClearRecent,
  isLoading = false,
  className,
  autoFocus = false,
}: EnhancedSearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedValue = useDebounce(value, 300);
  const shouldReduceMotion = useReducedMotion();

  const showDropdown = isFocused && (suggestions.length > 0 || recentSearches.length > 0);

  const allItems: SearchSuggestion[] = [
    ...recentSearches.map((text, i) => ({
      id: `recent-${i}`,
      text,
      type: 'recent' as const,
      icon: <Clock className="w-4 h-4 text-muted-foreground" />,
    })),
    ...suggestions,
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % allItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && allItems[selectedIndex]) {
          onChange(allItems[selectedIndex].text);
          onSearch?.(allItems[selectedIndex].text);
          setIsFocused(false);
        } else {
          onSearch?.(value);
        }
        break;
      case 'Escape':
        setIsFocused(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (text: string) => {
    onChange(text);
    onSearch?.(text);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div
        className={cn(
          "relative flex items-center gap-2 px-4 py-3 rounded-2xl border-2 bg-background transition-all duration-200",
          isFocused ? "border-primary shadow-lg shadow-primary/10" : "border-muted hover:border-muted-foreground/30"
        )}
      >
        <Search className={cn(
          "w-5 h-5 transition-colors",
          isFocused ? "text-primary" : "text-muted-foreground"
        )} />
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          aria-label={placeholder}
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          role="combobox"
        />

        {/* Loading / Clear */}
        {value && (
          <button
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Limpar busca"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
              />
            ) : (
              <X className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        )}

        {/* Keyboard hint */}
        {!isFocused && !value && (
          <kbd className="hidden md:flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs text-muted-foreground">
            <span>⌘</span>
            <span>K</span>
          </kbd>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 py-2 bg-popover border rounded-xl shadow-xl z-50 overflow-hidden"
            role="listbox"
          >
            {/* Recent searches header */}
            {recentSearches.length > 0 && !value && (
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Buscas recentes
                </span>
                {onClearRecent && (
                  <button
                    onClick={onClearRecent}
                    className="text-xs text-primary hover:underline"
                  >
                    Limpar
                  </button>
                )}
              </div>
            )}

            {allItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.text)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left",
                  selectedIndex === index && "bg-muted"
                )}
                role="option"
                aria-selected={selectedIndex === index}
              >
                {item.icon || (
                  item.type === 'popular' ? (
                    <TrendingUp className="w-4 h-4 text-warning" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-primary" />
                  )
                )}
                <span className="flex-1 truncate">{item.text}</span>
                {selectedIndex === index && (
                  <span className="text-xs text-muted-foreground">Enter ↵</span>
                )}
              </button>
            ))}

            {/* Keyboard navigation hint */}
            <div className="flex items-center justify-center gap-4 px-4 py-2 mt-2 border-t text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ArrowUp className="w-3 h-3" />
                <ArrowDown className="w-3 h-3" />
                para navegar
              </span>
              <span>Enter para selecionar</span>
              <span>Esc para fechar</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// SEARCH RESULTS SKELETON
// ============================================

export function SearchResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-muted/30">
          <div className="w-12 h-12 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// SEARCH RESULT ITEM
// ============================================

interface SearchResultItemProps {
  title: string;
  subtitle?: string;
  image?: string;
  icon?: React.ReactNode;
  badge?: string;
  onClick: () => void;
  highlightTerm?: string;
  className?: string;
}

export function SearchResultItem({
  title,
  subtitle,
  image,
  icon,
  badge,
  onClick,
  highlightTerm,
  className,
}: SearchResultItemProps) {
  // Highlight matching term
  const highlightText = (text: string) => {
    if (!highlightTerm) return text;
    
    const regex = new RegExp(`(${highlightTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary/20 text-primary rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl transition-colors",
        "hover:bg-muted/50 active:bg-muted",
        "text-left group",
        className
      )}
    >
      {/* Image or Icon */}
      {image ? (
        <img
          src={image}
          alt=""
          className="w-12 h-12 rounded-lg object-cover"
        />
      ) : icon ? (
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
          {icon}
        </div>
      ) : null}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium truncate">{highlightText(title)}</h4>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate">
            {highlightText(subtitle)}
          </p>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}

// ============================================
// NO RESULTS STATE
// ============================================

interface NoSearchResultsProps {
  query: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export function NoSearchResults({
  query,
  suggestions = [],
  onSuggestionClick,
}: NoSearchResultsProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">
        Nenhum resultado para "{query}"
      </h3>
      <p className="text-muted-foreground mb-6">
        Tente usar palavras-chave diferentes ou verifique a ortografia
      </p>
      
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Talvez você quis dizer:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="px-4 py-2 rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// SEARCH HOOK
// ============================================

interface UseSearchOptions<T> {
  items: T[];
  searchKeys: (keyof T)[];
  minLength?: number;
}

export function useSearch<T>({ items, searchKeys, minLength = 2 }: UseSearchOptions<T>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < minLength) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const filtered = items.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(debouncedQuery.toLowerCase());
        }
        return false;
      })
    );

    setResults(filtered);
    setIsSearching(false);
  }, [debouncedQuery, items, searchKeys, minLength]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasResults: results.length > 0,
    clearSearch,
  };
}

export default EnhancedSearchInput;
