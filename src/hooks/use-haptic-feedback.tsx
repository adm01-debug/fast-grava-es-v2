import * as React from "react";

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

interface HapticOptions {
  enabled?: boolean;
}

interface HapticFeedback {
  trigger: (pattern?: HapticPattern) => void;
  isSupported: boolean;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

// Vibration patterns in milliseconds
const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  selection: 5,
  success: [10, 50, 10],
  warning: [30, 50, 30],
  error: [50, 100, 50, 100, 50],
};

export function useHapticFeedback(options: HapticOptions = {}): HapticFeedback {
  const { enabled: initialEnabled = true } = options;
  const [enabled, setEnabled] = React.useState(initialEnabled);

  const isSupported = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return 'vibrate' in navigator;
  }, []);

  const trigger = React.useCallback((pattern: HapticPattern = 'light') => {
    if (!enabled || !isSupported) return;

    try {
      const vibrationPattern = HAPTIC_PATTERNS[pattern];
      navigator.vibrate(vibrationPattern);
    } catch (error) {
      // Silently fail if vibration is not allowed
      // Haptic feedback not available - silent fail in production
    }
  }, [enabled, isSupported]);

  return {
    trigger,
    isSupported,
    enabled,
    setEnabled,
  };
}

// Hook for adding haptic feedback to button clicks
export function useHapticButton(pattern: HapticPattern = 'light') {
  const { trigger, isSupported, enabled } = useHapticFeedback();

  const onClick = React.useCallback((originalOnClick?: React.MouseEventHandler<HTMLButtonElement>) => {
    return (e: React.MouseEvent<HTMLButtonElement>) => {
      trigger(pattern);
      originalOnClick?.(e);
    };
  }, [pattern, trigger]);

  return {
    onClick,
    isSupported,
    enabled,
  };
}

// Higher-order component style hook for any interactive element
export function useHapticInteraction<T extends HTMLElement>(pattern: HapticPattern = 'light') {
  const { trigger } = useHapticFeedback();

  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleInteraction = () => {
      trigger(pattern);
    };

    element.addEventListener('touchstart', handleInteraction, { passive: true });
    element.addEventListener('click', handleInteraction);

    return () => {
      element.removeEventListener('touchstart', handleInteraction);
      element.removeEventListener('click', handleInteraction);
    };
  }, [pattern, trigger]);

  return ref;
}
