import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronRight, 
  Home, 
  Clock, 
  Star, 
  StarOff,
  X,
  Search,
  Keyboard,
  ArrowLeft,
  ArrowRight,
  Command
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Types
interface RecentPage {
  path: string;
  title: string;
  timestamp: Date;
}

interface FavoritePage {
  path: string;
  title: string;
  icon?: string;
}

interface NavigationContextType {
  recentPages: RecentPage[];
  favoritePages: FavoritePage[];
  addToRecent: (path: string, title: string) => void;
  addToFavorites: (path: string, title: string, icon?: string) => void;
  removeFromFavorites: (path: string) => void;
  isFavorite: (path: string) => boolean;
  goBack: () => void;
  goForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

// Provider
export const ContextualNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [recentPages, setRecentPages] = useState<RecentPage[]>(() => {
    const saved = localStorage.getItem('recent-pages');
    if (saved) {
      return JSON.parse(saved).map((p: RecentPage) => ({
        ...p,
        timestamp: new Date(p.timestamp),
      }));
    }
    return [];
  });

  const [favoritePages, setFavoritePages] = useState<FavoritePage[]>(() => {
    const saved = localStorage.getItem('favorite-pages');
    return saved ? JSON.parse(saved) : [];
  });

  const [historyIndex, setHistoryIndex] = useState(0);
  const [historyStack, setHistoryStack] = useState<string[]>([location.pathname]);

  // Persist
  useEffect(() => {
    localStorage.setItem('recent-pages', JSON.stringify(recentPages));
  }, [recentPages]);

  useEffect(() => {
    localStorage.setItem('favorite-pages', JSON.stringify(favoritePages));
  }, [favoritePages]);

  // Track history
  useEffect(() => {
    const currentPath = location.pathname;
    if (historyStack[historyIndex] !== currentPath) {
      setHistoryStack(prev => [...prev.slice(0, historyIndex + 1), currentPath]);
      setHistoryIndex(prev => prev + 1);
    }
  }, [location.pathname]);

  const addToRecent = useCallback((path: string, title: string) => {
    setRecentPages(prev => {
      const filtered = prev.filter(p => p.path !== path);
      const updated = [{ path, title, timestamp: new Date() }, ...filtered].slice(0, 10);
      return updated;
    });
  }, []);

  const addToFavorites = useCallback((path: string, title: string, icon?: string) => {
    setFavoritePages(prev => {
      if (prev.some(p => p.path === path)) return prev;
      return [...prev, { path, title, icon }];
    });
  }, []);

  const removeFromFavorites = useCallback((path: string) => {
    setFavoritePages(prev => prev.filter(p => p.path !== path));
  }, []);

  const isFavorite = useCallback((path: string) => {
    return favoritePages.some(p => p.path === path);
  }, [favoritePages]);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < historyStack.length - 1;

  const goBack = useCallback(() => {
    if (canGoBack) {
      setHistoryIndex(prev => prev - 1);
      navigate(historyStack[historyIndex - 1]);
    }
  }, [canGoBack, historyIndex, historyStack, navigate]);

  const goForward = useCallback(() => {
    if (canGoForward) {
      setHistoryIndex(prev => prev + 1);
      navigate(historyStack[historyIndex + 1]);
    }
  }, [canGoForward, historyIndex, historyStack, navigate]);

  return (
    <NavigationContext.Provider value={{
      recentPages,
      favoritePages,
      addToRecent,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      goBack,
      goForward,
      canGoBack,
      canGoForward,
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

// Hook
export function useContextualNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useContextualNavigation must be used within ContextualNavigationProvider');
  }
  return context;
}

// Breadcrumbs with favorites
export const EnhancedBreadcrumbs: React.FC<{
  items: Array<{ label: string; href?: string }>;
  className?: string;
}> = ({ items, className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToFavorites, removeFromFavorites, isFavorite } = useContextualNavigation();

  const currentPath = location.pathname;
  const currentTitle = items[items.length - 1]?.label || '';
  const isCurrentFavorite = isFavorite(currentPath);

  return (
    <nav className={cn('flex items-center gap-1', className)}>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/')}>
        <Home className="w-4 h-4" />
      </Button>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          {item.href && index < items.length - 1 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => navigate(item.href!)}
            >
              {item.label}
            </Button>
          ) : (
            <span className="text-sm font-medium px-2">{item.label}</span>
          )}
        </React.Fragment>
      ))}

      {items.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-1"
                onClick={() => {
                  if (isCurrentFavorite) {
                    removeFromFavorites(currentPath);
                  } else {
                    addToFavorites(currentPath, currentTitle);
                  }
                }}
              >
                {isCurrentFavorite ? (
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ) : (
                  <StarOff className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isCurrentFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </nav>
  );
};

// Recently viewed widget
export const RecentlyViewedWidget: React.FC<{
  className?: string;
  maxItems?: number;
}> = ({ className, maxItems = 5 }) => {
  const navigate = useNavigate();
  const { recentPages } = useContextualNavigation();

  const displayPages = recentPages.slice(0, maxItems);

  if (displayPages.length === 0) return null;

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'agora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Clock className="w-4 h-4" />
        Vistos recentemente
      </div>
      <div className="space-y-1">
        {displayPages.map((page, index) => (
          <motion.button
            key={page.path}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-left"
            onClick={() => navigate(page.path)}
          >
            <span className="text-sm truncate">{page.title}</span>
            <span className="text-xs text-muted-foreground shrink-0">{timeAgo(page.timestamp)}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Quick actions widget
export const QuickActionsWidget: React.FC<{
  actions: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    shortcut?: string;
  }>;
  className?: string;
}> = ({ actions, className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Keyboard className="w-4 h-4" />
        Ações rápidas
      </div>
      <div className="space-y-1">
        {actions.map((action, index) => (
          <button
            key={index}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={action.onClick}
          >
            <div className="flex items-center gap-2">
              {action.icon}
              <span className="text-sm">{action.label}</span>
            </div>
            {action.shortcut && (
              <Badge variant="outline" className="text-[10px] font-mono">
                {action.shortcut}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Navigation arrows
export const NavigationArrows: React.FC<{ className?: string }> = ({ className }) => {
  const { goBack, goForward, canGoBack, canGoForward } = useContextualNavigation();

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={!canGoBack}
              onClick={goBack}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Voltar</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={!canGoForward}
              onClick={goForward}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Avançar</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

// Keyboard shortcuts display
export const KeyboardShortcutsHelp: React.FC<{
  shortcuts: Array<{
    keys: string[];
    description: string;
    category?: string;
  }>;
}> = ({ shortcuts }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    const category = shortcut.category || 'Geral';
    if (!acc[category]) acc[category] = [];
    acc[category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-card border rounded-lg shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Atalhos de Teclado
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-auto">
              {Object.entries(groupedShortcuts).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">{category}</h3>
                  <div className="space-y-2">
                    {items.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, i) => (
                            <React.Fragment key={i}>
                              {i > 0 && <span className="text-xs text-muted-foreground">+</span>}
                              <kbd className="px-2 py-1 text-xs rounded bg-muted border font-mono">
                                {key}
                              </kbd>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t text-center text-xs text-muted-foreground">
              Pressione <kbd className="px-1 rounded bg-muted">⌘?</kbd> para abrir/fechar
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ContextualNavigationProvider;
