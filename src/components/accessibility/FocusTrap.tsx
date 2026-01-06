import React, { useEffect, useRef, useCallback, ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
  autoFocus?: boolean;
  returnFocus?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  finalFocus?: React.RefObject<HTMLElement>;
  onEscape?: () => void;
  className?: string;
  restoreFocus?: boolean;
}

// Get all focusable elements within a container
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors))
    .filter((el) => {
      // Check if element is visible
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
    });
}

export function FocusTrap({
  children,
  active = true,
  autoFocus = true,
  returnFocus = true,
  initialFocus,
  finalFocus,
  onEscape,
  className,
  restoreFocus = true,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the previously focused element
  useEffect(() => {
    if (active) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [active]);

  // Auto focus on mount
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const focusInitial = () => {
      if (initialFocus?.current) {
        initialFocus.current.focus();
      } else if (autoFocus) {
        const focusableElements = getFocusableElements(containerRef.current!);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(focusInitial, 10);
    return () => clearTimeout(timer);
  }, [active, autoFocus, initialFocus]);

  // Return focus on unmount
  useEffect(() => {
    return () => {
      if (returnFocus && restoreFocus && previousActiveElement.current) {
        const elementToFocus = finalFocus?.current || previousActiveElement.current;
        // Use requestAnimationFrame to ensure focus happens after cleanup
        requestAnimationFrame(() => {
          elementToFocus?.focus?.();
        });
      }
    };
  }, [returnFocus, restoreFocus, finalFocus]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!active || !containerRef.current) return;

      // Handle Escape
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Handle Tab
      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements(containerRef.current);
        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;

        // Shift + Tab
        if (event.shiftKey) {
          if (activeElement === firstElement || !containerRef.current.contains(activeElement)) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (activeElement === lastElement || !containerRef.current.contains(activeElement)) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [active, onEscape]
  );

  // Prevent focus from leaving the trap
  useEffect(() => {
    if (!active) return;

    const handleFocusIn = (event: FocusEvent) => {
      if (!containerRef.current) return;
      
      const target = event.target as HTMLElement;
      if (!containerRef.current.contains(target)) {
        event.preventDefault();
        const focusableElements = getFocusableElements(containerRef.current);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    };

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, [active]);

  if (!active) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={className}
      role="group"
      aria-modal="true"
    >
      {children}
    </div>
  );
}

// Hook version for more control
export function useFocusTrap(active = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (active) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    return () => {
      if (active && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [active]);

  const focusFirst = useCallback(() => {
    if (!containerRef.current) return;
    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, []);

  const focusLast = useCallback(() => {
    if (!containerRef.current) return;
    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, []);

  return {
    containerRef,
    focusFirst,
    focusLast,
  };
}

// Focus visible utility
export function FocusRing({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
        "focus-within:ring-offset-background rounded-lg",
        className
      )}
    >
      {children}
    </div>
  );
}

// Skip link for accessibility
export function SkipLink({ href = '#main-content', children = 'Pular para o conteúdo' }: { href?: string; children?: string }) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only",
        "fixed top-4 left-4 z-[9999]",
        "bg-primary text-primary-foreground",
        "px-4 py-2 rounded-lg font-medium",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      )}
    >
      {children}
    </a>
  );
}

// Roving focus for toolbar/menu patterns
interface RovingFocusProps {
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  className?: string;
}

export function RovingFocusGroup({
  children,
  orientation = 'horizontal',
  loop = true,
  className,
}: RovingFocusProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!containerRef.current) return;

      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length === 0) return;

      const isHorizontal = orientation === 'horizontal' || orientation === 'both';
      const isVertical = orientation === 'vertical' || orientation === 'both';

      let nextIndex = currentIndex;

      switch (event.key) {
        case 'ArrowRight':
          if (isHorizontal) {
            event.preventDefault();
            nextIndex = loop
              ? (currentIndex + 1) % focusableElements.length
              : Math.min(currentIndex + 1, focusableElements.length - 1);
          }
          break;
        case 'ArrowLeft':
          if (isHorizontal) {
            event.preventDefault();
            nextIndex = loop
              ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
              : Math.max(currentIndex - 1, 0);
          }
          break;
        case 'ArrowDown':
          if (isVertical) {
            event.preventDefault();
            nextIndex = loop
              ? (currentIndex + 1) % focusableElements.length
              : Math.min(currentIndex + 1, focusableElements.length - 1);
          }
          break;
        case 'ArrowUp':
          if (isVertical) {
            event.preventDefault();
            nextIndex = loop
              ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
              : Math.max(currentIndex - 1, 0);
          }
          break;
        case 'Home':
          event.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          nextIndex = focusableElements.length - 1;
          break;
        default:
          return;
      }

      setCurrentIndex(nextIndex);
      focusableElements[nextIndex]?.focus();
    },
    [currentIndex, orientation, loop]
  );

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      role="toolbar"
      aria-orientation={orientation === 'both' ? undefined : orientation}
      className={className}
    >
      {children}
    </div>
  );
}
