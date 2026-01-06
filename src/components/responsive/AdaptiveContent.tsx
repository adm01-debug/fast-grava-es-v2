import * as React from "react";
import { cn } from "@/lib/utils";

// Breakpoint detection hook
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<"xs" | "sm" | "md" | "lg" | "xl" | "2xl">("md");

  React.useEffect(() => {
    const getBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) return "xs";
      if (width < 768) return "sm";
      if (width < 1024) return "md";
      if (width < 1280) return "lg";
      if (width < 1536) return "xl";
      return "2xl";
    };

    const handleResize = () => setBreakpoint(getBreakpoint());
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === "xs" || breakpoint === "sm",
    isTablet: breakpoint === "md",
    isDesktop: breakpoint === "lg" || breakpoint === "xl" || breakpoint === "2xl",
    isLargeDesktop: breakpoint === "xl" || breakpoint === "2xl",
  };
}

// Device detection
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = React.useState({
    hasTouch: false,
    hasMouse: true,
    hasReducedMotion: false,
    hasHighContrast: false,
    isStandalone: false,
    connectionType: "unknown" as string,
  });

  React.useEffect(() => {
    setCapabilities({
      hasTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
      hasMouse: window.matchMedia("(pointer: fine)").matches,
      hasReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      hasHighContrast: window.matchMedia("(prefers-contrast: high)").matches,
      isStandalone: window.matchMedia("(display-mode: standalone)").matches,
      connectionType: (navigator as any).connection?.effectiveType || "unknown",
    });
  }, []);

  return capabilities;
}

// Responsive container
interface ResponsiveContainerProps {
  children: React.ReactNode;
  mobileContent?: React.ReactNode;
  tabletContent?: React.ReactNode;
  className?: string;
}

export function ResponsiveContainer({
  children,
  mobileContent,
  tabletContent,
  className,
}: ResponsiveContainerProps) {
  const { isMobile, isTablet } = useBreakpoint();

  const content = React.useMemo(() => {
    if (isMobile && mobileContent) return mobileContent;
    if (isTablet && tabletContent) return tabletContent;
    return children;
  }, [isMobile, isTablet, mobileContent, tabletContent, children]);

  return <div className={className}>{content}</div>;
}

// Show/hide based on breakpoint
interface ShowProps {
  children: React.ReactNode;
  above?: "xs" | "sm" | "md" | "lg" | "xl";
  below?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  only?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

const breakpointOrder = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;

export function Show({ children, above, below, only }: ShowProps) {
  const { breakpoint } = useBreakpoint();

  const shouldShow = React.useMemo(() => {
    const currentIndex = breakpointOrder.indexOf(breakpoint);

    if (only) {
      return breakpoint === only;
    }

    if (above && below) {
      const aboveIndex = breakpointOrder.indexOf(above);
      const belowIndex = breakpointOrder.indexOf(below);
      return currentIndex > aboveIndex && currentIndex < belowIndex;
    }

    if (above) {
      const aboveIndex = breakpointOrder.indexOf(above);
      return currentIndex > aboveIndex;
    }

    if (below) {
      const belowIndex = breakpointOrder.indexOf(below);
      return currentIndex < belowIndex;
    }

    return true;
  }, [breakpoint, above, below, only]);

  if (!shouldShow) return null;
  return <>{children}</>;
}

// Touch-optimized wrapper
interface TouchOptimizedProps {
  children: React.ReactNode;
  className?: string;
  increaseTouchTarget?: boolean;
}

export function TouchOptimized({
  children,
  className,
  increaseTouchTarget = true,
}: TouchOptimizedProps) {
  const { hasTouch } = useDeviceCapabilities();

  return (
    <div
      className={cn(
        hasTouch && increaseTouchTarget && "min-h-[44px] min-w-[44px]",
        className
      )}
    >
      {children}
    </div>
  );
}

// Adaptive text that changes based on screen size
interface AdaptiveTextProps {
  short: string;
  medium?: string;
  full: string;
  className?: string;
}

export function AdaptiveText({ short, medium, full, className }: AdaptiveTextProps) {
  const { isMobile, isTablet } = useBreakpoint();

  const text = React.useMemo(() => {
    if (isMobile) return short;
    if (isTablet && medium) return medium;
    return full;
  }, [isMobile, isTablet, short, medium, full]);

  return <span className={className}>{text}</span>;
}

// Responsive grid that adapts columns
interface AdaptiveGridProps {
  children: React.ReactNode;
  mobileColumns?: number;
  tabletColumns?: number;
  desktopColumns?: number;
  gap?: number;
  className?: string;
}

export function AdaptiveGrid({
  children,
  mobileColumns = 1,
  tabletColumns = 2,
  desktopColumns = 4,
  gap = 4,
  className,
}: AdaptiveGridProps) {
  const { isMobile, isTablet } = useBreakpoint();

  const columns = isMobile ? mobileColumns : isTablet ? tabletColumns : desktopColumns;

  return (
    <div
      className={cn("grid", className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap * 0.25}rem`,
      }}
    >
      {children}
    </div>
  );
}

// Stack that changes direction based on screen size
interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: "row" | "column";
  mobileDirection?: "row" | "column";
  gap?: number;
  className?: string;
}

export function ResponsiveStack({
  children,
  direction = "row",
  mobileDirection = "column",
  gap = 4,
  className,
}: ResponsiveStackProps) {
  const { isMobile } = useBreakpoint();
  const currentDirection = isMobile ? mobileDirection : direction;

  return (
    <div
      className={cn("flex", className)}
      style={{
        flexDirection: currentDirection,
        gap: `${gap * 0.25}rem`,
      }}
    >
      {children}
    </div>
  );
}

// Safe area insets for notched devices
interface SafeAreaProps {
  children: React.ReactNode;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  className?: string;
}

export function SafeArea({
  children,
  top = false,
  bottom = false,
  left = false,
  right = false,
  className,
}: SafeAreaProps) {
  return (
    <div
      className={cn(className)}
      style={{
        paddingTop: top ? "env(safe-area-inset-top)" : undefined,
        paddingBottom: bottom ? "env(safe-area-inset-bottom)" : undefined,
        paddingLeft: left ? "env(safe-area-inset-left)" : undefined,
        paddingRight: right ? "env(safe-area-inset-right)" : undefined,
      }}
    >
      {children}
    </div>
  );
}

// Scroll container with touch optimization
interface ScrollContainerProps {
  children: React.ReactNode;
  direction?: "horizontal" | "vertical";
  snapType?: "none" | "mandatory" | "proximity";
  className?: string;
}

export function ScrollContainer({
  children,
  direction = "vertical",
  snapType = "none",
  className,
}: ScrollContainerProps) {
  return (
    <div
      className={cn(
        "overflow-auto overscroll-contain",
        direction === "horizontal" ? "overflow-x-auto overflow-y-hidden" : "overflow-y-auto overflow-x-hidden",
        snapType !== "none" && "snap-mandatory",
        direction === "horizontal" && snapType !== "none" && "snap-x",
        direction === "vertical" && snapType !== "none" && "snap-y",
        className
      )}
    >
      {children}
    </div>
  );
}
