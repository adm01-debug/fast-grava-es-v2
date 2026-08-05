import { useState, useRef, useCallback, useEffect } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
  hapticFeedback?: boolean;
}

interface UsePullToRefreshReturn<T extends HTMLElement> {
  ref: React.RefObject<T>;
  pulling: boolean;
  refreshing: boolean;
  pullDistance: number;
  progress: number;
}

export function usePullToRefresh<T extends HTMLElement = HTMLDivElement>({
  onRefresh,
  threshold = 80,
  disabled = false,
  hapticFeedback = false,
}: UsePullToRefreshOptions): UsePullToRefreshReturn<T> {
  const ref = useRef<T>(null);
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  const progress = Math.min(pullDistance / threshold, 1);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || refreshing) return;

    const element = ref.current;
    if (!element || element.scrollTop > 0) return;

    startYRef.current = e.touches[0].clientY;
    currentYRef.current = startYRef.current;
  }, [disabled, refreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || refreshing) return;

    const element = ref.current;
    if (!element || element.scrollTop > 0) return;

    currentYRef.current = e.touches[0].clientY;
    const distance = Math.max(0, currentYRef.current - startYRef.current);

    if (distance > 0) {
      setPulling(true);
      // Apply resistance
      const resistedDistance = distance * 0.5;
      setPullDistance(resistedDistance);

      // Haptic feedback when reaching threshold
      if (hapticFeedback && resistedDistance >= threshold && pullDistance < threshold) {
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
      }
    }
  }, [disabled, refreshing, threshold, pullDistance, hapticFeedback]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || refreshing) return;

    setPulling(false);

    if (pullDistance >= threshold) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }

    setPullDistance(0);
  }, [disabled, refreshing, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ref,
    pulling,
    refreshing,
    pullDistance,
    progress,
  };
}
