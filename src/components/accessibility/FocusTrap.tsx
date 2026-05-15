import * as React from "react";

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  returnFocus?: boolean;
}

export function FocusTrap({
  children,
  active = true,
  initialFocus,
  returnFocus = true,
}: FocusTrapProps): JSX.Element {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!active) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    if (initialFocus?.current) {
      initialFocus.current.focus();
    } else {
      const firstFocusable = getFocusableElements(containerRef.current)?.[0];
      firstFocusable?.focus();
    }

    return () => {
      if (returnFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, initialFocus, returnFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!active || e.key !== "Tab") return;

    const focusableElements = getFocusableElements(containerRef.current);
    if (!focusableElements?.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown} role="none">
      {children}
    </div>
  );
}

function getFocusableElements(container: HTMLElement | null): HTMLElement[] | null {
  if (!container) return null;

  const focusableSelectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  return Array.from(container.querySelectorAll(focusableSelectors));
}
