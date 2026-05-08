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
        className={cn(
          'w-full justify-start gap-4 h-14 px-4 relative transition-all duration-300 group/nav rounded-2xl',
          'hover:bg-primary/[0.04] hover:text-primary active:scale-[0.98]',
          isActive && 'bg-primary/20 text-primary font-black shadow-[0_12px_40px_-6px_hsl(var(--primary)/0.3),inset_0_0_25px_hsl(var(--primary)/0.1)] ring-1 ring-primary/60 scale-[1.02]',
          !isActive && 'text-muted-foreground font-semibold',
          collapsed && !isMobile && 'justify-center px-0'
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0 transition-transform duration-200 group-hover/nav:scale-110', isActive && 'text-primary')} />
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
        <TooltipContent side="right" className="flex items-center gap-2 bg-card border-border">
          {item.label}
          {item.badge && <span className="gradient-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">{item.badge}</span>}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}));
NavButton.displayName = 'NavButton';
