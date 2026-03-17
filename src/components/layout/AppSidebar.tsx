import React, { useState, useEffect, useCallback, memo, useMemo, useRef, forwardRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  CalendarDays, 
  LayoutGrid, 
  List, 
  AlertTriangle,
  Settings,
  Users,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  Plus,
  BarChart3,
  Gauge,
  Coins,
  Wrench,
  Brain,
  Code2,
  UserCircle,
  LogOut,
  Zap,
  Bot,
  QrCode,
  RefreshCw,
  BookOpen,
  Palette,
  Menu,
  X,
  Download,
  Bell,
  ArrowRightLeft,
  Package,
  Activity,
  FileDown,
  Trophy,
  BatteryCharging,
  FileText,
  Cog,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { prefetchRoute } from '@/lib/prefetch';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useDevice } from '@/hooks/use-device';
import { useAlertCount } from '@/hooks/useAlertCount';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { LanguageSwitcher } from './LanguageSwitcher';

// ============ NAV GROUP TYPES ============

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

interface NavGroup {
  id: string;
  icon: React.ElementType;
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

// ============ GROUPED NAVIGATION STRUCTURE ============
// Reorganized for better IA - max 7 top-level items

const navGroups: NavGroup[] = [
  {
    id: 'home',
    icon: Home,
    label: 'Início',
    items: [
      { icon: Home, label: 'Dashboard', href: '/' },
    ],
    defaultOpen: true,
  },
  {
    id: 'planning',
    icon: Calendar,
    label: 'Planejamento',
    items: [
      { icon: Calendar, label: 'Calendário Diário', href: '/calendar/daily' },
      { icon: CalendarDays, label: 'Calendário Semanal', href: '/calendar/weekly' },
      { icon: LayoutGrid, label: 'Kanban', href: '/kanban' },
      { icon: List, label: 'Pendências', href: '/pending' },
    ],
  },
  {
    id: 'analytics',
    icon: BarChart3,
    label: 'Analytics',
    items: [
      { icon: BarChart3, label: 'BI Executivo', href: '/bi' },
      { icon: FileDown, label: 'Dashboard Executivo', href: '/executive' },
      { icon: TrendingUp, label: 'KPIs e Ocupação', href: '/kpis' },
      { icon: Gauge, label: 'OEE', href: '/oee' },
      { icon: Zap, label: 'Eficiência', href: '/efficiency' },
      { icon: Activity, label: 'SPC Qualidade', href: '/spc' },
      { icon: Coins, label: 'Custeio ABC', href: '/abc' },
    ],
  },
  {
    id: 'operations',
    icon: Wrench,
    label: 'Operações',
    items: [
      { icon: Wrench, label: 'TPM', href: '/tpm' },
      { icon: Cpu, label: 'Máquinas', href: '/machines' },
      { icon: ArrowRightLeft, label: 'Comparativo Máquinas', href: '/machines/compare' },
      { icon: BatteryCharging, label: 'Energia', href: '/energy' },
      { icon: Package, label: 'Rastreabilidade', href: '/traceability' },
    ],
  },
  {
    id: 'team',
    icon: Users,
    label: 'Equipe',
    items: [
      { icon: Users, label: 'Operadores', href: '/operators' },
      { icon: TrendingUp, label: 'Produtividade', href: '/operators/productivity' },
      { icon: Activity, label: 'Histórico de Ações', href: '/operator-history' },
      { icon: Trophy, label: 'Gamificação', href: '/gamification' },
      { icon: ArrowRightLeft, label: 'Passagem de Turno', href: '/shift-handover' },
      { icon: UserCircle, label: 'Visão Operador', href: '/operator' },
    ],
  },
  {
    id: 'intelligence',
    icon: Brain,
    label: 'Inteligência',
    items: [
      { icon: Brain, label: 'ML Preditivo', href: '/ml-predictions' },
      { icon: Bot, label: 'Assistente IA', href: '/assistant' },
      { icon: BookOpen, label: 'Base de Conhecimento', href: '/knowledge' },
      { icon: FileText, label: 'Documentos', href: '/documents' },
    ],
  },
  {
    id: 'system',
    icon: Cog,
    label: 'Sistema',
    items: [
      { icon: AlertTriangle, label: 'Alertas', href: '/alerts' },
      { icon: Bell, label: 'Notificações', href: '/notifications' },
      { icon: QrCode, label: 'Scanner QR', href: '/scanner' },
      { icon: Settings, label: 'Configurações', href: '/settings' },
    ],
  },
];

// Admin-only items
const adminNavItems: NavItem[] = [
  { icon: Code2, label: 'Qualidade de Código', href: '/code-quality' },
  { icon: RefreshCw, label: 'Bitrix24', href: '/integrations/bitrix24' },
  { icon: Palette, label: 'Design System', href: '/design-system' },
  { icon: Download, label: 'Instalar App', href: '/install' },
];

interface NavButtonProps {
  item: NavItem;
  collapsed: boolean;
  isMobile: boolean;
  isActive: boolean;
}

const NavButton = memo(forwardRef<HTMLDivElement, NavButtonProps>(function NavButton({ item, collapsed, isMobile, isActive }, ref) {
  const Icon = item.icon;
  
  const handlePrefetch = useCallback(() => {
    prefetchRoute(item.href);
  }, [item.href]);

  const button = (
    <Link 
      to={item.href} 
      className="block"
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
    >
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start gap-3 h-11 px-3 relative transition-all duration-200',
          'hover:bg-sidebar-muted/50 hover:text-sidebar-foreground',
          isActive && 'bg-gradient-to-r from-primary/20 to-accent/10 text-primary font-medium border-l-2 border-primary',
          collapsed && !isMobile && 'justify-center px-0'
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
        {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
        {(!collapsed || isMobile) && item.badge && (
          <span className="ml-auto gradient-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
        {(collapsed && !isMobile) && item.badge && (
          <span className="absolute -top-1 -right-1 gradient-primary text-primary-foreground text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
            {item.badge}
          </span>
        )}
      </Button>
    </Link>
  );

  if (collapsed && !isMobile) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2 bg-card border-border">
          {item.label}
          {item.badge && (
            <span className="gradient-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}));
NavButton.displayName = 'NavButton';

// ============ COLLAPSIBLE NAV GROUP ============

interface NavGroupComponentProps {
  group: NavGroup;
  collapsed: boolean;
  isMobile: boolean;
  isActive: (href: string) => boolean;
  alertCount: number;
  openGroups: string[];
  toggleGroup: (id: string) => void;
}

const NavGroupComponent = memo(function NavGroupComponent({
  group,
  collapsed,
  isMobile,
  isActive,
  alertCount,
  openGroups,
  toggleGroup,
}: NavGroupComponentProps) {
  const Icon = group.icon;
  const isOpen = openGroups.includes(group.id);
  const hasActiveItem = group.items.some(item => isActive(item.href));
  
  // Add badge to alerts item
  const itemsWithBadge = group.items.map(item => ({
    ...item,
    badge: item.href === '/alerts' && alertCount > 0 ? alertCount : undefined
  }));

  // In collapsed mode on desktop, show items directly without group wrapper
  if (collapsed && !isMobile) {
    return (
      <>
        {itemsWithBadge.map(item => (
          <NavButton 
            key={item.href} 
            item={item}
            collapsed={collapsed}
            isMobile={isMobile}
            isActive={isActive(item.href)}
          />
        ))}
      </>
    );
  }

  // Single item group - render directly
  if (group.items.length === 1) {
    return (
      <NavButton 
        item={itemsWithBadge[0]}
        collapsed={collapsed}
        isMobile={isMobile}
        isActive={isActive(itemsWithBadge[0].href)}
      />
    );
  }

  return (
    <div className="space-y-0.5">
      <Button
        variant="ghost"
        onClick={() => toggleGroup(group.id)}
        className={cn(
          "w-full justify-between gap-3 h-10 px-3",
          "hover:bg-sidebar-muted/50 hover:text-sidebar-foreground",
          "text-sidebar-foreground/70",
          hasActiveItem && "text-sidebar-foreground font-medium"
        )}
        aria-expanded={isOpen}
        aria-controls={`nav-group-${group.id}`}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn(
            "h-4 w-4 shrink-0",
            hasActiveItem && "text-primary"
          )} />
          <span className="text-sm">{group.label}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 opacity-50" />
        </motion.div>
      </Button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`nav-group-${group.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pl-4 space-y-0.5 border-l-2 border-border/30 ml-5">
              {itemsWithBadge.map(item => (
                <NavButton 
                  key={item.href} 
                  item={item}
                  collapsed={false}
                  isMobile={isMobile}
                  isActive={isActive(item.href)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export function AppSidebar() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(['home', 'planning']);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role, signOut, isCoordinator } = useAuth();
  const { isMobile } = useDevice();
  const alertCount = useAlertCount();

  // Toggle group open/closed
  const toggleGroup = useCallback((groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  }, []);

  // Auto-open group containing active route
  useEffect(() => {
    const activeGroup = navGroups.find(group => 
      group.items.some(item => {
        if (item.href === '/') return location.pathname === '/';
        return location.pathname.startsWith(item.href);
      })
    );
    if (activeGroup && !openGroups.includes(activeGroup.id)) {
      setOpenGroups(prev => [...prev, activeGroup.id]);
    }
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate('/auth');
  }, [signOut, navigate]);

  // Filter nav groups based on role
  const filteredNavGroups = useMemo(() => {
    const operatorAllowedPaths = ['/operator', '/alerts', '/assistant', '/scanner', '/knowledge', '/shift-handover'];
    const managerAllowedPaths = ['/', '/bi', '/executive', '/calendar/daily', '/calendar/weekly', '/kpis', '/oee', '/abc', '/spc', '/tpm', '/ml-predictions', '/alerts', '/notifications', '/efficiency', '/operators', '/operators/productivity', '/machines', '/energy', '/traceability', '/assistant', '/knowledge', '/documents', '/shift-handover', '/gamification', '/settings', '/security', '/kanban', '/new-job'];

    return navGroups.map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (role === 'operator') return operatorAllowedPaths.includes(item.href);
        if (role === 'manager') return managerAllowedPaths.includes(item.href);
        return true;
      })
    })).filter(group => group.items.length > 0);
  }, [role]);

  const filteredAdminNavItems = isCoordinator ? adminNavItems : [];

  const isActive = useCallback((href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  }, [location.pathname]);

  const handleNewJobPrefetch = useCallback(() => {
    prefetchRoute('/new-job');
  }, []);

  // Swipe gesture to open sidebar from left edge
  const { ref: swipeRef } = useSwipeGesture<HTMLDivElement>({
    onSwipeRight: () => {
      if (isMobile && !mobileOpen) {
        setMobileOpen(true);
      }
    },
    onSwipeLeft: () => {
      if (isMobile && mobileOpen) {
        setMobileOpen(false);
      }
    },
    threshold: 50,
    disabled: !isMobile,
  });

  // Focus trap for mobile sidebar
  const focusTrapRef = useFocusTrap<HTMLElement>({
    enabled: isMobile && mobileOpen,
    autoFocus: true,
    restoreFocus: true,
  });

  // Mobile hamburger button
  const mobileMenuButton = (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setMobileOpen(!mobileOpen)}
      aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
      aria-expanded={mobileOpen}
      className="fixed top-4 left-4 z-50 md:hidden h-10 w-10 bg-background/80 backdrop-blur-sm border border-border shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  );

  // Mobile overlay
  const mobileOverlay = (
    <div
      className={cn(
        'fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300',
        mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onClick={() => setMobileOpen(false)}
      aria-hidden="true"
    />
  );

  return (
    <>
      {mobileMenuButton}
      {mobileOverlay}
      
      {/* Swipe detection zone for opening sidebar */}
      {isMobile && !mobileOpen && (
        <div
          ref={swipeRef}
          className="fixed inset-y-0 left-0 w-8 z-30 md:hidden"
          aria-hidden="true"
        />
      )}
      
      <aside
        ref={isMobile ? focusTrapRef : undefined}
        className={cn(
          'flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300',
          'shadow-[2px_0_12px_-4px_hsl(220_20%_20%/0.08)] dark:shadow-none',
          // Desktop styles
          'hidden md:flex',
          collapsed ? 'w-16' : 'w-64',
          // Mobile styles
          isMobile && 'fixed inset-y-0 left-0 z-50 w-72',
          isMobile && (mobileOpen ? 'translate-x-0' : '-translate-x-full'),
          isMobile && 'flex'
        )}
        role="navigation"
        aria-label="Menu principal"
        id="navigation"
      >
        {/* Header */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-sidebar-border',
          collapsed && !isMobile ? 'justify-center' : 'justify-between'
        )}>
          {(!collapsed || isMobile) && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
                <Printer className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-sidebar-foreground text-base">Fast Gravações</h1>
                <p className="text-xs text-sidebar-foreground/50">Sistema de Gestão</p>
              </div>
            </div>
          )}
          
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
              className="h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-muted focus:ring-2 focus:ring-primary"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* New Job Button - hidden from operators */}
        {role !== 'operator' && (
          <div className={cn('p-3', collapsed && !isMobile && 'px-2')}>
            <Link 
              to="/new-job"
              onMouseEnter={handleNewJobPrefetch}
              onFocus={handleNewJobPrefetch}
            >
              <Button 
                className={cn(
                  'w-full gap-2 gradient-primary hover:opacity-90 transition-opacity glow-primary',
                  'focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  collapsed && !isMobile && 'px-0'
                )}
              >
                <Plus className="h-4 w-4" />
                {(!collapsed || isMobile) && <span>Novo Agendamento</span>}
              </Button>
            </Link>
          </div>
        )}

        {/* Main Navigation with Collapsible Groups */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1" id="main-navigation">
          {filteredNavGroups.map((group) => (
            <NavGroupComponent
              key={group.id}
              group={group}
              collapsed={collapsed}
              isMobile={isMobile}
              isActive={isActive}
              alertCount={alertCount}
              openGroups={openGroups}
              toggleGroup={toggleGroup}
            />
          ))}
          
          {/* Admin Section */}
          {filteredAdminNavItems.length > 0 && (
            <>
              <div className="my-4 border-t border-sidebar-border/50" />
              
              {(!collapsed || isMobile) && (
                <p className="text-xs font-medium text-sidebar-foreground/30 uppercase tracking-wider px-3 py-2">
                  Administração
                </p>
              )}
              {filteredAdminNavItems.map((item) => (
                <NavButton 
                  key={item.href} 
                  item={item}
                  collapsed={collapsed}
                  isMobile={isMobile}
                  isActive={isActive(item.href)}
                />
              ))}
            </>
          )}
        </nav>

        {/* User Profile */}
        <div className={cn(
          'p-3 border-t border-sidebar-border/50',
          collapsed && !isMobile && 'p-2'
        )}>
          {/* Language Switcher */}
          {(!collapsed || isMobile) && (
            <div className="mb-2 px-1">
              <LanguageSwitcher />
            </div>
          )}
          
          <div className={cn(
            'flex items-center gap-3 rounded-lg p-2',
            collapsed && !isMobile && 'justify-center p-2'
          )}>
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {(!collapsed || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.full_name || 'Usuário'}
                </p>
                <p className="text-xs text-sidebar-foreground/40 truncate capitalize">
                  {role === 'coordinator' ? 'Coordenador' : role === 'manager' ? 'Gestão' : 'Operador'}
                </p>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size={(collapsed && !isMobile) ? "icon" : "sm"}
            onClick={handleSignOut}
            className={cn(
              'w-full mt-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-muted',
              'focus:ring-2 focus:ring-primary focus:ring-offset-2',
              collapsed && !isMobile && 'px-0'
            )}
          >
            <LogOut className="h-4 w-4" />
            {(!collapsed || isMobile) && <span className="ml-2">{t('common.logout')}</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
