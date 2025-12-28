import { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  FileText
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

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const baseMainNavItems: Omit<NavItem, 'badge'>[] = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: BarChart3, label: 'BI Executivo', href: '/bi' },
  { icon: FileDown, label: 'Dashboard Executivo', href: '/executive' },
  { icon: Trophy, label: 'Gamificação', href: '/gamification' },
  { icon: Calendar, label: 'Calendário Diário', href: '/calendar/daily' },
  { icon: CalendarDays, label: 'Calendário Semanal', href: '/calendar/weekly' },
  { icon: LayoutGrid, label: 'Kanban', href: '/kanban' },
  { icon: List, label: 'Lista de Pendências', href: '/pending' },
  { icon: Zap, label: 'Eficiência', href: '/efficiency' },
  { icon: Gauge, label: 'OEE', href: '/oee' },
  { icon: Coins, label: 'Custeio ABC', href: '/abc' },
  { icon: Package, label: 'Rastreabilidade', href: '/traceability' },
  { icon: Activity, label: 'SPC Qualidade', href: '/spc' },
  { icon: Wrench, label: 'TPM', href: '/tpm' },
  { icon: Brain, label: 'ML Preditivo', href: '/ml-predictions' },
  { icon: BatteryCharging, label: 'Energia', href: '/energy' },
  { icon: BarChart3, label: 'KPIs e Ocupação', href: '/kpis' },
  { icon: AlertTriangle, label: 'Alertas', href: '/alerts' },
  { icon: Bell, label: 'Notificações', href: '/notifications' },
  { icon: ArrowRightLeft, label: 'Passagem de Turno', href: '/shift-handover' },
  { icon: BookOpen, label: 'Base de Conhecimento', href: '/knowledge' },
  { icon: FileText, label: 'Documentos', href: '/documents' },
  { icon: UserCircle, label: 'Visão Operador', href: '/operator' },
  { icon: QrCode, label: 'Scanner QR', href: '/scanner' },
  { icon: Bot, label: 'Assistente IA', href: '/assistant' },
];

const secondaryNavItems: NavItem[] = [
  { icon: Printer, label: 'Máquinas', href: '/machines' },
  { icon: Users, label: 'Operadores', href: '/operators' },
  { icon: BarChart3, label: 'Produtividade', href: '/operators/productivity' },
  { icon: Code2, label: 'Qualidade de Código', href: '/code-quality' },
  { icon: RefreshCw, label: 'Bitrix24', href: '/integrations/bitrix24' },
  { icon: Palette, label: 'Design System', href: '/design-system' },
  { icon: Download, label: 'Instalar App', href: '/install' },
  { icon: Settings, label: 'Configurações', href: '/settings' },
];

interface NavButtonProps {
  item: NavItem;
  collapsed: boolean;
  isMobile: boolean;
  isActive: boolean;
}

const NavButton = memo(function NavButton({ item, collapsed, isMobile, isActive }: NavButtonProps) {
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
});
NavButton.displayName = 'NavButton';

export function AppSidebar() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, role, signOut, isCoordinator } = useAuth();
  const { isMobile } = useDevice();
  const alertCount = useAlertCount();

  // Build nav items with dynamic badge
  const mainNavItems: NavItem[] = useMemo(() => 
    baseMainNavItems.map(item => ({
      ...item,
      badge: item.href === '/alerts' && alertCount > 0 ? alertCount : undefined
    })), [alertCount]);

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

  // Filter nav items based on role
  const filteredMainNavItems = mainNavItems.filter(item => {
    if (role === 'operator') {
      return ['/operator', '/alerts', '/assistant', '/scanner', '/knowledge', '/shift-handover'].includes(item.href);
    }
    if (role === 'manager') {
      return ['/', '/bi', '/calendar/daily', '/calendar/weekly', '/kpis', '/oee', '/abc', '/tpm', '/ml-predictions', '/alerts', '/notifications', '/efficiency', '/assistant', '/knowledge', '/shift-handover'].includes(item.href);
    }
    return true; // coordinator sees all
  });

  const filteredSecondaryNavItems = isCoordinator ? secondaryNavItems : [];

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
  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setMobileOpen(!mobileOpen)}
      className="fixed top-4 left-4 z-50 md:hidden h-10 w-10 bg-background/80 backdrop-blur-sm border border-border shadow-lg"
    >
      {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  );

  // Mobile overlay
  const MobileOverlay = () => (
    <div
      className={cn(
        'fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300',
        mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onClick={() => setMobileOpen(false)}
    />
  );

  return (
    <>
      <MobileMenuButton />
      <MobileOverlay />
      
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
                <h1 className="font-display font-bold text-sidebar-foreground text-base">Gravação</h1>
                <p className="text-xs text-sidebar-foreground/50">Promo Brindes</p>
              </div>
            </div>
          )}
          
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-muted"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* New Job Button */}
        <div className={cn('p-3', collapsed && !isMobile && 'px-2')}>
          <Link 
            to="/new-job"
            onMouseEnter={handleNewJobPrefetch}
            onFocus={handleNewJobPrefetch}
          >
            <Button 
              className={cn(
                'w-full gap-2 gradient-primary hover:opacity-90 transition-opacity glow-primary',
                collapsed && !isMobile && 'px-0'
              )}
            >
              <Plus className="h-4 w-4" />
              {(!collapsed || isMobile) && <span>Novo Agendamento</span>}
            </Button>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
          {(!collapsed || isMobile) && (
            <p className="text-xs font-medium text-sidebar-foreground/30 uppercase tracking-wider px-3 py-2">
              Navegação
            </p>
          )}
          {filteredMainNavItems.map((item) => (
            <NavButton 
              key={item.href} 
              item={item}
              collapsed={collapsed}
              isMobile={isMobile}
              isActive={isActive(item.href)}
            />
          ))}
          
          {filteredSecondaryNavItems.length > 0 && (
            <>
              <div className="my-4 border-t border-sidebar-border/50" />
              
              {(!collapsed || isMobile) && (
                <p className="text-xs font-medium text-sidebar-foreground/30 uppercase tracking-wider px-3 py-2">
                  Administração
                </p>
              )}
              {filteredSecondaryNavItems.map((item) => (
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
