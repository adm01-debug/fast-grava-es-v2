import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface FulltextSearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  resultCount?: number;
  showResultCount?: boolean;
  minLength?: number;
  debounceMs?: number;
  className?: string;
  autoFocus?: boolean;
}

export function FulltextSearchInput({
  value: externalValue,
  onChange,
  placeholder = 'Buscar em todos os campos...',
  isLoading = false,
  resultCount,
  showResultCount = true,
  minLength = 2,
  debounceMs = 300,
  className,
  autoFocus = false,
}: FulltextSearchInputProps) {
  const [internalValue, setInternalValue] = useState(externalValue ?? '');
  const debouncedValue = useDebounce(internalValue, debounceMs);

  // Sincronizar valor externo
  useEffect(() => {
    if (externalValue !== undefined && externalValue !== internalValue) {
      setInternalValue(externalValue);
    }
  }, [externalValue]);

  // Emitir valor debounced
  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  const handleClear = useCallback(() => {
    setInternalValue('');
    onChange('');
  }, [onChange]);

  const isSearching = internalValue.length >= minLength;
  const showLoader = isLoading && isSearching;
  const showClear = internalValue.length > 0;

  return (
    <div className={cn('relative flex items-center gap-2', className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={internalValue}
          onChange={(e) => setInternalValue(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          autoFocus={autoFocus}
        />
        {showLoader && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {showClear && !showLoader && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {showResultCount && isSearching && resultCount !== undefined && !isLoading && (
        <Badge variant="secondary" className="whitespace-nowrap">
          {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
        </Badge>
      )}

      {internalValue.length > 0 && internalValue.length < minLength && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Digite mais {minLength - internalValue.length} caractere{minLength - internalValue.length > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}

// Componente de sugestões de busca (opcional)
interface SearchSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  visible?: boolean;
}

export function SearchSuggestions({
  suggestions,
  onSelect,
  visible = true,
}: SearchSuggestionsProps) {
  if (!visible || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className="w-full px-4 py-2 text-left hover:bg-accent text-sm"
          onClick={() => onSelect(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
