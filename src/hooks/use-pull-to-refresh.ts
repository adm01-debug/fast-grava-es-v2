import { useRef, useState, useEffect, useCallback } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
  hapticFeedback?: boolean;
}

interface UsePullToRefreshReturn<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  pulling: boolean;
  refreshing: boolean;
  pullDistance: number;
  progress: number;
}

export function usePullToRefresh<T extends HTMLElement = HTMLDivElement>({
  onRefresh,
  threshold = 80,
  disabled = false,
  hapticFeedback = true,
}: UsePullToRefreshOptions): UsePullToRefreshReturn<T> {
  const ref = useRef<T>(null);
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);

  const progress = Math.min(pullDistance / threshold, 1);

  const triggerHaptic = useCallback((type: "light" | "medium" | "heavy" = "light") => {
    if (!hapticFeedback) return;
    
    if ("vibrate" in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
      };
      navigator.vibrate(patterns[type]);
    }
  }, [hapticFeedback]);

  useEffect(() => {
    if (disabled) return;

    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (element.scrollTop > 0) return;
      
      startY.current = e.touches[0].clientY;
      setPulling(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling || refreshing) return;
      if (element.scrollTop > 0) {
        setPulling(false);
        setPullDistance(0);
        return;
      }

      currentY.current = e.touches[0].clientY;
      const distance = Math.max(0, currentY.current - startY.current);
      
      // Apply resistance
      const resistedDistance = distance * 0.5;
      setPullDistance(resistedDistance);

      // Haptic feedback when crossing threshold
      if (resistedDistance >= threshold && pullDistance < threshold) {
        triggerHaptic("medium");
      }

      // Prevent scroll when pulling
      if (distance > 0) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = async () => {
      if (!pulling) return;

      if (pullDistance >= threshold && !refreshing) {
        setRefreshing(true);
        triggerHaptic("heavy");
        
        try {
          await onRefresh();
        } catch (error) {
          console.error("Refresh failed:", error);
        } finally {
          setRefreshing(false);
        }
      }

      setPulling(false);
      setPullDistance(0);
    };

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [disabled, pulling, refreshing, pullDistance, threshold, onRefresh, triggerHaptic]);

  return {
    ref,
    pulling,
    refreshing,
    pullDistance,
    progress,
  };
}
