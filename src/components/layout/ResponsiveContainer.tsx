import { ReactNode, memo } from 'react';
import { cn } from '@/lib/utils';
import { useDevice } from '@/hooks/use-device';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  /** Maximum width variant */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Add padding for mobile navigation */
  withMobileNav?: boolean;
  /** Add padding for mobile header */
  withMobileHeader?: boolean;
  /** Use full bleed on mobile (negative margin) */
  fullBleedMobile?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

/**
 * Responsive container that handles common layout patterns
 * - Proper padding for mobile/tablet/desktop
 * - Safe area support for notch devices
 * - Mobile navigation spacing
 */
export const ResponsiveContainer = memo(function ResponsiveContainer({
  children,
  className,
  maxWidth = 'xl',
  withMobileNav = false,
  withMobileHeader = false,
  fullBleedMobile = false,
}: ResponsiveContainerProps) {
  const { isMobile } = useDevice();

  return (
    <div
      className={cn(
        // Base container
        'w-full mx-auto',
        maxWidthClasses[maxWidth],
        // Responsive horizontal padding
        'px-4 sm:px-6 lg:px-8',
        // Mobile header padding
        withMobileHeader && 'pt-16 md:pt-0',
        // Mobile nav padding
        withMobileNav && 'pb-24 md:pb-0',
        // Full bleed on mobile
        fullBleedMobile && '-mx-4 px-4 sm:mx-0 sm:px-6',
        className
      )}
    >
      {children}
    </div>
  );
});

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  /** Grid variant */
  variant?: 'cards' | 'stats' | 'dashboard' | 'two-column' | 'three-column';
  /** Gap size */
  gap?: 'sm' | 'md' | 'lg';
}

const gridVariantClasses = {
  cards: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  stats: 'grid grid-cols-2 md:grid-cols-4',
  dashboard: 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
  'two-column': 'grid grid-cols-1 md:grid-cols-2',
  'three-column': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
};

/**
 * Responsive grid layout component
 */
export const ResponsiveGrid = memo(function ResponsiveGrid({
  children,
  className,
  variant = 'cards',
  gap = 'md',
}: ResponsiveGridProps) {
  return (
    <div
      className={cn(
        gridVariantClasses[variant],
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
});

interface ResponsiveStackProps {
  children: ReactNode;
  className?: string;
  /** Direction on mobile */
  mobileDirection?: 'column' | 'row';
  /** Direction on desktop */
  desktopDirection?: 'column' | 'row';
  /** Gap size */
  gap?: 'sm' | 'md' | 'lg';
  /** Alignment */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Justify content */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

/**
 * Responsive stack that changes direction based on breakpoint
 */
export const ResponsiveStack = memo(function ResponsiveStack({
  children,
  className,
  mobileDirection = 'column',
  desktopDirection = 'row',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
}: ResponsiveStackProps) {
  const mobileClass = mobileDirection === 'column' ? 'flex-col' : 'flex-row';
  const desktopClass = desktopDirection === 'column' ? 'md:flex-col' : 'md:flex-row';

  return (
    <div
      className={cn(
        'flex',
        mobileClass,
        desktopClass,
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
});

interface HideOnProps {
  children: ReactNode;
  /** Hide on mobile (< 768px) */
  mobile?: boolean;
  /** Hide on tablet (768px - 1024px) */
  tablet?: boolean;
  /** Hide on desktop (> 1024px) */
  desktop?: boolean;
  className?: string;
}

/**
 * Conditionally hide content based on breakpoints
 */
export function HideOn({
  children,
  mobile = false,
  tablet = false,
  desktop = false,
  className,
}: HideOnProps) {
  return (
    <div
      className={cn(
        mobile && 'hidden md:block',
        tablet && 'md:hidden lg:block',
        desktop && 'lg:hidden',
        className
      )}
    >
      {children}
    </div>
  );
}

interface ShowOnProps {
  children: ReactNode;
  /** Show only on mobile (< 768px) */
  mobile?: boolean;
  /** Show only on tablet (768px - 1024px) */
  tablet?: boolean;
  /** Show only on desktop (> 1024px) */
  desktop?: boolean;
  className?: string;
}

/**
 * Conditionally show content based on breakpoints
 */
export function ShowOn({
  children,
  mobile = false,
  tablet = false,
  desktop = false,
  className,
}: ShowOnProps) {
  return (
    <div
      className={cn(
        mobile && 'block md:hidden',
        tablet && 'hidden md:block lg:hidden',
        desktop && 'hidden lg:block',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Mobile-only component wrapper
 */
export function MobileOnly({ children, className }: { children: ReactNode; className?: string }) {
  return <ShowOn mobile className={className}>{children}</ShowOn>;
}

/**
 * Desktop-only component wrapper
 */
export function DesktopOnly({ children, className }: { children: ReactNode; className?: string }) {
  return <ShowOn desktop className={className}>{children}</ShowOn>;
}

/**
 * Tablet and up component wrapper
 */
export function TabletUp({ children, className }: { children: ReactNode; className?: string }) {
  return <HideOn mobile className={className}>{children}</HideOn>;
}
