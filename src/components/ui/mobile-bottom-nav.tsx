import * as React from "react";
import { cn } from "@/lib/utils";
import { useDevice } from "@/hooks/use-device";

export interface MobileBottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: number | string;
}

export interface MobileBottomNavProps {
  items: MobileBottomNavItem[];
  activeId?: string;
  onItemClick?: (item: MobileBottomNavItem) => void;
  className?: string;
  showLabels?: boolean;
}

export function MobileBottomNav({
  items,
  activeId,
  onItemClick,
  className,
  showLabels = true,
}: MobileBottomNavProps) {
  const { isMobile } = useDevice();

  // Only render on mobile
  if (!isMobile) return null;

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-lg border-t border-border",
        "safe-area-bottom",
        className
      )}
    >
      <div className="flex items-stretch justify-around">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                item.onClick?.();
                onItemClick?.(item);
              }}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[56px]",
                "touch-target touch-active",
                "transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <span className={cn(
                  "transition-transform duration-200",
                  isActive && "scale-110"
                )}>
                  {Icon}
                </span>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "absolute -top-1 -right-1 min-w-[16px] h-4 px-1",
                      "flex items-center justify-center",
                      "text-[10px] font-medium rounded-full",
                      "bg-destructive text-destructive-foreground"
                    )}
                  >
                    {typeof item.badge === "number" && item.badge > 99
                      ? "99+"
                      : item.badge}
                  </span>
                )}
              </div>
              {showLabels && (
                <span
                  className={cn(
                    "text-[10px] mt-1 font-medium truncate max-w-full",
                    isActive && "font-semibold"
                  )}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// Spacer component to prevent content from being hidden behind the bottom nav
export function MobileBottomNavSpacer({ className }: { className?: string }) {
  const { isMobile } = useDevice();

  if (!isMobile) return null;

  return <div className={cn("h-[72px] safe-area-bottom", className)} />;
}
