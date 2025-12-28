import { memo, useMemo } from 'react';
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
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useAlertCount } from '@/hooks/useAlertCount';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  roles?: ('operator' | 'coordinator' | 'manager')[];
}

// Bottom nav items - most important for mobile
const primaryNavItems: NavItem[] = [
  { id: 'home', icon: Home, label: 'Dashboard', href: '/', roles: ['coordinator', 'manager'] },
  { id: 'calendar', icon: Calendar, label: 'Calendário', href: '/calendar/daily', roles: ['coordinator', 'manager'] },
  { id: 'kanban', icon: LayoutGrid, label: 'Kanban', href: '/kanban', roles: ['coordinator'] },
  { id: 'alerts', icon: AlertTriangle, label: 'Alertas', href: '/alerts' },
  { id: 'operator', icon: User, label: 'Operador', href: '/operator' },
];

// More menu items
const moreNavItems: NavItem[] = [
  { id: 'oee', icon: BarChart3, label: 'OEE', href: '/oee', roles: ['coordinator', 'manager'] },
  { id: 'tpm', icon: Wrench, label: 'TPM', href: '/tpm', roles: ['coordinator', 'manager'] },
  { id: 'scanner', icon: QrCode, label: 'QR Scanner', href: '/scanner' },
  { id: 'notifications', icon: Bell, label: 'Notificações', href: '/notifications' },
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
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center flex-1 py-2 px-1 min-h-[56px]',
        'touch-target transition-colors duration-200',
        isActive
          ? 'text-primary'
          : 'text-muted-foreground active:text-foreground'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="relative">
        <Icon className={cn(
          'h-5 w-5 transition-transform duration-200',
          isActive && 'scale-110'
        )} />
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-medium rounded-full bg-destructive text-destructive-foreground">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className={cn(
        'text-[10px] mt-1 font-medium truncate max-w-full',
        isActive && 'font-semibold'
      )}>
        {item.label}
      </span>
    </button>
  );
});

function MoreMenuContent({ 
  items, 
  currentPath, 
  onNavigate 
}: { 
  items: NavItem[];
  currentPath: string;
  onNavigate: (href: string) => void;
}) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">
          Mais opções
        </h3>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' 
            ? currentPath === '/' 
            : currentPath.startsWith(item.href);
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.href)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg',
                'touch-target transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground active:bg-muted'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}

export function MobileNavigation() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { role } = useAuth();
  const alertCount = useAlertCount();

  // Filter items by role
  const filteredPrimaryItems = useMemo(() => {
    return primaryNavItems.filter(item => {
      if (!item.roles) return true;
      if (!role) return false;
      return item.roles.includes(role as any);
    }).slice(0, 4); // Max 4 items + menu
  }, [role]);

  const filteredMoreItems = useMemo(() => {
    return moreNavItems.filter(item => {
      if (!item.roles) return true;
      if (!role) return false;
      return item.roles.includes(role as any);
    });
  }, [role]);

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const handleNavigate = (href: string) => {
    navigate(href);
  };

  // Only render on mobile
  if (!isMobile) return null;

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-background/95 backdrop-blur-lg border-t border-border',
          'safe-area-bottom'
        )}
        role="navigation"
        aria-label="Navegação principal mobile"
      >
        <div className="flex items-stretch justify-around">
          {filteredPrimaryItems.map((item) => (
            <MobileNavButton
              key={item.id}
              item={item}
              isActive={isActive(item.href)}
              badge={item.id === 'alerts' ? alertCount : undefined}
              onClick={() => handleNavigate(item.href)}
            />
          ))}
          
          {/* More Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className={cn(
                  'flex flex-col items-center justify-center flex-1 py-2 px-1 min-h-[56px]',
                  'touch-target transition-colors duration-200',
                  'text-muted-foreground active:text-foreground'
                )}
              >
                <Menu className="h-5 w-5" />
                <span className="text-[10px] mt-1 font-medium">Mais</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[50vh] rounded-t-2xl">
              <MoreMenuContent 
                items={filteredMoreItems}
                currentPath={location.pathname}
                onNavigate={handleNavigate}
              />
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-[72px] safe-area-bottom" />
    </>
  );
}

export default MobileNavigation;
