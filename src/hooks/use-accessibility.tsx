import { useEffect, useRef, useState, useCallback } from 'react';

// ============================================
// SKIP LINK
// ============================================

export function useSkipLink(targetId: string = 'main-content') {
  const skipToContent = useCallback(() => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, [targetId]);

  return { skipToContent, targetId };
}

// ============================================
// FOCUS MANAGEMENT
// ============================================

export function useFocusReturn() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current && previousFocusRef.current.focus) {
      previousFocusRef.current.focus();
    }
  }, []);

  return { saveFocus, restoreFocus };
}

export function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return ref;
}

export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleFocus = () => {
      // Check if focus was triggered by keyboard
      if (document.body.classList.contains('focus-visible')) {
        setIsFocusVisible(true);
      }
    };

    const handleBlur = () => {
      setIsFocusVisible(false);
    };

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, []);

  return { ref, isFocusVisible };
}

// ============================================
// LIVE REGION (Announcements)
// ============================================

export function useLiveRegion(politeness: 'polite' | 'assertive' = 'polite') {
  const [message, setMessage] = useState('');

  const announce = useCallback((text: string) => {
    // Clear first to ensure re-announcement
    setMessage('');
    requestAnimationFrame(() => {
      setMessage(text);
    });
  }, []);

  const LiveRegion = useCallback(() => (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  ), [message, politeness]);

  return { announce, LiveRegion };
}

// ============================================
// REDUCED MOTION
// ============================================

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// ============================================
// HIGH CONTRAST
// ============================================

export function usePrefersHighContrast() {
  const [prefersHighContrast, setPrefersHighContrast] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-contrast: more)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
}

// ============================================
// SCREEN READER DETECTION
// ============================================

export function useScreenReader() {
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);

  useEffect(() => {
    // Heuristic detection based on common screen reader behaviors
    const checkScreenReader = () => {
      // Check for reduced motion (often enabled with screen readers)
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Check for high contrast
      const highContrast = window.matchMedia('(prefers-contrast: more)').matches;
      
      // If both are true, likely using a screen reader
      if (reducedMotion && highContrast) {
        setIsScreenReaderActive(true);
      }
    };

    checkScreenReader();
  }, []);

  return isScreenReaderActive;
}

// ============================================
// ROVING TAB INDEX
// ============================================

export function useRovingTabIndex<T extends HTMLElement>(
  items: T[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
  } = {}
) {
  const { orientation = 'horizontal', loop = true } = options;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const isHorizontal = orientation === 'horizontal' || orientation === 'both';
    const isVertical = orientation === 'vertical' || orientation === 'both';

    let nextIndex = index;

    switch (e.key) {
      case 'ArrowRight':
        if (isHorizontal) {
          e.preventDefault();
          nextIndex = index + 1;
        }
        break;
      case 'ArrowLeft':
        if (isHorizontal) {
          e.preventDefault();
          nextIndex = index - 1;
        }
        break;
      case 'ArrowDown':
        if (isVertical) {
          e.preventDefault();
          nextIndex = index + 1;
        }
        break;
      case 'ArrowUp':
        if (isVertical) {
          e.preventDefault();
          nextIndex = index - 1;
        }
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    if (loop) {
      if (nextIndex < 0) nextIndex = items.length - 1;
      if (nextIndex >= items.length) nextIndex = 0;
    } else {
      nextIndex = Math.max(0, Math.min(items.length - 1, nextIndex));
    }

    setActiveIndex(nextIndex);
    items[nextIndex]?.focus();
  }, [items, orientation, loop]);

  const getTabIndex = useCallback((index: number) => {
    return index === activeIndex ? 0 : -1;
  }, [activeIndex]);

  return { activeIndex, setActiveIndex, handleKeyDown, getTabIndex };
}

// ============================================
// ARIA EXPANDED
// ============================================

export function useAriaExpanded(initialExpanded = false) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const contentId = useRef(`content-${Math.random().toString(36).substr(2, 9)}`);

  const toggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const triggerProps = {
    'aria-expanded': isExpanded,
    'aria-controls': contentId.current,
    onClick: toggle
  };

  const contentProps = {
    id: contentId.current,
    role: 'region' as const,
    hidden: !isExpanded
  };

  return { isExpanded, setIsExpanded, toggle, triggerProps, contentProps };
}

// ============================================
// ARIA DESCRIBEDBY
// ============================================

export function useAriaDescribedBy() {
  const descriptionId = useRef(`description-${Math.random().toString(36).substr(2, 9)}`);
  const errorId = useRef(`error-${Math.random().toString(36).substr(2, 9)}`);
  const hintId = useRef(`hint-${Math.random().toString(36).substr(2, 9)}`);

  const getDescribedBy = useCallback((options: {
    hasDescription?: boolean;
    hasError?: boolean;
    hasHint?: boolean;
  }) => {
    const ids: string[] = [];
    if (options.hasDescription) ids.push(descriptionId.current);
    if (options.hasError) ids.push(errorId.current);
    if (options.hasHint) ids.push(hintId.current);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }, []);

  return {
    descriptionId: descriptionId.current,
    errorId: errorId.current,
    hintId: hintId.current,
    getDescribedBy
  };
}

// ============================================
// KEYBOARD ONLY FOCUS
// ============================================

export function useKeyboardOnlyFocus() {
  useEffect(() => {
    const handleMouseDown = () => {
      document.body.classList.remove('focus-visible');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('focus-visible');
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}

// ============================================
// HEADING LEVEL CONTEXT
// ============================================

export function useHeadingLevel(baseLevel: 1 | 2 | 3 | 4 | 5 | 6 = 2) {
  const [level, setLevel] = useState(baseLevel);

  const HeadingComponent = useCallback(({ children, className }: { children: React.ReactNode; className?: string }) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    return <Tag className={className}>{children}</Tag>;
  }, [level]);

  const incrementLevel = useCallback(() => {
    setLevel(prev => Math.min(6, prev + 1) as typeof baseLevel);
  }, []);

  const decrementLevel = useCallback(() => {
    setLevel(prev => Math.max(1, prev - 1) as typeof baseLevel);
  }, []);

  return { level, HeadingComponent, incrementLevel, decrementLevel, setLevel };
}

// ============================================
// INERT
// ============================================

export function useInert(inert: boolean) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (inert) {
      element.setAttribute('inert', '');
      element.setAttribute('aria-hidden', 'true');
    } else {
      element.removeAttribute('inert');
      element.removeAttribute('aria-hidden');
    }

    return () => {
      element.removeAttribute('inert');
      element.removeAttribute('aria-hidden');
    };
  }, [inert]);

  return ref;
}

// ============================================
// FORM ACCESSIBILITY
// ============================================

interface FormFieldA11yOptions {
  id?: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

export function useFormFieldA11y(options: FormFieldA11yOptions) {
  const fieldId = options.id || `field-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const describedBy = [
    options.hint && hintId,
    options.error && errorId
  ].filter(Boolean).join(' ') || undefined;

  const labelProps = {
    htmlFor: fieldId
  };

  const inputProps = {
    id: fieldId,
    'aria-required': options.required,
    'aria-invalid': !!options.error,
    'aria-describedby': describedBy
  };

  const errorProps = {
    id: errorId,
    role: 'alert' as const,
    'aria-live': 'polite' as const
  };

  const hintProps = {
    id: hintId
  };

  return { fieldId, labelProps, inputProps, errorProps, hintProps };
}
