import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Briefcase,
  Wrench,
  Users,
  Package,
  FileText,
  Calendar,
  Settings,
  Clock,
  Star,
  TrendingUp,
  Filter,
  X,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useDebounce } from '@/hooks/utils';

// Types
interface SearchResult {
  id: string;
  type: 'job' | 'machine' | 'operator' | 'lot' | 'document' | 'maintenance' | 'report';
  title: string;
  subtitle?: string;
  description?: string;
  meta?: string;
  path: string;
  highlight?: string;
  relevance: number;
  timestamp?: Date;
}

interface SearchFilter {
  type: string | null;
  dateRange: 'all' | 'today' | 'week' | 'month';
  status: string | null;
}

// Type configurations
const typeConfig = {
  job: { icon: Briefcase, label: 'Jobs', color: 'text-blue-500' },
  machine: { icon: Wrench, label: 'Máquinas', color: 'text-green-500' },
  operator: { icon: Users, label: 'Operadores', color: 'text-purple-500' },
  lot: { icon: Package, label: 'Lotes', color: 'text-orange-500' },
  document: { icon: FileText, label: 'Documentos', color: 'text-cyan-500' },
  maintenance: { icon: Settings, label: 'Manutenção', color: 'text-yellow-500' },
  report: { icon: TrendingUp, label: 'Relatórios', color: 'text-pink-500' },
};

// Mock search function - replace with actual API call
const mockSearch = async (query: string, filters: SearchFilter): Promise<SearchResult[]> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  
  if (!query) return [];
  
  const mockResults: SearchResult[] = [
    { id: '1', type: 'job', title: 'JOB-2024-001', subtitle: 'Cliente ABC', description: 'Produção de embalagens flexíveis', meta: 'Flexografia', path: '/jobs', relevance: 0.95, timestamp: new Date() },
    { id: '2', type: 'job', title: 'JOB-2024-002', subtitle: 'Cliente XYZ', description: 'Rótulos premium', meta: 'Rotogravura', path: '/jobs', relevance: 0.9 },
    { id: '3', type: 'machine', title: 'FLEXO-01', subtitle: 'Flexografia', description: 'Máquina de impressão flexográfica', meta: 'Em produção', path: '/machines', relevance: 0.85 },
    { id: '4', type: 'operator', title: 'João Silva', subtitle: 'Operador Sênior', description: 'Especialista em Flexografia', meta: 'Ativo', path: '/operators', relevance: 0.8 },
    { id: '5', type: 'lot', title: 'LOT-2024-100', subtitle: 'Produto A', description: 'Lote de produção', meta: '1000 unidades', path: '/traceability', relevance: 0.75 },
    { id: '6', type: 'maintenance', title: 'Manutenção Preventiva', subtitle: 'FLEXO-02', description: 'Verificação de rolos e tinteiros', meta: 'Pendente', path: '/maintenance', relevance: 0.7 },
    { id: '7', type: 'document', title: 'Manual FLEXO-01', subtitle: 'Documentação Técnica', description: 'Manual de operação completo', meta: 'PDF', path: '/documents', relevance: 0.65 },
    { id: '8', type: 'report', title: 'Relatório de Produção', subtitle: 'Janeiro 2024', description: 'Análise mensal de produtividade', meta: 'Gerado', path: '/reports', relevance: 0.6 },
  ];

  // Filter by query
  let results = mockResults.filter(r => 
    r.title.toLowerCase().includes(query.toLowerCase()) ||
    r.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
    r.description?.toLowerCase().includes(query.toLowerCase())
  );

  // Apply type filter
  if (filters.type) {
    results = results.filter(r => r.type === filters.type);
  }

  return results.sort((a, b) => b.relevance - a.relevance);
};

// Custom hook for search state management (used by GlobalSearchTrigger)
export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);

  // Keyboard shortcuts - only register once at trigger level
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    setIsOpen,
  };
}

// Internal hook for search dialog state - not exposed externally
function useSearchDialogState() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('recent-searches', []);
  
  const debouncedQuery = useDebounce(query, 300);

  // Perform search - using primitive dependencies to avoid infinite loop
  useEffect(() => {
    let cancelled = false;
    
    const search = async () => {
      if (!debouncedQuery) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const currentFilters: SearchFilter = {
          type: filterType,
          dateRange: filterDateRange,
          status: filterStatus,
        };
        const searchResults = await mockSearch(debouncedQuery, currentFilters);
        if (!cancelled) {
          setResults(searchResults);
        }
      } catch (error) {
        console.error('Search error:', error);
        if (!cancelled) {
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    search();
    
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, filterType, filterDateRange, filterStatus]);

  // Add to recent searches
  const addToRecent = useCallback((searchQuery: string) => {
    if (!searchQuery) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== searchQuery);
      return [searchQuery, ...filtered].slice(0, 10);
    });
  }, [setRecentSearches]);

  // Clear recent searches
  const clearRecent = useCallback(() => {
    setRecentSearches([]);
  }, [setRecentSearches]);

  // Reset state
  const reset = useCallback(() => {
    setQuery('');
    setFilterType(null);
    setFilterDateRange('all');
    setFilterStatus(null);
  }, []);

  // Stable filters object for external consumption
  const filters = useMemo<SearchFilter>(() => ({
    type: filterType,
    dateRange: filterDateRange,
    status: filterStatus,
  }), [filterType, filterDateRange, filterStatus]);

  // Use ref to access current filter values without recreating callback
  const filtersRef = useRef({ filterType, filterDateRange, filterStatus });
  filtersRef.current = { filterType, filterDateRange, filterStatus };

  // Stable setter that updates individual filter states - NO dependencies to avoid infinite loop
  const setFilters = useCallback((updater: SearchFilter | ((prev: SearchFilter) => SearchFilter)) => {
    const current = filtersRef.current;
    if (typeof updater === 'function') {
      const newFilters = updater({ 
        type: current.filterType, 
        dateRange: current.filterDateRange, 
        status: current.filterStatus 
      });
      setFilterType(newFilters.type);
      setFilterDateRange(newFilters.dateRange);
      setFilterStatus(newFilters.status);
    } else {
      setFilterType(updater.type);
      setFilterDateRange(updater.dateRange);
      setFilterStatus(updater.status);
    }
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    filters,
    setFilters,
    recentSearches,
    addToRecent,
    clearRecent,
    reset,
  };
}

// Global Search Dialog Component
interface GlobalSearchDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchDialog({ isOpen, onOpenChange }: GlobalSearchDialogProps) {
  const navigate = useNavigate();
  
  // Use the internal search state hook - NOT the global one to avoid double event listeners
  const {
    query,
    setQuery,
    results,
    isLoading,
    filters,
    setFilters,
    recentSearches,
    addToRecent,
    clearRecent,
    reset,
  } = useSearchDialogState();

  const inputRef = useRef<HTMLInputElement>(null);
  
  // Track previous isOpen to detect close
  const wasOpen = useRef(isOpen);

  // Handle result selection
  const handleSelect = useCallback((result: SearchResult) => {
    addToRecent(query);
    navigate(result.path);
    onOpenChange(false);
  }, [query, addToRecent, navigate, onOpenChange]);

  // Handle recent search selection
  const handleRecentSelect = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
  }, [setQuery]);

  // Reset on close - using ref to avoid unnecessary effect triggers
  useEffect(() => {
    if (wasOpen.current && !isOpen) {
      reset();
    }
    wasOpen.current = isOpen;
  }, [isOpen, reset]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach(result => {
      if (!groups[result.type]) {
        groups[result.type] = [];
      }
      groups[result.type].push(result);
    });
    return groups;
  }, [results]);

  const renderResult = (result: SearchResult) => {
    const config = typeConfig[result.type];
    const Icon = config.icon;

    return (
      <CommandItem
        key={result.id}
        value={`${result.title} ${result.subtitle} ${result.description}`}
        onSelect={() => handleSelect(result)}
        className="flex items-center gap-3 p-3 cursor-pointer"
      >
        <div className={cn(
          "flex items-center justify-center h-10 w-10 rounded-lg bg-muted",
          config.color
        )}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{result.title}</span>
            {result.relevance > 0.9 && (
              <Sparkles className="h-3 w-3 text-yellow-500" />
            )}
          </div>
          {result.subtitle && (
            <p className="text-sm text-muted-foreground truncate">
              {result.subtitle}
            </p>
          )}
          {result.description && (
            <p className="text-xs text-muted-foreground/70 truncate">
              {result.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {result.meta && (
            <Badge variant="secondary" className="text-xs">
              {result.meta}
            </Badge>
          )}
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CommandItem>
    );
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onOpenChange}>
      <div className="flex flex-col">
        {/* Search Input */}
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <CommandInput
            ref={inputRef}
            placeholder="Buscar em todo o sistema..."
            value={query}
            onValueChange={setQuery}
            className="flex-1"
          />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {/* Type Filters */}
        <div className="flex items-center gap-1 p-2 border-b overflow-x-auto">
          <Badge
            variant={filters.type === null ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap"
            onClick={() => setFilters(f => ({ ...f, type: null }))}
          >
            <Filter className="h-3 w-3 mr-1" />
            Todos
          </Badge>
          {Object.entries(typeConfig).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <Badge
                key={type}
                variant={filters.type === type ? "default" : "outline"}
                className={cn(
                  "cursor-pointer whitespace-nowrap gap-1",
                  filters.type === type && config.color
                )}
                onClick={() => setFilters(f => ({ ...f, type: f.type === type ? null : type }))}
              >
                <Icon className="h-3 w-3" />
                {config.label}
              </Badge>
            );
          })}
        </div>

        <CommandList>
          <ScrollArea className="h-[400px]">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && query && results.length === 0 && (
              <CommandEmpty>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Search className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum resultado para "{query}"
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Tente termos diferentes ou remova filtros
                  </p>
                </div>
              </CommandEmpty>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <CommandGroup heading={
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Buscas Recentes</span>
                  </div>
                  <button
                    onClick={clearRecent}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Limpar
                  </button>
                </div>
              }>
                {recentSearches.map((search, index) => (
                  <CommandItem
                    key={index}
                    value={search}
                    onSelect={() => handleRecentSelect(search)}
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{search}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Search Results */}
            {!isLoading && results.length > 0 && (
              <AnimatePresence mode="popLayout">
                {Object.entries(groupedResults).map(([type, typeResults]) => {
                  const config = typeConfig[type as keyof typeof typeConfig];
                  return (
                    <CommandGroup
                      key={type}
                      heading={
                        <div className="flex items-center gap-2">
                          <config.icon className={cn("h-3 w-3", config.color)} />
                          <span>{config.label}</span>
                          <Badge variant="secondary" className="h-4 px-1 text-xs">
                            {typeResults.length}
                          </Badge>
                        </div>
                      }
                    >
                      {typeResults.map((result, index) => (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          {renderResult(result)}
                        </motion.div>
                      ))}
                    </CommandGroup>
                  );
                })}
              </AnimatePresence>
            )}

            {/* Quick Actions when empty */}
            {!query && recentSearches.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-medium">Busca Global</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                  Pesquise por jobs, máquinas, operadores, lotes, documentos e muito mais
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘/</kbd>
                  <span className="text-xs text-muted-foreground">para abrir</span>
                </div>
              </div>
            )}
          </ScrollArea>
        </CommandList>

        {/* Footer */}
        <div className="flex items-center justify-between p-2 border-t bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded border">↵</kbd>
              Abrir
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded border">↑↓</kbd>
              Navegar
            </span>
          </div>
          {results.length > 0 && (
            <span>{results.length} resultado{results.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </CommandDialog>
  );
}

// Search trigger button
interface GlobalSearchTriggerProps {
  className?: string;
}

export function GlobalSearchTrigger({ className }: GlobalSearchTriggerProps) {
  // Use the global search hook which handles keyboard shortcut
  const { isOpen, setIsOpen } = useGlobalSearch();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg",
          "bg-muted/50 hover:bg-muted transition-colors",
          "text-sm text-muted-foreground",
          className
        )}
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Buscar...</span>
        <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border bg-background px-1.5 text-xs">
          ⌘/
        </kbd>
      </button>
      <GlobalSearchDialog isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
