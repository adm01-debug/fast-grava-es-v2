import { memo, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Calendar, 
  LayoutGrid, 
  Bell, 
  User,
  Plus,
  BarChart3,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useAlertCount } from '@/hooks/useAlertCount';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';
import { useDevice } from '@/hooks/use-device';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const NavButton = memo(function NavButton({ 
  item, 
  isActive 
}: { 
  item: NavItem; 
  isActive: boolean;
}) {
  const { trigger } = useHapticFeedback();
  const Icon = item.icon;

  const handleClick = useCallback(() => {
    trigger('light');
  }, [trigger]);

  return (
    <Link 
      to={item.href}
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 relative",
        "min-w-[64px] py-2 px-3 rounded-xl transition-all duration-200",
        "touch-target",
        isActive 
          ? "text-primary" 
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div 
          layoutId="bottomNavIndicator"
          className="absolute inset-0 bg-primary/10 rounded-xl"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      
      {/* Icon with badge */}
      <div className="relative z-10">
        <Icon className={cn(
          "h-5 w-5 transition-transform duration-200",
          isActive && "scale-110"
        )} />
        
        {/* Badge */}
        {item.badge && item.badge > 0 && (
          <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold px-1">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </div>
      
      {/* Label */}
      <span className={cn(
        "text-[10px] font-medium z-10 transition-all duration-200",
        isActive && "font-semibold"
      )}>
        {item.label}
      </span>
    </Link>
  );
});

export function BottomNavigation() {
  const location = useLocation();
  const { role } = useAuth();
  const alertCount = useAlertCount();
  const { isMobile } = useDevice();

  // Only show on mobile
  if (!isMobile) return null;

  // Navigation items based on role
  const navItems: NavItem[] = useMemo(() => {
    const baseItems: NavItem[] = [
      { icon: Home, label: 'Home', href: '/' },
      { icon: Calendar, label: 'Agenda', href: '/calendar/daily' },
      { icon: LayoutGrid, label: 'Kanban', href: '/kanban' },
      { 
        icon: Bell, 
        label: 'Alertas', 
        href: '/alerts',
        badge: alertCount > 0 ? alertCount : undefined
      },
    ];

    // Add role-specific item
    if (role === 'operator') {
      baseItems.push({ icon: User, label: 'Operador', href: '/operator' });
    } else {
      baseItems.push({ icon: BarChart3, label: 'BI', href: '/bi' });
    }

    return baseItems;
  }, [role, alertCount]);

  const isActive = useCallback((href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  }, [location.pathname]);

  return (
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "bg-background/95 backdrop-blur-xl border-t border-border",
        "safe-area-bottom"
      )}
    >
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => (
          <NavButton 
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
          />
        ))}
      </div>
    </motion.nav>
  );
}

// Spacer component to prevent content from being hidden behind bottom nav
export function BottomNavSpacer() {
  const { isMobile } = useDevice();
  
  if (!isMobile) return null;
  
  return <div className="h-20 md:hidden" />;
}
