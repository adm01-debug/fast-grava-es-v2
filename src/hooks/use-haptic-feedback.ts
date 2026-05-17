import { useCallback } from 'react';

/**
 * Hook to provide haptic feedback on compatible devices (mobile)
 */
export const useHapticFeedback = () => {
  const trigger = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    if (typeof window === 'undefined' || !window.navigator.vibrate) return;

    switch (type) {
      case 'light':
        window.navigator.vibrate(10);
        break;
      case 'medium':
        window.navigator.vibrate(20);
        break;
      case 'heavy':
        window.navigator.vibrate(50);
        break;
      case 'success':
        window.navigator.vibrate([10, 30, 10]);
        break;
      case 'warning':
        window.navigator.vibrate([20, 50, 20]);
        break;
      case 'error':
        window.navigator.vibrate([50, 100, 50, 100]);
        break;
    }
  }, []);

  return { trigger };
};
