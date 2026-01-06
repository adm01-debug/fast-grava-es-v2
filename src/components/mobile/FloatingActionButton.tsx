import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  X, 
  Calendar, 
  QrCode, 
  FileText, 
  Zap,
  Search,
  ArrowRightLeft,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHapticFeedback } from '@/hooks/use-haptic-feedback';
import { useDevice } from '@/hooks/use-device';
import { useAuth } from '@/contexts/AuthContext';

interface FABAction {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  color?: string;
}

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { trigger } = useHapticFeedback();
  const { isMobile } = useDevice();
  const { role } = useAuth();

  // Hide on certain pages
  const hiddenPaths = ['/auth', '/scanner', '/kiosk'];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));
  
  if (shouldHide) return null;

  // Contextual actions based on current page and role
  const actions: FABAction[] = useMemo(() => {
    const baseActions: FABAction[] = [
      { 
        icon: Plus, 
        label: 'Novo Job', 
        href: '/new-job',
        color: 'bg-primary'
      },
    ];

    // Add contextual actions based on current page
    if (location.pathname === '/' || location.pathname.startsWith('/calendar')) {
      baseActions.push(
        { icon: Search, label: 'Buscar', onClick: () => {
          // Trigger command palette
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
          setIsOpen(false);
        }},
      );
    }

    if (role === 'operator') {
      baseActions.push(
        { icon: QrCode, label: 'Scanner', href: '/scanner' },
        { icon: ArrowRightLeft, label: 'Turno', href: '/shift-handover' },
      );
    } else {
      baseActions.push(
        { icon: Calendar, label: 'Agenda', href: '/calendar/daily' },
        { icon: LayoutGrid, label: 'Kanban', href: '/kanban' },
      );
    }

    return baseActions;
  }, [location.pathname, role]);

  const handleToggle = useCallback(() => {
    trigger('medium');
    setIsOpen(prev => !prev);
  }, [trigger]);

  const handleAction = useCallback((action: FABAction) => {
    trigger('light');
    setIsOpen(false);
    
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      navigate(action.href);
    }
  }, [navigate, trigger]);

  // Different positioning for mobile vs desktop
  const fabPosition = isMobile 
    ? "bottom-24 right-4" // Above bottom nav
    : "bottom-6 right-6";

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB Container */}
      <div className={cn("fixed z-50", fabPosition)}>
        {/* Action buttons */}
        <AnimatePresence>
          {isOpen && (
            <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-3 items-end mb-2">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.3, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      y: 0,
                      transition: { delay: index * 0.05 }
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.3, 
                      y: 20,
                      transition: { delay: (actions.length - index) * 0.03 }
                    }}
                    onClick={() => handleAction(action)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-full",
                      "bg-card border border-border shadow-lg",
                      "hover:bg-muted transition-colors",
                      "touch-target"
                    )}
                  >
                    <span className="text-sm font-medium whitespace-nowrap">
                      {action.label}
                    </span>
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      action.color || "bg-muted"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        action.color ? "text-primary-foreground" : "text-foreground"
                      )} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {/* Main FAB button */}
        <motion.button
          onClick={handleToggle}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center",
            "gradient-primary text-primary-foreground",
            "shadow-lg shadow-primary/25",
            "transition-all duration-300",
            isOpen && "rotate-45 bg-muted text-muted-foreground shadow-none"
          )}
          style={{
            boxShadow: isOpen ? undefined : 'var(--shadow-glow-primary)'
          }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Plus className="h-6 w-6" />
            )}
          </motion.div>
        </motion.button>
      </div>
    </>
  );
}
