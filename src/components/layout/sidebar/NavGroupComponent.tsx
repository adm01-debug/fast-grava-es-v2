import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NavButton, NavItem } from './NavButton';

export interface NavGroup {
  id: string;
  icon: React.ElementType;
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

interface NavGroupComponentProps {
  group: NavGroup;
  collapsed: boolean;
  isMobile: boolean;
  isActive: (href: string) => boolean;
  alertCount: number;
  openGroups: string[];
  toggleGroup: (id: string) => void;
}

export const NavGroupComponent = memo(function NavGroupComponent({
  group, collapsed, isMobile, isActive, alertCount, openGroups, toggleGroup,
}: NavGroupComponentProps) {
  const Icon = group.icon;
  const isOpen = openGroups.includes(group.id);
  const hasActiveItem = group.items.some(item => isActive(item.href));

  const itemsWithBadge = group.items.map(item => ({
    ...item,
    badge: item.href === '/alerts' && alertCount > 0 ? alertCount : undefined
  }));

  if (collapsed && !isMobile) {
    return <>{itemsWithBadge.map(item => <NavButton key={item.href} item={item} collapsed={collapsed} isMobile={isMobile} isActive={isActive(item.href)} />)}</>;
  }

  if (group.items.length === 1) {
    return <NavButton item={itemsWithBadge[0]} collapsed={collapsed} isMobile={isMobile} isActive={isActive(itemsWithBadge[0].href)} />;
  }

  return (
    <div className="space-y-0.5">
      <Button
        variant="ghost"
        onClick={() => toggleGroup(group.id)}
        className={cn(
          "w-full justify-between gap-4 h-14 px-5 rounded-2xl transition-all duration-300", 
          "hover:bg-primary/[0.06] hover:text-primary", 
          "text-muted-foreground/90 font-semibold", 
          hasActiveItem && "text-primary font-black bg-primary/[0.04] ring-1 ring-primary/10"
        )}
        aria-expanded={isOpen}
        aria-controls={`nav-group-${group.id}`}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("h-5 w-5 shrink-0 transition-transform duration-300", hasActiveItem && "text-primary")} />
          <span className="text-sm tracking-tight">{group.label}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </motion.div>
      </Button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div id={`nav-group-${group.id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="overflow-hidden">
            <div className="pl-6 space-y-1.5 border-l-2 border-primary/10 ml-7 py-3">
              {itemsWithBadge.map(item => <NavButton key={item.href} item={item} collapsed={false} isMobile={isMobile} isActive={isActive(item.href)} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
