import * as React from "react";
import { useHapticFeedback } from "./use-haptic-feedback";

export interface PullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number; // Pull distance to trigger refresh
  maxPull?: number; // Maximum pull distance
  disabled?: boolean;
  hapticFeedback?: boolean;
}

export interface PullToRefreshState {
  pulling: boolean;
  refreshing: boolean;
  pullDistance: number;
  progress: number; // 0-1 progress toward threshold
}

export function usePullToRefresh<T extends HTMLElement = HTMLElement>(
  options: PullToRefreshOptions
) {
  const {
    onRefresh,
    threshold = 80,
    maxPull = 150,
    disabled = false,
    hapticFeedback = true,
  } = options;

  const ref = React.useRef<T>(null);
  const { trigger } = useHapticFeedback();
  
  const [state, setState] = React.useState<PullToRefreshState>({
    pulling: false,
    refreshing: false,
    pullDistance: 0,
    progress: 0,
  });

  const startY = React.useRef<number | null>(null);
  const triggeredHaptic = React.useRef(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element || disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pull to refresh when at top of scrollable container
      if (element.scrollTop > 0) return;
      
      startY.current = e.touches[0].clientY;
      triggeredHaptic.current = false;
      setState(prev => ({ ...prev, pulling: true }));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === null || state.refreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      // Only track downward pulls
      if (diff < 0) {
        startY.current = null;
        setState(prev => ({ ...prev, pulling: false, pullDistance: 0, progress: 0 }));
        return;
      }

      // Apply resistance to pull (logarithmic)
      const resistedPull = Math.min(maxPull, diff * 0.5);
      const progress = Math.min(1, resistedPull / threshold);

      // Trigger haptic when reaching threshold
      if (hapticFeedback && progress >= 1 && !triggeredHaptic.current) {
        trigger('medium');
        triggeredHaptic.current = true;
      }

      // Prevent default scroll behavior when pulling
      if (element.scrollTop === 0 && diff > 0) {
        e.preventDefault();
      }

      setState(prev => ({
        ...prev,
        pullDistance: resistedPull,
        progress,
      }));
    };

    const handleTouchEnd = async () => {
      if (startY.current === null) return;
      startY.current = null;

      const { pullDistance } = state;

      if (pullDistance >= threshold && !state.refreshing) {
        setState(prev => ({ ...prev, refreshing: true, pulling: false }));
        
        if (hapticFeedback) {
          trigger('success');
        }

        try {
          await onRefresh();
        } catch (error) {
          console.error('Pull to refresh error:', error);
          if (hapticFeedback) {
            trigger('error');
          }
        }

        setState({
          pulling: false,
          refreshing: false,
          pullDistance: 0,
          progress: 0,
        });
      } else {
        setState({
          pulling: false,
          refreshing: false,
          pullDistance: 0,
          progress: 0,
        });
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [disabled, hapticFeedback, maxPull, onRefresh, state, threshold, trigger]);

  return { ref, ...state };
}
