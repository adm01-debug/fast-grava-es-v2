import * as React from "react";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { Loader2, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  disabled?: boolean;
  indicatorClassName?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
  disabled = false,
  indicatorClassName,
}: PullToRefreshProps) {
  const { ref, pulling, refreshing, pullDistance, progress } = usePullToRefresh<HTMLDivElement>({
    onRefresh,
    threshold,
    disabled,
  });

  const showIndicator = pulling || refreshing;
  const indicatorOpacity = Math.min(1, progress);
  const indicatorScale = 0.5 + progress * 0.5;
  const rotation = progress * 180;

  return (
    <div
      ref={ref}
      className={cn("relative overflow-auto momentum-scroll", className)}
    >
      {/* Pull to refresh indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center pointer-events-none z-10 transition-all duration-200",
          indicatorClassName
        )}
        style={{
          height: showIndicator ? Math.max(40, pullDistance) : 0,
          opacity: indicatorOpacity,
        }}
      >
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 backdrop-blur-sm"
          style={{
            transform: `scale(${indicatorScale}) rotate(${rotation}deg)`,
            transition: refreshing ? "none" : "transform 0.1s ease-out",
          }}
        >
          {refreshing ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <ArrowDown
              className={cn(
                "w-5 h-5 text-primary transition-transform",
                progress >= 1 && "text-success"
              )}
            />
          )}
        </div>
      </div>

      {/* Content with translate when pulling */}
      <div
        style={{
          transform: pulling ? `translateY(${pullDistance}px)` : "translateY(0)",
          transition: pulling ? "none" : "transform 0.2s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
