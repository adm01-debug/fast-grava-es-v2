import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Command, 
  ArrowRight, 
  Clock, 
  Star, 
  FileText, 
  Settings, 
  Users,
  BarChart3,
  Wrench,
  Package,
  Calendar,
  X,
  Loader2,
  Filter,
  Hash,
  ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Types
interface SearchResult {
  id: string;
  type: 'page' | 'job' | 'machine' | 'user' | 'report' | 'action' | 'setting';
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action: () => void;
  keywords?: string[];
  category?: string;
  badge?: string;
}

interface SearchFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  types: string[];
}

// Fuzzy search function
function fuzzySearch(query: string, text: string): boolean {
  const pattern = query.toLowerCase().split('').join('.*');
  const regex = new RegExp(pattern);
  return regex.test(text.toLowerCase());
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) return text;
  
  return (
    <>
      {text.slice(0, index)}
      <span className="bg-primary/20 text-primary font-medium">
        {text.slice(index, index + query.length)}
      </span>
      {text.slice(index + query.length)}
    </>
  );
}

// Available filters
const searchFilters: SearchFilter[] = [
  { id: 'all', label: 'Tudo', icon: <Search className="w-4 h-4" />, types: [] },
  { id: 'pages', label: 'Páginas', icon: <FileText className="w-4 h-4" />, types: ['page'] },
  { id: 'jobs', label: 'Jobs', icon: <Package className="w-4 h-4" />, types: ['job'] },
  { id: 'machines', label: 'Máquinas', icon: <Wrench className="w-4 h-4" />, types: ['machine'] },
  { id: 'actions', label: 'Ações', icon: <ArrowRight className="w-4 h-4" />, types: ['action'] },
];

// Hook for global search
export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recent-searches');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const navigate = useNavigate();

  // Save recent searches
  const addRecentSearch = useCallback((search: string) => {
    setRecentSearches(prev => {
      const updated = [search, ...prev.filter(s => s !== search)].slice(0, 5);
      localStorage.setItem('recent-searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  }, []);

  // Static pages and actions
  const staticResults: SearchResult[] = [
    // Pages
    { id: 'home', type: 'page', title: 'Dashboard', description: 'Página inicial', icon: <BarChart3 className="w-4 h-4" />, action: () => navigate('/'), keywords: ['home', 'inicio'] },
    { id: 'jobs', type: 'page', title: 'Jobs', description: 'Gerenciar jobs de produção', icon: <Package className="w-4 h-4" />, action: () => navigate('/jobs'), keywords: ['producao', 'ordens'] },
    { id: 'machines', type: 'page', title: 'Máquinas', description: 'Parque de máquinas', icon: <Wrench className="w-4 h-4" />, action: () => navigate('/machines'), keywords: ['equipamentos'] },
    { id: 'reports', type: 'page', title: 'Relatórios', description: 'Análises e relatórios', icon: <BarChart3 className="w-4 h-4" />, action: () => navigate('/reports'), keywords: ['analytics', 'dados'] },
    { id: 'settings', type: 'page', title: 'Configurações', description: 'Configurações do sistema', icon: <Settings className="w-4 h-4" />, action: () => navigate('/settings'), keywords: ['preferencias'] },
    { id: 'users', type: 'page', title: 'Usuários', description: 'Gerenciar usuários', icon: <Users className="w-4 h-4" />, action: () => navigate('/settings/users'), keywords: ['equipe'] },
    { id: 'calendar', type: 'page', title: 'Calendário', description: 'Agenda de produção', icon: <Calendar className="w-4 h-4" />, action: () => navigate('/calendar'), keywords: ['agenda', 'schedule'] },
    
    // Quick Actions
    { id: 'new-job', type: 'action', title: 'Criar Novo Job', description: 'Iniciar um novo job de produção', icon: <Package className="w-4 h-4" />, action: () => navigate('/jobs/new'), badge: 'Ação', keywords: ['criar', 'novo'] },
    { id: 'new-maintenance', type: 'action', title: 'Registrar Manutenção', description: 'Agendar ou registrar manutenção', icon: <Wrench className="w-4 h-4" />, action: () => navigate('/maintenance/new'), badge: 'Ação' },
    { id: 'generate-report', type: 'action', title: 'Gerar Relatório', description: 'Criar novo relatório', icon: <BarChart3 className="w-4 h-4" />, action: () => navigate('/reports/new'), badge: 'Ação' },
  ];

  // Search function
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    // Filter static results
    const matchedStatic = staticResults.filter(result => {
      const searchText = [
        result.title,
        result.description,
        ...(result.keywords || []),
      ].join(' ');
      
      return fuzzySearch(searchQuery, searchText);
    });

    // Apply type filter
    const filter = searchFilters.find(f => f.id === activeFilter);
    const filtered = filter && filter.types.length > 0
      ? matchedStatic.filter(r => filter.types.includes(r.type))
      : matchedStatic;

    // TODO: Add API search for dynamic content (jobs, machines, etc.)
    
    setResults(filtered);
    setIsLoading(false);
  }, [activeFilter, navigate]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => search(query), 150);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const executeResult = useCallback((result: SearchResult) => {
    addRecentSearch(result.title);
    result.action();
    setIsOpen(false);
    setQuery('');
  }, [addRecentSearch]);

  return {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    results,
    isLoading,
    recentSearches,
    clearRecentSearches,
    activeFilter,
    setActiveFilter,
    executeResult,
    filters: searchFilters,
  };
}

// Global Search Component
export const GlobalSearchAdvanced: React.FC = () => {
  const {
    isOpen,
    setIsOpen,
    query,
    setQuery,
    results,
    isLoading,
    recentSearches,
    clearRecentSearches,
    activeFilter,
    setActiveFilter,
    executeResult,
    filters,
  } = useGlobalSearch();

  const groupedResults = React.useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    results.forEach(result => {
      const type = result.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(result);
    });
    return groups;
  }, [results]);

  const typeLabels: Record<string, string> = {
    page: 'Páginas',
    action: 'Ações Rápidas',
    job: 'Jobs',
    machine: 'Máquinas',
    user: 'Usuários',
    report: 'Relatórios',
    setting: 'Configurações',
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        className="relative w-full max-w-sm justify-start text-muted-foreground"
        onClick={() => setIsOpen(true)}
      >
        <Search className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search Dialog */}
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center border-b px-3">
          <Search className="w-4 h-4 mr-2 shrink-0 opacity-50" />
          <input
            placeholder="Buscar em todo o sistema..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          {isLoading && <Loader2 className="w-4 h-4 animate-spin opacity-50" />}
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setQuery('')}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 px-3 py-2 border-b overflow-x-auto">
          {filters.map(filter => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 gap-1.5 shrink-0"
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.icon}
              {filter.label}
            </Button>
          ))}
        </div>

        <CommandList className="max-h-[400px]">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && query && results.length === 0 && (
            <CommandEmpty>
              <div className="flex flex-col items-center py-6">
                <Search className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhum resultado para "{query}"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tente termos diferentes ou remova os filtros
                </p>
              </div>
            </CommandEmpty>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <CommandGroup heading={
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Buscas Recentes
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-xs"
                  onClick={clearRecentSearches}
                >
                  Limpar
                </Button>
              </div>
            }>
              {recentSearches.map((search, index) => (
                <CommandItem
                  key={index}
                  onSelect={() => setQuery(search)}
                  className="gap-2"
                >
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {search}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Results by Type */}
          {!isLoading && Object.entries(groupedResults).map(([type, items]) => (
            <CommandGroup key={type} heading={typeLabels[type] || type}>
              {items.map(result => (
                <CommandItem
                  key={result.id}
                  onSelect={() => executeResult(result)}
                  className="gap-3"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {highlightMatch(result.title, query)}
                      </span>
                      {result.badge && (
                        <Badge variant="secondary" className="text-[10px] h-4">
                          {result.badge}
                        </Badge>
                      )}
                    </div>
                    {result.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {result.description}
                      </p>
                    )}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
          ))}

          {/* Quick Actions when no query */}
          {!query && (
            <CommandGroup heading="Ações Rápidas">
              <CommandItem onSelect={() => { setIsOpen(false); }} className="gap-2">
                <Package className="w-4 h-4" />
                Criar Novo Job
                <Badge variant="outline" className="ml-auto text-[10px]">⌘N</Badge>
              </CommandItem>
              <CommandItem className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Gerar Relatório
              </CommandItem>
              <CommandItem className="gap-2">
                <Settings className="w-4 h-4" />
                Configurações
                <Badge variant="outline" className="ml-auto text-[10px]">⌘,</Badge>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↑↓</kbd>
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↵</kbd>
              selecionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">esc</kbd>
              fechar
            </span>
          </div>
          <span>{results.length} resultados</span>
        </div>
      </CommandDialog>
    </>
  );
};

export default GlobalSearchAdvanced;
