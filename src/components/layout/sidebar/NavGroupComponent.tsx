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
          "w-full justify-between gap-3 h-10 px-3 transition-all duration-300 group",
          "hover:bg-sidebar-muted/50 hover:text-sidebar-foreground hover:pl-4",
          "text-sidebar-foreground/70",
          hasActiveItem && "text-sidebar-foreground font-medium bg-sidebar-accent/30"
        )}
        aria-expanded={isOpen}
        aria-controls={`nav-group-${group.id}`}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110", hasActiveItem && "text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]")} />
          <span className="text-sm">{group.label}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </motion.div>
      </Button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div id={`nav-group-${group.id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="overflow-hidden">
            <div className="pl-4 space-y-0.5 border-l-2 border-border/30 ml-5">
              {itemsWithBadge.map(item => <NavButton key={item.href} item={item} collapsed={false} isMobile={isMobile} isActive={isActive(item.href)} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
