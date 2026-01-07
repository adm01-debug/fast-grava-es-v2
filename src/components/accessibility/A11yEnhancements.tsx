import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// ACCESSIBILITY CONTEXT & PROVIDER
// ============================================

interface A11yContextType {
  reduceMotion: boolean;
  highContrast: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  setHighContrast: (value: boolean) => void;
  setFontSize: (value: 'normal' | 'large' | 'xlarge') => void;
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
}

const A11yContext = createContext<A11yContextType | null>(null);

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [announcement, setAnnouncement] = useState<{ message: string; priority: 'polite' | 'assertive' } | null>(null);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Detect prefers-contrast
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    if (mediaQuery.matches) setHighContrast(true);

    const handler = (e: MediaQueryListEvent) => setHighContrast(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Apply font size to document
  useEffect(() => {
    const sizes = { normal: '16px', large: '18px', xlarge: '20px' };
    document.documentElement.style.fontSize = sizes[fontSize];
  }, [fontSize]);

  // Apply high contrast
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  // Apply reduce motion
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);

  const announceMessage = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement({ message, priority });
    // Clear after announcement
    setTimeout(() => setAnnouncement(null), 1000);
  }, []);

  return (
    <A11yContext.Provider value={{
      reduceMotion,
      highContrast,
      fontSize,
      setHighContrast,
      setFontSize,
      announceMessage,
    }}>
      {children}
      
      {/* Live Regions for Screen Readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement?.priority === 'polite' && announcement.message}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement?.priority === 'assertive' && announcement.message}
      </div>
    </A11yContext.Provider>
  );
}

export function useA11y() {
  const context = useContext(A11yContext);
  if (!context) {
    throw new Error('useA11y must be used within A11yProvider');
  }
  return context;
}

// ============================================
// SKIP LINKS
// ============================================

interface SkipLink {
  id: string;
  label: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
}

export function SkipLinks({ 
  links = [
    { id: 'main-content', label: 'Pular para conteúdo principal' },
    { id: 'main-nav', label: 'Pular para navegação' },
  ]
}: SkipLinksProps) {
  return (
    <nav aria-label="Links de navegação rápida" className="sr-only focus-within:not-sr-only">
      <ul className="fixed top-0 left-0 z-[9999] flex gap-2 p-2 bg-background">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              className={cn(
                "block px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground font-medium",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "sr-only focus:not-sr-only"
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ============================================
// FOCUS TRAP
// ============================================

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  restoreFocus?: boolean;
}

export function FocusTrap({ children, active = true, restoreFocus = true }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (active) {
      previousFocus.current = document.activeElement as HTMLElement;
      
      // Focus first focusable element
      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements?.length) {
        (focusableElements[0] as HTMLElement).focus();
      }

      return () => {
        if (restoreFocus && previousFocus.current) {
          previousFocus.current.focus();
        }
      };
    }
  }, [active, restoreFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!active || e.key !== 'Tab') return;

    const focusableElements = containerRef.current?.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements?.length) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}

// ============================================
// ACCESSIBLE ICON BUTTON
// ============================================

interface AccessibleIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  showLabel?: boolean;
}

export function AccessibleIconButton({
  icon,
  label,
  showLabel = false,
  className,
  ...props
}: AccessibleIconButtonProps) {
  return (
    <button
      {...props}
      aria-label={!showLabel ? label : undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "min-w-[44px] min-h-[44px]", // WCAG 2.2 Target Size
        "rounded-lg transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "hover:bg-muted active:bg-muted/80",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {icon}
      {showLabel && <span>{label}</span>}
    </button>
  );
}

// ============================================
// VISUALLY HIDDEN
// ============================================

export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

// ============================================
// ACCESSIBLE TABLE
// ============================================

interface AccessibleTableProps {
  caption: string;
  headers: string[];
  rows: (string | React.ReactNode)[][];
  className?: string;
}

export function AccessibleTable({ caption, headers, rows, className }: AccessibleTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)} role="region" aria-label={caption}>
      <table className="w-full border-collapse">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b">
            {headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-4 py-3 text-left font-semibold text-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              className="border-b hover:bg-muted/50 transition-colors"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-3"
                  // First cell is row header
                  {...(cellIndex === 0 ? { scope: 'row' as const } : {})}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// KEYBOARD NAVIGATION HOOK
// ============================================

interface UseRovingTabIndexOptions {
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
}

export function useRovingTabIndex(
  itemCount: number,
  options: UseRovingTabIndexOptions = {}
) {
  const { orientation = 'vertical', loop = true } = options;
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    let newIndex = index;

    const isNext = 
      (orientation !== 'horizontal' && e.key === 'ArrowDown') ||
      (orientation !== 'vertical' && e.key === 'ArrowRight');
    
    const isPrev = 
      (orientation !== 'horizontal' && e.key === 'ArrowUp') ||
      (orientation !== 'vertical' && e.key === 'ArrowLeft');

    if (isNext) {
      e.preventDefault();
      newIndex = loop 
        ? (index + 1) % itemCount 
        : Math.min(index + 1, itemCount - 1);
    } else if (isPrev) {
      e.preventDefault();
      newIndex = loop 
        ? (index - 1 + itemCount) % itemCount 
        : Math.max(index - 1, 0);
    } else if (e.key === 'Home') {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      newIndex = itemCount - 1;
    }

    if (newIndex !== index) {
      setFocusedIndex(newIndex);
    }
  }, [itemCount, orientation, loop]);

  const getTabIndex = useCallback((index: number) => {
    return index === focusedIndex ? 0 : -1;
  }, [focusedIndex]);

  return { focusedIndex, setFocusedIndex, handleKeyDown, getTabIndex };
}

// ============================================
// REDUCED MOTION WRAPPER
// ============================================

interface ReducedMotionProps {
  children: React.ReactNode;
  reducedChild?: React.ReactNode;
}

export function ReducedMotion({ children, reducedChild }: ReducedMotionProps) {
  const { reduceMotion } = useA11y();
  return <>{reduceMotion && reducedChild ? reducedChild : children}</>;
}

// ============================================
// ACCESSIBLE PROGRESS
// ============================================

interface AccessibleProgressProps {
  value: number;
  max?: number;
  label: string;
  showLabel?: boolean;
  className?: string;
}

export function AccessibleProgress({
  value,
  max = 100,
  label,
  showLabel = false,
  className,
}: AccessibleProgressProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span className="text-muted-foreground">{percentage}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={!showLabel ? `${label}: ${percentage}%` : undefined}
        className="h-2 rounded-full bg-muted overflow-hidden"
      >
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// CSS UTILITIES FOR HIGH CONTRAST & REDUCED MOTION
// ============================================

// Add these to your global CSS:
/*
.high-contrast {
  --contrast-boost: 1.2;
}

.high-contrast * {
  border-color: currentColor !important;
}

.reduce-motion *,
.reduce-motion *::before,
.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
*/

export default A11yProvider;
