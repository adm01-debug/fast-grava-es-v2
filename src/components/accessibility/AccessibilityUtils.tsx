import * as React from "react";
import { cn } from "@/lib/utils";

// Re-export useFocusTrap from canonical location
export { useFocusTrap } from "@/hooks/use-focus-trap";

// Skip to content link
export function SkipToContent({ targetId = "main-content" }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
    >
      Pular para o conteúdo principal
    </a>
  );
}

// Live region for screen reader announcements
interface LiveRegionProps {
  message: string;
  type?: "polite" | "assertive";
  clearAfter?: number;
}

export function useLiveRegion() {
  const [announcement, setAnnouncement] = React.useState<LiveRegionProps | null>(null);

  const announce = React.useCallback((message: string, options?: Partial<LiveRegionProps>) => {
    setAnnouncement({
      message,
      type: options?.type || "polite",
      clearAfter: options?.clearAfter || 3000,
    });
  }, []);

  React.useEffect(() => {
    if (!announcement) return;

    const timer = setTimeout(() => {
      setAnnouncement(null);
    }, announcement.clearAfter);

    return () => clearTimeout(timer);
  }, [announcement]);

  const LiveRegionComponent = () => (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement?.type === "polite" ? announcement.message : ""}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement?.type === "assertive" ? announcement.message : ""}
      </div>
    </>
  );

  return { announce, LiveRegionComponent };
}

// Accessible icon button
interface AccessibleIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  size?: "sm" | "md" | "lg";
}

export function AccessibleIconButton({
  icon,
  label,
  size = "md",
  className,
  ...props
}: AccessibleIconButtonProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-md transition-colors",
        "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  );
}

// Reduced motion hook
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

// Keyboard navigation for lists
interface UseKeyboardNavigationOptions {
  itemCount: number;
  onSelect?: (index: number) => void;
  loop?: boolean;
  orientation?: "horizontal" | "vertical";
}

export function useKeyboardNavigation({
  itemCount,
  onSelect,
  loop = true,
  orientation = "vertical",
}: UseKeyboardNavigationOptions) {
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
      const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";

      if (e.key === nextKey) {
        e.preventDefault();
        setFocusedIndex((prev) => {
          if (prev >= itemCount - 1) return loop ? 0 : prev;
          return prev + 1;
        });
      } else if (e.key === prevKey) {
        e.preventDefault();
        setFocusedIndex((prev) => {
          if (prev <= 0) return loop ? itemCount - 1 : 0;
          return prev - 1;
        });
      } else if (e.key === "Home") {
        e.preventDefault();
        setFocusedIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setFocusedIndex(itemCount - 1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (focusedIndex >= 0) {
          onSelect?.(focusedIndex);
        }
      }
    },
    [itemCount, loop, orientation, focusedIndex, onSelect]
  );

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    getItemProps: (index: number) => ({
      tabIndex: index === focusedIndex ? 0 : -1,
      "aria-selected": index === focusedIndex,
    }),
  };
}

// Color contrast checker
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Simple luminance calculation for hex colors
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const toLinear = (c: number) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Check if contrast meets WCAG requirements
export function meetsContrastRequirement(
  ratio: number,
  level: "AA" | "AAA" = "AA",
  isLargeText = false
): boolean {
  if (level === "AAA") {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

// Visually hidden component (for screen readers only)
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

// Focus visible indicator
export function FocusRing({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background rounded-md",
        className
      )}
    >
      {children}
    </div>
  );
}
