// ============= FOCUS TRAP - ACCESSIBILITY COMPONENT =============

import React, { useRef, useEffect, useCallback } from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  returnFocus?: boolean;
  className?: string;
}

/**
 * Focus Trap Component
 * Traps focus within a container for accessibility (modals, dialogs, etc.)
 */
export function FocusTrap({
  children,
  active = true,
  returnFocus = true,
  className,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Get all focusable elements within the container
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ];
    
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors.join(', '))
    );
  }, []);

  // Handle tab key navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!active || event.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab: Move focus backwards
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: Move focus forwards
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [active, getFocusableElements]);

  useEffect(() => {
    if (active) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement;
      
      // Focus the first focusable element
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      // Add event listener for tab navigation
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        
        // Return focus to the previously focused element
        if (returnFocus && previousActiveElement.current instanceof HTMLElement) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [active, getFocusableElements, handleKeyDown, returnFocus]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// ============= USE FOCUS MANAGEMENT HOOK =============

interface UseFocusManagementOptions {
  autoFocus?: boolean;
  restoreFocus?: boolean;
}

export function useFocusManagement(options: UseFocusManagementOptions = {}) {
  const { autoFocus = true, restoreFocus = true } = options;
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  const focusFirst = useCallback(() => {
    if (!containerRef.current) return;
    
    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, []);

  const focusLast = useCallback(() => {
    if (!containerRef.current) return;
    
    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, []);

  const restore = useCallback(() => {
    if (previousActiveElement.current instanceof HTMLElement) {
      previousActiveElement.current.focus();
    }
  }, []);

  useEffect(() => {
    previousActiveElement.current = document.activeElement;
    
    if (autoFocus) {
      focusFirst();
    }

    return () => {
      if (restoreFocus) {
        restore();
      }
    };
  }, [autoFocus, focusFirst, restore, restoreFocus]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    restore,
  };
}

// ============= FOCUS VISIBLE UTILITY =============

/**
 * Hook to detect keyboard vs mouse navigation
 * Returns true when user is using keyboard navigation
 */
export function useFocusVisible() {
  const [isKeyboardUser, setIsKeyboardUser] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isKeyboardUser;
}

export default FocusTrap;
