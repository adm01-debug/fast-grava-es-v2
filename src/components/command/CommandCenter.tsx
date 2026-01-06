// Advanced Command Center with AI Suggestions
import React, { useState, useEffect, useCallback, useMemo, useRef, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command, Search, Sparkles, Clock, Star, ArrowRight, Hash,
  FileText, Settings, User, Home, Zap, CornerDownLeft, Loader2,
  ChevronRight, Bookmark, TrendingUp, History, Keyboard, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

// Types
interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon?: React.ElementType;
  shortcut?: string[];
  category: string;
  keywords?: string[];
  action: () => void | Promise<void>;
  isAISuggestion?: boolean;
  score?: number;
}

interface CommandCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  priority: number;
}

interface CommandCenterContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  registerCommand: (command: CommandItem) => void;
  unregisterCommand: (id: string) => void;
  executeCommand: (id: string) => void;
  recentCommands: string[];
  favoriteCommands: string[];
  toggleFavorite: (id: string) => void;
}

const CommandCenterContext = createContext<CommandCenterContextType | null>(null);

// Default categories
const defaultCategories: CommandCategory[] = [
  { id: 'navigation', name: 'Navigation', icon: Home, priority: 1 },
  { id: 'actions', name: 'Actions', icon: Zap, priority: 2 },
  { id: 'settings', name: 'Settings', icon: Settings, priority: 3 },
  { id: 'ai', name: 'AI Suggestions', icon: Sparkles, priority: 0 }
];

// Provider
interface CommandCenterProviderProps {
  children: ReactNode;
  categories?: CommandCategory[];
}

export function CommandCenterProvider({ children, categories = defaultCategories }: CommandCenterProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [commands, setCommands] = useState<Map<string, CommandItem>>(new Map());
  const [recentCommands, setRecentCommands] = useLocalStorage<string[]>('command-recent', []);
  const [favoriteCommands, setFavoriteCommands] = useLocalStorage<string[]>('command-favorites', []);

  const registerCommand = useCallback((command: CommandItem) => {
    setCommands(prev => new Map(prev).set(command.id, command));
  }, []);

  const unregisterCommand = useCallback((id: string) => {
    setCommands(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const executeCommand = useCallback((id: string) => {
    const command = commands.get(id);
    if (command) {
      command.action();
      setRecentCommands(prev => [id, ...prev.filter(c => c !== id)].slice(0, 10));
      setIsOpen(false);
    }
  }, [commands, setRecentCommands]);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteCommands(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }, [setFavoriteCommands]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <CommandCenterContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen(prev => !prev),
        registerCommand,
        unregisterCommand,
        executeCommand,
        recentCommands,
        favoriteCommands,
        toggleFavorite
      }}
    >
      {children}
      <CommandCenterDialog categories={categories} commands={commands} />
    </CommandCenterContext.Provider>
  );
}

export function useCommandCenter() {
  const context = useContext(CommandCenterContext);
  if (!context) throw new Error('useCommandCenter must be used within CommandCenterProvider');
  return context;
}

// Register command hook
export function useRegisterCommand(command: CommandItem) {
  const { registerCommand, unregisterCommand } = useCommandCenter();

  useEffect(() => {
    registerCommand(command);
    return () => unregisterCommand(command.id);
  }, [command, registerCommand, unregisterCommand]);
}

// Command Dialog
interface CommandCenterDialogProps {
  categories: CommandCategory[];
  commands: Map<string, CommandItem>;
}

function CommandCenterDialog({ categories, commands }: CommandCenterDialogProps) {
  const { 
    isOpen, close, executeCommand, recentCommands, favoriteCommands, toggleFavorite 
  } = useCommandCenter();
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<CommandItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Generate AI suggestions based on query
  useEffect(() => {
    if (query.length < 2) {
      setAiSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      // Simulate AI suggestions
      const suggestions: CommandItem[] = [
        {
          id: 'ai-help-' + query,
          title: `Ajuda com "${query}"`,
          description: 'Pergunte à IA sobre isso',
          icon: Sparkles,
          category: 'ai',
          isAISuggestion: true,
          action: () => console.log('AI help:', query)
        }
      ];
      setAiSuggestions(suggestions);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Filter and sort commands
  const filteredCommands = useMemo(() => {
    const allCommands = [...Array.from(commands.values()), ...aiSuggestions];
    
    if (!query) {
      // Show recent and favorites when no query
      const recent = recentCommands
        .map(id => commands.get(id))
        .filter(Boolean) as CommandItem[];
      const favorites = favoriteCommands
        .map(id => commands.get(id))
        .filter(Boolean) as CommandItem[];
      
      return {
        favorites: favorites.slice(0, 5),
        recent: recent.filter(c => !favoriteCommands.includes(c.id)).slice(0, 5),
        all: []
      };
    }

    const lowerQuery = query.toLowerCase();
    const scored = allCommands
      .map(cmd => {
        let score = 0;
        const title = cmd.title.toLowerCase();
        const keywords = cmd.keywords?.join(' ').toLowerCase() || '';

        if (title.startsWith(lowerQuery)) score += 100;
        if (title.includes(lowerQuery)) score += 50;
        if (keywords.includes(lowerQuery)) score += 25;
        if (cmd.isAISuggestion) score += 10;

        return { ...cmd, score };
      })
      .filter(cmd => cmd.score > 0)
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    // Group by category
    const grouped: Record<string, CommandItem[]> = {};
    scored.forEach(cmd => {
      const cat = cmd.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(cmd);
    });

    return { favorites: [], recent: [], all: scored, grouped };
  }, [commands, query, recentCommands, favoriteCommands, aiSuggestions]);

  const flatResults = useMemo(() => {
    if (query) {
      return filteredCommands.all || [];
    }
    return [...(filteredCommands.favorites || []), ...(filteredCommands.recent || [])];
  }, [filteredCommands, query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, flatResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatResults[selectedIndex]) {
            executeCommand(flatResults[selectedIndex].id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, flatResults, executeCommand]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        onClick={close}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          onClick={e => e.stopPropagation()}
          className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-2xl"
        >
          <div className="bg-background border rounded-xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 border-b">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Digite um comando ou pesquise..."
                className="flex-1 py-4 bg-transparent border-0 outline-none text-base placeholder:text-muted-foreground"
              />
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs bg-muted rounded">
                <span>ESC</span>
              </kbd>
            </div>

            {/* Results */}
            <ScrollArea className="max-h-[400px]">
              <div className="p-2">
                {/* Favorites Section */}
                {!query && filteredCommands.favorites && filteredCommands.favorites.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                      <Star className="h-3 w-3" />
                      Favoritos
                    </div>
                    {filteredCommands.favorites.map((cmd, i) => (
                      <CommandRow
                        key={cmd.id}
                        command={cmd}
                        isSelected={selectedIndex === i}
                        isFavorite={true}
                        onSelect={() => executeCommand(cmd.id)}
                        onToggleFavorite={() => toggleFavorite(cmd.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Recent Section */}
                {!query && filteredCommands.recent && filteredCommands.recent.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Recentes
                    </div>
                    {filteredCommands.recent.map((cmd, i) => (
                      <CommandRow
                        key={cmd.id}
                        command={cmd}
                        isSelected={selectedIndex === (filteredCommands.favorites?.length || 0) + i}
                        isFavorite={false}
                        onSelect={() => executeCommand(cmd.id)}
                        onToggleFavorite={() => toggleFavorite(cmd.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Search Results */}
                {query && flatResults.length > 0 && (
                  <div>
                    {flatResults.map((cmd, i) => (
                      <CommandRow
                        key={cmd.id}
                        command={cmd}
                        isSelected={selectedIndex === i}
                        isFavorite={favoriteCommands.includes(cmd.id)}
                        onSelect={() => executeCommand(cmd.id)}
                        onToggleFavorite={() => toggleFavorite(cmd.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {query && flatResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum comando encontrado</p>
                    <p className="text-xs mt-1">Tente uma pesquisa diferente</p>
                  </div>
                )}

                {/* No Query Empty State */}
                {!query && flatResults.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Command className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Digite para pesquisar comandos</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background rounded border">↑↓</kbd>
                  navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background rounded border">↵</kbd>
                  selecionar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-background rounded border">esc</kbd>
                  fechar
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>AI Powered</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Command Row
interface CommandRowProps {
  command: CommandItem;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

function CommandRow({ command, isSelected, isFavorite, onSelect, onToggleFavorite }: CommandRowProps) {
  const Icon = command.icon || FileText;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group',
        isSelected ? 'bg-accent' : 'hover:bg-muted/50'
      )}
      onClick={onSelect}
    >
      <div className={cn(
        'p-1.5 rounded-md',
        command.isAISuggestion ? 'bg-primary/10 text-primary' : 'bg-muted'
      )}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{command.title}</span>
          {command.isAISuggestion && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              AI
            </Badge>
          )}
        </div>
        {command.description && (
          <p className="text-xs text-muted-foreground truncate">
            {command.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={cn(
            'p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity',
            isFavorite ? 'text-yellow-500' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Star className="h-3.5 w-3.5" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {command.shortcut && (
          <div className="hidden sm:flex items-center gap-1">
            {command.shortcut.map((key, i) => (
              <kbd key={i} className="px-1.5 py-0.5 text-xs bg-background rounded border">
                {key}
              </kbd>
            ))}
          </div>
        )}

        {isSelected && (
          <CornerDownLeft className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </motion.div>
  );
}

// Command Trigger Button
export function CommandTrigger() {
  const { open } = useCommandCenter();

  return (
    <Button
      variant="outline"
      className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
      onClick={open}
    >
      <Search className="mr-2 h-4 w-4" />
      <span className="hidden lg:inline-flex">Pesquisar comandos...</span>
      <span className="inline-flex lg:hidden">Pesquisar...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}

// Quick Actions Bar
interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
}

interface QuickActionsBarProps {
  actions: QuickAction[];
}

export function QuickActionsBar({ actions }: QuickActionsBarProps) {
  return (
    <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
      <Zap className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground mr-2">Ações rápidas:</span>
      {actions.map(action => (
        <Button
          key={action.id}
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={action.action}
        >
          <action.icon className="h-3 w-3 mr-1" />
          {action.label}
        </Button>
      ))}
    </div>
  );
}
