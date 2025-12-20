import React, { useState, useCallback, useEffect, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce, useSearchDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  /** Callback when debounced value changes */
  onSearch: (value: string) => void;
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
  /** Minimum characters before triggering search (default: 0) */
  minLength?: number;
  /** Show loading spinner during debounce */
  showLoadingIndicator?: boolean;
  /** Show clear button when has value */
  showClearButton?: boolean;
  /** Controlled value (optional) */
  value?: string;
  /** Immediate change handler (not debounced) */
  onValueChange?: (value: string) => void;
  /** Custom loading state */
  isLoading?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      onSearch,
      debounceMs = 300,
      minLength = 0,
      showLoadingIndicator = true,
      showClearButton = true,
      value: controlledValue,
      onValueChange,
      isLoading: externalLoading,
      size = 'md',
      className,
      placeholder = 'Buscar...',
      ...props
    },
    ref
  ) => {
    // Use controlled or internal state
    const [internalValue, setInternalValue] = useState('');
    const value = controlledValue ?? internalValue;
    const setValue = onValueChange ?? setInternalValue;

    // Use search debounce hook
    const { debouncedValue, isSearching, isValid, isEmpty } = useSearchDebounce(value, {
      delay: debounceMs,
      minLength,
    });

    // Trigger search callback when debounced value changes
    useEffect(() => {
      if (isValid || isEmpty) {
        onSearch(debouncedValue);
      }
    }, [debouncedValue, isValid, isEmpty, onSearch]);

    // Handle input change
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
      },
      [setValue]
    );

    // Handle clear
    const handleClear = useCallback(() => {
      setValue('');
      onSearch('');
    }, [setValue, onSearch]);

    // Determine loading state
    const showLoading = showLoadingIndicator && (isSearching || externalLoading);

    // Size classes
    const sizeClasses = {
      sm: 'h-8 text-sm pl-8 pr-8',
      md: 'h-10 text-base pl-10 pr-10',
      lg: 'h-12 text-lg pl-12 pr-12',
    };

    const iconSizeClasses = {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    const iconPositionClasses = {
      sm: 'left-2.5',
      md: 'left-3',
      lg: 'left-4',
    };

    const rightIconPositionClasses = {
      sm: 'right-2.5',
      md: 'right-3',
      lg: 'right-4',
    };

    return (
      <div className="relative">
        {/* Search icon */}
        <Search
          className={cn(
            'absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none',
            iconSizeClasses[size],
            iconPositionClasses[size]
          )}
        />

        {/* Input */}
        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(sizeClasses[size], className)}
          {...props}
        />

        {/* Right side: loading or clear button */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 flex items-center gap-1',
            rightIconPositionClasses[size]
          )}
        >
          {showLoading && (
            <Loader2
              className={cn('animate-spin text-muted-foreground', iconSizeClasses[size])}
            />
          )}

          {showClearButton && value && !showLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label="Limpar busca"
            >
              <X className={iconSizeClasses[size]} />
            </button>
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

/**
 * Simple debounced search hook for use without the component
 */
export function useDebouncedSearch(
  onSearch: (value: string) => void,
  debounceMs: number = 300
) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedTerm = useDebounce(searchTerm, debounceMs);

  useEffect(() => {
    onSearch(debouncedTerm);
  }, [debouncedTerm, onSearch]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
    isDebouncing: searchTerm !== debouncedTerm,
    clear: () => {
      setSearchTerm('');
      onSearch('');
    },
  };
}

/**
 * Search with filters hook
 */
export interface SearchFilters {
  search: string;
  [key: string]: any;
}

export function useSearchWithFilters<T extends SearchFilters>(
  initialFilters: T,
  onFiltersChange: (filters: T) => void,
  debounceMs: number = 300
) {
  const [filters, setFilters] = useState<T>(initialFilters);
  const debouncedSearch = useDebounce(filters.search, debounceMs);

  // Debounced search effect
  useEffect(() => {
    onFiltersChange({ ...filters, search: debouncedSearch });
  }, [debouncedSearch, filters, onFiltersChange]);

  const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateSearch = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const clearSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, search: '' }));
  }, []);

  return {
    filters,
    updateFilter,
    updateSearch,
    resetFilters,
    clearSearch,
    isSearching: filters.search !== debouncedSearch,
  };
}

export default SearchInput;
