import { useMemo, useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, MoreHorizontal, Clock, Star, StarOff, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useDevice } from '@/hooks/use-device';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

// Enhanced route configuration with icons, siblings, and dynamic labels
interface RouteConfig {
  label: string;
  icon?: React.ElementType;
  parent?: string;
  dynamicLabel?: (params: Record<string, string>) => string;
  siblings?: { path: string; label: string }[];
}

const routeConfig: Record<string, RouteConfig> = {
  '': { label: 'Início' },
  'dashboard': { label: 'Dashboard' },
  'kanban': { label: 'Kanban' },
  'jobs': { label: 'Jobs' },
  'new-job': { label: 'Novo Job', parent: 'jobs' },
  'operators': { label: 'Operadores' },
  'operator-view': { label: 'Visão Operador', parent: 'operators' },
  'operator-productivity': { label: 'Produtividade', parent: 'operators' },
  'machines': { label: 'Máquinas' },
  'efficiency': { label: 'Eficiência' },
  'energy': { label: 'Energia' },
  'tpm': { label: 'TPM' },
  'oee': { label: 'OEE' },
  'spc': { label: 'SPC' },
  'kpi': { label: 'KPIs' },
  'kpis': { label: 'KPIs' },
  'bi': { label: 'Business Intelligence' },
  'ml-predictions': { label: 'Predições ML' },
  'abc-costing': { label: 'Custeio ABC' },
  'gamification': { label: 'Gamificação' },
  'traceability': { label: 'Rastreabilidade' },
  'documents': { label: 'Documentos' },
  'security': { label: 'Segurança' },
  'settings': { label: 'Configurações' },
  'notifications': { label: 'Notificações' },
  'scanner': { label: 'Scanner QR' },
  'shift-handover': { label: 'Passagem de Turno' },
  'weekly-calendar': { label: 'Calendário Semanal' },
  'daily-calendar': { label: 'Calendário Diário' },
  'calendar': { label: 'Calendário' },
  'daily': { 
    label: 'Diário', 
    parent: 'calendar',
    siblings: [{ path: '/calendar/weekly', label: 'Semanal' }]
  },
  'weekly': { 
    label: 'Semanal', 
    parent: 'calendar',
    siblings: [{ path: '/calendar/daily', label: 'Diário' }]
  },
  'pending': { label: 'Fila Pendente' },
  'pending-queue': { label: 'Fila de Espera' },
  'alerts': { label: 'Alertas' },
  'executive': { label: 'Executivo' },
  'technical-assistant': { label: 'Assistente Técnico' },
  'knowledge-base': { label: 'Base de Conhecimento' },
  'design-system': { label: 'Design System' },
  'code-quality': { label: 'Qualidade de Código' },
  'bitrix24-config': { label: 'Bitrix24' },
  'install-app': { label: 'Instalar App' },
  'auth': { label: 'Autenticação' },
  'reset-password': { label: 'Redefinir Senha' },
};

// Hook for navigation history
function useNavigationHistory() {
  const [history, setHistory] = useState<string[]>([]);
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('nav_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    setHistory(prev => {
      const newHistory = [location.pathname, ...prev.filter(p => p !== location.pathname)].slice(0, 15);
      localStorage.setItem('nav_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, [location.pathname]);

  return history.slice(1); // Exclude current
}

// Hook for favorite pages
function useFavoritePages() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('breadcrumb_favorites');
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  const toggleFavorite = (path: string) => {
    setFavorites(prev => {
      const updated = prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path];
      localStorage.setItem('breadcrumb_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (path: string) => favorites.includes(path);

  return { favorites, toggleFavorite, isFavorite };
}

interface SmartBreadcrumbsProps {
  className?: string;
  maxItems?: number;
  showHome?: boolean;
  separator?: React.ReactNode;
  animated?: boolean;
  showHistory?: boolean;
  showFavorites?: boolean;
}

export function SmartBreadcrumbs({
  className,
  maxItems = 4,
  showHome = true,
  separator,
  animated = true,
  showHistory = true,
  showFavorites = true,
}: SmartBreadcrumbsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { isMobile } = useDevice();
  const history = useNavigationHistory();
  const { favorites, toggleFavorite, isFavorite } = useFavoritePages();

  const breadcrumbs = useMemo(() => {
    const pathnames = location.pathname.split('/').filter(Boolean);

    // Don't show breadcrumbs on home page
    if (pathnames.length === 0) return [];

    const items: (BreadcrumbItem & { siblings?: { path: string; label: string }[] })[] = [];

    // Add home
    if (showHome) {
      items.push({ label: 'Início', href: '/' });
    }

    let currentPath = '';
    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathnames.length - 1;
      const config = routeConfig[segment];

      // Handle dynamic segments (e.g., UUIDs)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
      
      let label: string;
      if (config) {
        label = config.dynamicLabel 
          ? config.dynamicLabel(params as Record<string, string>)
          : config.label;
      } else if (isUUID) {
        label = 'Detalhes';
      } else {
        label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      }

      items.push({
        label,
        href: isLast ? undefined : currentPath,
        icon: config?.icon,
        siblings: config?.siblings,
      });
    });

    return items;
  }, [location.pathname, params, showHome]);

  // Don't render if no breadcrumbs
  if (breadcrumbs.length === 0) return null;

  // Collapse breadcrumbs if too many
  const shouldCollapse = breadcrumbs.length > maxItems;
  const visibleBreadcrumbs = shouldCollapse
    ? [
        breadcrumbs[0],
        { label: '...', href: undefined }, // Collapsed indicator
        ...breadcrumbs.slice(-2),
      ]
    : breadcrumbs;

  const collapsedItems = shouldCollapse
    ? breadcrumbs.slice(1, -2)
    : [];

  // Mobile: Show only current and parent
  const mobileBreadcrumbs = isMobile
    ? breadcrumbs.slice(-2)
    : visibleBreadcrumbs;

  const SeparatorComponent = separator || (
    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/50" />
  );

  const Wrapper = animated ? motion.nav : 'nav';

  const currentPath = location.pathname;
  const isCurrentFavorite = isFavorite(currentPath);

  return (
    <div className={cn("flex items-center gap-2 mb-4", className)}>
      <Wrapper
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto scrollbar-none flex-1"
        initial={animated ? { opacity: 0, y: -10 } : undefined}
        animate={animated ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="popLayout">
          {mobileBreadcrumbs.map((item, index) => {
            const isCollapsedIndicator = item.label === '...';
            const isFirst = index === 0;
            const isLast = index === mobileBreadcrumbs.length - 1;
            const hasSiblings = 'siblings' in item && item.siblings && item.siblings.length > 0;

            return (
              <motion.div
                key={item.href || item.label}
                initial={animated ? { opacity: 0, x: -10 } : false}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15, delay: index * 0.05 }}
                className="flex items-center gap-1 min-w-0"
              >
                {index > 0 && SeparatorComponent}

                {isFirst && showHome && (
                  <Home className="h-3.5 w-3.5 mr-0.5 flex-shrink-0" />
                )}

                {isCollapsedIndicator ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 hover:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {collapsedItems.map((collapsedItem) => (
                        <DropdownMenuItem key={collapsedItem.href} asChild>
                          <Link to={collapsedItem.href || '#'}>
                            {collapsedItem.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : hasSiblings ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 hover:text-foreground transition-colors">
                      <span className={cn(
                        isLast ? "text-foreground font-medium" : "hover:underline underline-offset-4"
                      )}>
                        {item.label}
                      </span>
                      <ChevronRight className="h-3 w-3 rotate-90" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Também nesta seção
                      </div>
                      {item.siblings?.map((sibling) => (
                        <DropdownMenuItem 
                          key={sibling.path}
                          onClick={() => navigate(sibling.path)}
                        >
                          {sibling.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : item.href ? (
                  <Link
                    to={item.href}
                    className={cn(
                      "hover:text-foreground transition-colors truncate max-w-[150px]",
                      "hover:underline underline-offset-4",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium truncate max-w-[200px]">
                    {item.label}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Wrapper>

      {/* Quick actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Favorite toggle */}
        {showFavorites && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => toggleFavorite(currentPath)}
              >
                {isCurrentFavorite ? (
                  <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                ) : (
                  <StarOff className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isCurrentFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            </TooltipContent>
          </Tooltip>
        )}

        {/* History dropdown */}
        {showHistory && history.length > 0 && (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2 gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline text-xs">Recentes</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Páginas recentes</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Páginas recentes
              </div>
              {history.slice(0, 8).map(path => {
                const segments = path.split('/').filter(Boolean);
                const lastSegment = segments[segments.length - 1] || '';
                const config = routeConfig[lastSegment];
                const label = config?.label || lastSegment.replace(/-/g, ' ');
                
                return (
                  <DropdownMenuItem
                    key={path}
                    onClick={() => navigate(path)}
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="truncate">{label}</span>
                    {isFavorite(path) && (
                      <Star className="h-3 w-3 text-warning fill-warning ml-auto" />
                    )}
                  </DropdownMenuItem>
                );
              })}
              
              {favorites.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    Favoritos
                  </div>
                  {favorites.slice(0, 5).map(path => {
                    const segments = path.split('/').filter(Boolean);
                    const lastSegment = segments[segments.length - 1] || '';
                    const config = routeConfig[lastSegment];
                    const label = config?.label || lastSegment.replace(/-/g, ' ') || 'Início';
                    
                    return (
                      <DropdownMenuItem
                        key={path}
                        onClick={() => navigate(path)}
                        className="flex items-center gap-2"
                      >
                        <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                        <span className="truncate">{label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

// Compact breadcrumb for tight spaces
export function CompactBreadcrumb({ className }: { className?: string }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  if (pathnames.length === 0) return null;

  const currentSegment = pathnames[pathnames.length - 1];
  const config = routeConfig[currentSegment];
  const label = config?.label || currentSegment.charAt(0).toUpperCase() + currentSegment.slice(1).replace(/-/g, ' ');

  const hasParent = pathnames.length > 1;
  const parentPath = hasParent ? '/' + pathnames.slice(0, -1).join('/') : '/';

  return (
    <nav className={cn("flex items-center gap-2 text-sm", className)}>
      {hasParent && (
        <Link
          to={parentPath}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ←
        </Link>
      )}
      <span className="font-medium text-foreground">{label}</span>
    </nav>
  );
}

// Back button with smart navigation
export function SmartBackButton({ 
  className,
  fallbackPath = "/"
}: { 
  className?: string;
  fallbackPath?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);
  
  const parentPath = pathnames.length > 1 
    ? '/' + pathnames.slice(0, -1).join('/')
    : fallbackPath;
  
  const parentSegment = pathnames.length > 1 
    ? pathnames[pathnames.length - 2]
    : '';
  const config = routeConfig[parentSegment];
  const label = config?.label || 'Voltar';

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("gap-1.5", className)}
      onClick={() => navigate(parentPath)}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
}

// Breadcrumb with context actions
interface BreadcrumbWithActionsProps {
  actions?: React.ReactNode;
  className?: string;
}

export function BreadcrumbWithActions({ actions, className }: BreadcrumbWithActionsProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 mb-4", className)}>
      <SmartBreadcrumbs className="mb-0 flex-1" />
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
