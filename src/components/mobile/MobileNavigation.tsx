import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  LayoutDashboard, 
  ClipboardList, 
  Settings, 
  Plus,
  Search,
  Bell,
  User,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

interface MobileBottomNavProps {
  items?: NavItem[];
  className?: string;
}

const defaultNavItems: NavItem[] = [
  { id: 'home', label: 'Início', icon: <Home className="w-5 h-5" />, path: '/' },
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard' },
  { id: 'jobs', label: 'Jobs', icon: <ClipboardList className="w-5 h-5" />, path: '/jobs' },
  { id: 'settings', label: 'Config', icon: <Settings className="w-5 h-5" />, path: '/settings' },
];

export function MobileBottomNav({ 
  items = defaultNavItems,
  className 
}: MobileBottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : 100 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className={cn(
        "fixed bottom-0 inset-x-0 z-40 md:hidden",
        "bg-background/80 backdrop-blur-xl border-t",
        "safe-area-pb",
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-2 px-3 min-w-[64px]",
                "transition-colors duration-200",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 w-8 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                />
              )}
              
              {/* Icon with badge */}
              <div className="relative">
                <motion.div
                  animate={{ scale: active ? 1.1 : 1 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                >
                  {item.icon}
                </motion.div>
                
                {item.badge !== undefined && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </motion.span>
                )}
              </div>
              
              {/* Label */}
              <span className={cn(
                "text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}

// Floating Action Button
interface FABAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions?: FABAction[];
  mainIcon?: React.ReactNode;
  position?: 'left' | 'center' | 'right';
  className?: string;
}

export function FloatingActionButton({
  actions,
  mainIcon = <Plus className="w-6 h-6" />,
  position = 'right',
  className,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    left: 'left-4',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-4',
  };

  const handleMainClick = () => {
    if (actions && actions.length > 0) {
      setIsOpen(!isOpen);
    } else if (actions?.[0]) {
      actions[0].onClick();
    }
  };

  return (
    <div className={cn(
      "fixed bottom-20 z-30 md:bottom-6",
      positionClasses[position],
      className
    )}>
      <AnimatePresence>
        {isOpen && actions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 right-0 flex flex-col-reverse gap-3 items-end"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.5, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 group"
              >
                <span className="px-3 py-1.5 rounded-lg bg-popover text-popover-foreground text-sm font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {action.label}
                </span>
                <div
                  className={cn(
                    "w-12 h-12 rounded-full shadow-lg flex items-center justify-center",
                    "transition-transform active:scale-95",
                    action.color || "bg-secondary text-secondary-foreground"
                  )}
                >
                  {action.icon}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        onClick={handleMainClick}
        className={cn(
          "w-14 h-14 rounded-full shadow-xl flex items-center justify-center",
          "bg-primary text-primary-foreground",
          "transition-shadow hover:shadow-2xl",
          "active:shadow-lg"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : mainIcon}
      </motion.button>
    </div>
  );
}

// Smart Breadcrumbs
interface Breadcrumb {
  label: string;
  path?: string;
}

interface SmartBreadcrumbsProps {
  items: Breadcrumb[];
  className?: string;
}

export function SmartBreadcrumbs({ items, className }: SmartBreadcrumbsProps) {
  const navigate = useNavigate();
  
  // On mobile, show only last 2 items with collapse
  const displayItems = items.length > 2 
    ? [items[0], { label: '...', path: undefined }, items[items.length - 1]]
    : items;

  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm overflow-x-auto", className)}
    >
      {displayItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
          {item.path ? (
            <button
              onClick={() => navigate(item.path!)}
              className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[100px]"
            >
              {item.label}
            </button>
          ) : (
            <span className={cn(
              "truncate max-w-[150px]",
              index === displayItems.length - 1 
                ? "text-foreground font-medium" 
                : "text-muted-foreground"
            )}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// Page Header with back button
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backPath?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  backPath, 
  actions,
  className 
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={cn(
      "flex items-center justify-between gap-4 py-4",
      className
    )}>
      <div className="flex items-center gap-3 min-w-0">
        {backPath && (
          <button
            onClick={() => navigate(backPath)}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Voltar"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}

export default MobileBottomNav;
