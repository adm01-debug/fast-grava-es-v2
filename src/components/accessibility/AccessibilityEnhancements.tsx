/**
 * Accessibility Enhancements - Sprint 2
 * 
 * This module provides enhanced accessibility utilities including:
 * - Improved focus indicators
 * - Screen reader announcements
 * - Keyboard navigation helpers
 * - Contrast-safe color utilities
 */

import { memo, useEffect, useRef, useState, createContext, useContext, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============ LIVE REGION FOR SCREEN READERS ============

interface LiveRegionContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const LiveRegionContext = createContext<LiveRegionContextType | null>(null);

export function useLiveAnnounce() {
  const context = useContext(LiveRegionContext);
  if (!context) {
    throw new Error('useLiveAnnounce must be used within LiveRegionProvider');
  }
  return context.announce;
}

interface LiveRegionProviderProps {
  children: ReactNode;
}

export function LiveRegionProvider({ children }: LiveRegionProviderProps) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  const politeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const assertiveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      if (assertiveTimeoutRef.current) clearTimeout(assertiveTimeoutRef.current);
      setAssertiveMessage(message);
      assertiveTimeoutRef.current = setTimeout(() => setAssertiveMessage(''), 1000);
    } else {
      if (politeTimeoutRef.current) clearTimeout(politeTimeoutRef.current);
      setPoliteMessage(message);
      politeTimeoutRef.current = setTimeout(() => setPoliteMessage(''), 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (politeTimeoutRef.current) clearTimeout(politeTimeoutRef.current);
      if (assertiveTimeoutRef.current) clearTimeout(assertiveTimeoutRef.current);
    };
  }, []);

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      {/* Polite announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      {/* Assertive announcements */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </LiveRegionContext.Provider>
  );
}

// ============ ENHANCED FOCUS RING ============

interface EnhancedFocusRingProps {
  children: ReactNode;
  className?: string;
  offset?: 'none' | 'small' | 'medium';
}

export const EnhancedFocusRing = memo(function EnhancedFocusRing({
  children,
  className,
  offset = 'small'
}: EnhancedFocusRingProps) {
  const offsetClasses = {
    none: 'focus-within:ring-offset-0',
    small: 'focus-within:ring-offset-2',
    medium: 'focus-within:ring-offset-4'
  };

  return (
    <div
      className={cn(
        "focus-within:ring-2 focus-within:ring-primary/70",
        "focus-within:ring-offset-background",
        "rounded-lg transition-shadow duration-fast",
        offsetClasses[offset],
        className
      )}
    >
      {children}
    </div>
  );
});

// ============ SKIP LINKS ============

interface SkipLinksProps {
  links?: Array<{ id: string; label: string }>;
}

export const SkipLinks = memo(function SkipLinks({ 
  links = [
    { id: 'main-content', label: 'Pular para conteúdo principal' },
    { id: 'navigation', label: 'Pular para navegação' },
  ] 
}: SkipLinksProps) {
  return (
    <nav aria-label="Skip links" className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:z-[100] focus-within:top-4 focus-within:left-4">
      <ul className="flex flex-col gap-2">
        {links.map(link => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              className={cn(
                "inline-flex items-center px-4 py-2 text-sm font-medium",
                "bg-primary text-primary-foreground rounded-md",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "shadow-lg"
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
});

// ============ KEYBOARD NAVIGATION HOOK ============

interface UseKeyboardListNavigationOptions {
  itemCount: number;
  onSelect?: (index: number) => void;
  loop?: boolean;
  orientation?: 'vertical' | 'horizontal' | 'grid';
  gridColumns?: number;
}

export function useKeyboardListNavigation({
  itemCount,
  onSelect,
  loop = true,
  orientation = 'vertical',
  gridColumns = 1
}: UseKeyboardListNavigationOptions) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    let newIndex = focusedIndex;
    const isGrid = orientation === 'grid';
    const isHorizontal = orientation === 'horizontal';
    
    switch (e.key) {
      case 'ArrowDown':
        if (!isHorizontal) {
          e.preventDefault();
          newIndex = isGrid 
            ? focusedIndex + gridColumns 
            : focusedIndex + 1;
        }
        break;
      case 'ArrowUp':
        if (!isHorizontal) {
          e.preventDefault();
          newIndex = isGrid 
            ? focusedIndex - gridColumns 
            : focusedIndex - 1;
        }
        break;
      case 'ArrowRight':
        if (isHorizontal || isGrid) {
          e.preventDefault();
          newIndex = focusedIndex + 1;
        }
        break;
      case 'ArrowLeft':
        if (isHorizontal || isGrid) {
          e.preventDefault();
          newIndex = focusedIndex - 1;
        }
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = itemCount - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect?.(focusedIndex);
        return;
      default:
        return;
    }

    // Handle bounds
    if (loop) {
      if (newIndex < 0) newIndex = itemCount - 1;
      if (newIndex >= itemCount) newIndex = 0;
    } else {
      newIndex = Math.max(0, Math.min(newIndex, itemCount - 1));
    }

    setFocusedIndex(newIndex);
  };

  const getItemProps = (index: number) => ({
    tabIndex: index === focusedIndex ? 0 : -1,
    'aria-selected': index === focusedIndex,
    onFocus: () => setFocusedIndex(index),
    onClick: () => {
      setFocusedIndex(index);
      onSelect?.(index);
    },
  });

  const getContainerProps = () => ({
    ref: containerRef,
    role: 'listbox' as const,
    onKeyDown: handleKeyDown,
    'aria-activedescendant': `item-${focusedIndex}`,
  });

  return {
    focusedIndex,
    setFocusedIndex,
    getItemProps,
    getContainerProps,
  };
}

// ============ CONTRAST-SAFE BADGE ============

interface ContrastSafeBadgeProps {
  children: ReactNode;
  variant: 'success' | 'warning' | 'error' | 'info' | 'default';
  className?: string;
}

const badgeVariants = {
  success: 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white',
  warning: 'bg-amber-600 text-white dark:bg-amber-500 dark:text-black',
  error: 'bg-red-600 text-white dark:bg-red-500 dark:text-white',
  info: 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white',
  default: 'bg-secondary text-secondary-foreground',
};

export const ContrastSafeBadge = memo(function ContrastSafeBadge({
  children,
  variant,
  className
}: ContrastSafeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
});

// ============ ACCESSIBLE LOADING SPINNER ============

interface AccessibleSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AccessibleSpinner = memo(function AccessibleSpinner({
  label = 'Carregando...',
  size = 'md',
  className
}: AccessibleSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <div 
      role="status" 
      aria-live="polite"
      className={cn("flex items-center gap-2", className)}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-primary border-t-transparent",
          sizeClasses[size]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
});

// ============ FOCUS TRAP HOOK ============

interface UseFocusTrapOptions {
  enabled?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
}

export function useEnhancedFocusTrap<T extends HTMLElement>({
  enabled = true,
  autoFocus = true,
  restoreFocus = true
}: UseFocusTrapOptions = {}) {
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement;

    // Get all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
        'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    };

    // Auto-focus first element
    if (autoFocus) {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }

    // Handle tab key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus
      if (restoreFocus && previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [enabled, autoFocus, restoreFocus]);

  return containerRef;
}

// ============ REDUCED MOTION HOOK ============

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// ============ EXPORT ALL ============

export { LiveRegionProvider as AccessibilityProvider };
