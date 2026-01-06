import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useDevice } from '@/hooks/use-device';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

// Enhanced route configuration with icons and dynamic labels
interface RouteConfig {
  label: string;
  icon?: React.ElementType;
  parent?: string;
  dynamicLabel?: (params: Record<string, string>) => string;
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
  'daily': { label: 'Diário', parent: 'calendar' },
  'weekly': { label: 'Semanal', parent: 'calendar' },
  'pending': { label: 'Fila Pendente' },
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

interface SmartBreadcrumbsProps {
  className?: string;
  maxItems?: number;
  showHome?: boolean;
  separator?: React.ReactNode;
  animated?: boolean;
}

export function SmartBreadcrumbs({
  className,
  maxItems = 4,
  showHome = true,
  separator,
  animated = true,
}: SmartBreadcrumbsProps) {
  const location = useLocation();
  const params = useParams();
  const { isMobile } = useDevice();

  const breadcrumbs = useMemo(() => {
    const pathnames = location.pathname.split('/').filter(Boolean);

    // Don't show breadcrumbs on home page
    if (pathnames.length === 0) return [];

    const items: BreadcrumbItem[] = [];

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

  return (
    <Wrapper
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-1 text-sm text-muted-foreground mb-4 overflow-x-auto scrollbar-none",
        className
      )}
      initial={animated ? { opacity: 0, y: -10 } : undefined}
      animate={animated ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence mode="popLayout">
        {mobileBreadcrumbs.map((item, index) => {
          const isCollapsedIndicator = item.label === '...';
          const isFirst = index === 0;
          const isLast = index === mobileBreadcrumbs.length - 1;

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

// Breadcrumb with context actions
interface BreadcrumbWithActionsProps {
  actions?: React.ReactNode;
  className?: string;
}

export function BreadcrumbWithActions({ actions, className }: BreadcrumbWithActionsProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4 mb-4", className)}>
      <SmartBreadcrumbs className="mb-0" />
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
