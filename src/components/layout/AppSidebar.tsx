import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Calendar, 
  CalendarDays, 
  LayoutGrid, 
  List, 
  PieChart, 
  AlertTriangle,
  Settings,
  Users,
  Printer,
  ChevronLeft,
  ChevronRight,
  Home,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: Calendar, label: 'Calendário Diário', href: '/calendar/daily' },
  { icon: CalendarDays, label: 'Calendário Semanal', href: '/calendar/weekly' },
  { icon: LayoutGrid, label: 'Kanban', href: '/kanban' },
  { icon: List, label: 'Lista de Pendências', href: '/pending' },
  { icon: PieChart, label: 'Ocupação', href: '/occupancy' },
  { icon: AlertTriangle, label: 'Alertas', href: '/alerts', badge: 3 },
];

const secondaryNavItems: NavItem[] = [
  { icon: Printer, label: 'Máquinas', href: '/machines' },
  { icon: Users, label: 'Operadores', href: '/operators' },
  { icon: Settings, label: 'Configurações', href: '/settings' },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const NavButton = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    const Icon = item.icon;

    const button = (
      <Link to={item.href} className="block">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 h-11 px-3 relative transition-all duration-200',
            'hover:bg-sidebar-accent/20 hover:text-sidebar-foreground',
            active && 'bg-sidebar-primary/20 text-sidebar-primary font-medium',
            collapsed && 'justify-center px-0'
          )}
        >
          <Icon className={cn('h-5 w-5 shrink-0', active && 'text-sidebar-primary')} />
          {!collapsed && <span className="truncate">{item.label}</span>}
          {!collapsed && item.badge && (
            <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
          {collapsed && item.badge && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
              {item.badge}
            </span>
          )}
        </Button>
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.label}
            {item.badge && (
              <span className="bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-sidebar-border',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Printer className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sidebar-foreground text-sm">Gravação</h1>
              <p className="text-xs text-sidebar-foreground/60">Promo Brindes</p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-muted"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* New Job Button */}
      <div className={cn('p-3', collapsed && 'px-2')}>
        <Link to="/new-job">
          <Button 
            className={cn(
              'w-full gap-2 gradient-primary hover:opacity-90 transition-opacity',
              collapsed && 'px-0'
            )}
          >
            <Plus className="h-4 w-4" />
            {!collapsed && <span>Novo Agendamento</span>}
          </Button>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
        {!collapsed && (
          <p className="text-xs font-medium text-sidebar-foreground/40 uppercase tracking-wider px-3 py-2">
            Navegação
          </p>
        )}
        {mainNavItems.map((item) => (
          <NavButton key={item.href} item={item} />
        ))}
        
        <div className="my-4 border-t border-sidebar-border" />
        
        {!collapsed && (
          <p className="text-xs font-medium text-sidebar-foreground/40 uppercase tracking-wider px-3 py-2">
            Administração
          </p>
        )}
        {secondaryNavItems.map((item) => (
          <NavButton key={item.href} item={item} />
        ))}
      </nav>

      {/* User Profile */}
      <div className={cn(
        'p-3 border-t border-sidebar-border',
        collapsed && 'p-2'
      )}>
        <div className={cn(
          'flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-muted transition-colors cursor-pointer',
          collapsed && 'justify-center p-2'
        )}>
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary font-semibold text-sm">
            CG
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Coordenador</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">coord@promobrindes.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
