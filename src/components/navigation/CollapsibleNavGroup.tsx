import { useState, ReactNode, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

interface CollapsibleNavGroupProps {
  icon: React.ElementType;
  label: string;
  children: ReactNode;
  routes: string[]; // Routes that belong to this group
  defaultOpen?: boolean;
  collapsed?: boolean;
  isMobile?: boolean;
}

export const CollapsibleNavGroup = memo(function CollapsibleNavGroup({
  icon: Icon,
  label,
  children,
  routes,
  defaultOpen = false,
  collapsed = false,
  isMobile = false,
}: CollapsibleNavGroupProps) {
  const location = useLocation();
  const isActiveGroup = routes.some(route => 
    route === '/' 
      ? location.pathname === '/' 
      : location.pathname.startsWith(route)
  );
  
  const [isOpen, setIsOpen] = useState(defaultOpen || isActiveGroup);

  // In collapsed mode, don't render the group header
  if (collapsed && !isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full justify-between gap-3 h-10 px-3",
          "hover:bg-sidebar-muted/50 hover:text-sidebar-foreground",
          "text-sidebar-foreground/70",
          isActiveGroup && "text-sidebar-foreground font-medium"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn(
            "h-4 w-4 shrink-0",
            isActiveGroup && "text-primary"
          )} />
          <span className="text-sm">{label}</span>
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
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pl-4 space-y-0.5 border-l-2 border-border/50 ml-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
