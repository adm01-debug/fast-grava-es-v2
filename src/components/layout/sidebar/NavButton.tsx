import React, { useCallback, memo, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { prefetchRoute } from '@/lib/prefetch';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

interface NavButtonProps {
  item: NavItem;
  collapsed: boolean;
  isMobile: boolean;
  isActive: boolean;
}

export const NavButton = memo(forwardRef<HTMLDivElement, NavButtonProps>(function NavButton({ item, collapsed, isMobile, isActive }, ref) {
  const Icon = item.icon;

  const handlePrefetch = useCallback(() => {
    prefetchRoute(item.href);
  }, [item.href]);

  const button = (
    <Link to={item.href} className="block" onMouseEnter={handlePrefetch} onFocus={handlePrefetch}>
      <Button
        variant="ghost"
        aria-label={item.label}
        className={cn(
          'w-full justify-start gap-3 h-11 px-3 relative transition-all duration-300 group/nav',
          'hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:pl-4 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
          isActive && [
            'bg-sidebar-accent/80 text-primary font-bold border-l-4 border-primary shadow-sm',
            'shadow-[inset_0_0_20px_hsl(var(--primary)/0.05),0_0_15px_hsl(var(--primary)/0.1)]',
            'hover:pl-4',
          ],
          !isActive && 'border-l-4 border-transparent',
          collapsed && !isMobile && 'justify-center px-0 hover:pl-0'
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0 transition-all duration-300 group-hover/nav:scale-125 group-hover/nav:rotate-3 group-hover/nav:text-primary', isActive && 'text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]')} />
        {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
        {(!collapsed || isMobile) && item.badge && (
          <span className="ml-auto gradient-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full animate-pulse-glow">{item.badge}</span>
        )}
        {(collapsed && !isMobile) && item.badge && (
          <span className="absolute -top-1 -right-1 gradient-primary text-primary-foreground text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">{item.badge}</span>
        )}
      </Button>
    </Link>
  );

  if (collapsed && !isMobile) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2 bg-card/90 backdrop-blur-md border-border">
          {item.label}
          {item.badge && <span className="gradient-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">{item.badge}</span>}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}));
NavButton.displayName = 'NavButton';
