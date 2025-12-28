import { memo, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Calendar, 
  LayoutGrid, 
  AlertTriangle,
  User,
  Menu,
  QrCode,
  Wrench,
  BarChart3,
  Bell,
  Settings,
  BookOpen,
  ArrowRightLeft,
  Download,
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDevice } from '@/hooks/use-device';
import { useAuth } from '@/contexts/AuthContext';
import { useAlertCount } from '@/hooks/useAlertCount';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  roles?: ('operator' | 'coordinator' | 'manager')[];
}

// Primary nav items for different roles
const operatorPrimaryItems: NavItem[] = [
  { id: 'operator', icon: User, label: 'Início', href: '/operator' },
  { id: 'scanner', icon: QrCode, label: 'Scanner', href: '/scanner' },
  { id: 'alerts', icon: AlertTriangle, label: 'Alertas', href: '/alerts' },
  { id: 'shift', icon: ArrowRightLeft, label: 'Turno', href: '/shift-handover' },
];

const coordinatorPrimaryItems: NavItem[] = [
  { id: 'home', icon: Home, label: 'Dashboard', href: '/' },
  { id: 'calendar', icon: Calendar, label: 'Agenda', href: '/calendar/daily' },
  { id: 'kanban', icon: LayoutGrid, label: 'Kanban', href: '/kanban' },
  { id: 'alerts', icon: AlertTriangle, label: 'Alertas', href: '/alerts' },
];

const managerPrimaryItems: NavItem[] = [
  { id: 'home', icon: Home, label: 'Dashboard', href: '/' },
  { id: 'oee', icon: BarChart3, label: 'OEE', href: '/oee' },
  { id: 'calendar', icon: Calendar, label: 'Agenda', href: '/calendar/daily' },
  { id: 'alerts', icon: AlertTriangle, label: 'Alertas', href: '/alerts' },
];

// More menu items by role
const operatorMoreItems: NavItem[] = [
  { id: 'knowledge', icon: BookOpen, label: 'Base de Conhecimento', href: '/knowledge' },
  { id: 'notifications', icon: Bell, label: 'Notificações', href: '/notifications' },
  { id: 'install', icon: Download, label: 'Instalar App', href: '/install' },
];

const coordinatorMoreItems: NavItem[] = [
  { id: 'oee', icon: BarChart3, label: 'OEE', href: '/oee' },
  { id: 'tpm', icon: Wrench, label: 'TPM', href: '/tpm' },
  { id: 'scanner', icon: QrCode, label: 'QR Scanner', href: '/scanner' },
  { id: 'shift', icon: ArrowRightLeft, label: 'Passagem Turno', href: '/shift-handover' },
  { id: 'knowledge', icon: BookOpen, label: 'Base de Conhecimento', href: '/knowledge' },
  { id: 'notifications', icon: Bell, label: 'Notificações', href: '/notifications' },
  { id: 'settings', icon: Settings, label: 'Configurações', href: '/settings' },
];

const managerMoreItems: NavItem[] = [
  { id: 'tpm', icon: Wrench, label: 'TPM', href: '/tpm' },
  { id: 'kanban', icon: LayoutGrid, label: 'Kanban', href: '/kanban' },
  { id: 'knowledge', icon: BookOpen, label: 'Base de Conhecimento', href: '/knowledge' },
  { id: 'notifications', icon: Bell, label: 'Notificações', href: '/notifications' },
  { id: 'settings', icon: Settings, label: 'Configurações', href: '/settings' },
];

interface MobileNavButtonProps {
  item: NavItem;
  isActive: boolean;
  badge?: number;
  onClick: () => void;
}

const MobileNavButton = memo(function MobileNavButton({ 
  item, 
  isActive, 
  badge,
  onClick 
}: MobileNavButtonProps) {
  const Icon = item.icon;
  const { trigger } = useHapticFeedback();
  
  const handleClick = useCallback(() => {
    trigger('light');
    onClick();
  }, [trigger, onClick]);
  
  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative flex flex-col items-center justify-center flex-1 py-2 px-1 min-h-[60px]',
        'touch-target transition-all duration-200 ease-out',
        'active:scale-95',
        isActive
          ? 'text-primary'
          : 'text-muted-foreground active:text-foreground'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Active indicator pill */}
      {isActive && (
        <span 
          className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-primary animate-scale-in"
          aria-hidden="true"
        />
      )}
      
      <div className="relative mt-1">
        <Icon className={cn(
          'h-6 w-6 transition-all duration-200',
          isActive && 'scale-105'
        )} />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground shadow-sm">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className={cn(
        'text-[11px] mt-1.5 font-medium truncate max-w-full transition-all duration-200',
        isActive && 'font-semibold text-primary'
      )}>
        {item.label}
      </span>
    </button>
  );
});

function MoreMenuContent({ 
  items, 
  currentPath, 
  onNavigate,
  onClose 
}: { 
  items: NavItem[];
  currentPath: string;
  onNavigate: (href: string) => void;
  onClose: () => void;
}) {
  const { trigger } = useHapticFeedback();
  
  const handleNavigate = useCallback((href: string) => {
    trigger('light');
    onNavigate(href);
  }, [trigger, onNavigate]);
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with close button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-base font-semibold text-foreground">
          Mais opções
        </h3>
        <button
          onClick={onClose}
          className="p-2 -mr-2 rounded-full hover:bg-muted active:bg-muted/80 transition-colors"
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' 
              ? currentPath === '/' 
              : currentPath.startsWith(item.href);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.href)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl',
                  'touch-target transition-all duration-200',
                  'active:scale-[0.98]',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted active:bg-muted/80'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  isActive ? 'bg-primary/20' : 'bg-muted'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="flex-1 text-left font-medium">{item.label}</span>
                <ChevronRight className={cn(
                  'h-5 w-5 text-muted-foreground transition-transform',
                  isActive && 'text-primary'
                )} />
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

export function MobileNavigation() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile } = useDevice();
  const { role } = useAuth();
  const alertCount = useAlertCount();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { trigger } = useHapticFeedback();

  // Get items based on role
  const primaryItems = useMemo(() => {
    switch (role) {
      case 'operator':
        return operatorPrimaryItems;
      case 'manager':
        return managerPrimaryItems;
      case 'coordinator':
      default:
        return coordinatorPrimaryItems;
    }
  }, [role]);

  const moreItems = useMemo(() => {
    switch (role) {
      case 'operator':
        return operatorMoreItems;
      case 'manager':
        return managerMoreItems;
      case 'coordinator':
      default:
        return coordinatorMoreItems;
    }
  }, [role]);

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleNavigate = useCallback((href: string) => {
    navigate(href);
    setSheetOpen(false);
  }, [navigate]);

  const handleMoreClick = useCallback(() => {
    trigger('light');
    setSheetOpen(true);
  }, [trigger]);

  // Only render on mobile
  if (!isMobile) return null;

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-background/95 backdrop-blur-xl border-t border-border',
        'shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.3)]',
        'pb-safe'
      )}
      role="navigation"
      aria-label="Navegação principal mobile"
    >
      <div className="flex items-stretch justify-around max-w-md mx-auto">
        {primaryItems.map((item) => (
          <MobileNavButton
            key={item.id}
            item={item}
            isActive={isActive(item.href)}
            badge={item.id === 'alerts' ? alertCount : undefined}
            onClick={() => handleNavigate(item.href)}
          />
        ))}
        
        {/* More Menu Button */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button
              onClick={handleMoreClick}
              className={cn(
                'relative flex flex-col items-center justify-center flex-1 py-2 px-1 min-h-[60px]',
                'touch-target transition-all duration-200 ease-out',
                'active:scale-95',
                sheetOpen
                  ? 'text-primary'
                  : 'text-muted-foreground active:text-foreground'
              )}
            >
              <div className="relative mt-1">
                <Menu className={cn(
                  'h-6 w-6 transition-transform duration-200',
                  sheetOpen && 'rotate-90'
                )} />
              </div>
              <span className={cn(
                'text-[11px] mt-1.5 font-medium',
                sheetOpen && 'font-semibold text-primary'
              )}>
                Mais
              </span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[65vh] rounded-t-3xl p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu de navegação</SheetTitle>
            </SheetHeader>
            <MoreMenuContent 
              items={moreItems}
              currentPath={location.pathname}
              onNavigate={handleNavigate}
              onClose={() => setSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}

export default MobileNavigation;
