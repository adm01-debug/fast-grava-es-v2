import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================
// ACCESSIBILITY SKIP LINKS
// Links de navegação rápida para acessibilidade
// ============================================

interface SkipLink {
  id: string;
  label: string;
  target: string;
}

const DEFAULT_SKIP_LINKS: SkipLink[] = [
  { id: "skip-main", label: "Ir para conteúdo principal", target: "#main-content" },
  { id: "skip-nav", label: "Ir para navegação", target: "#main-navigation" },
  { id: "skip-search", label: "Ir para busca", target: "#search-input" },
];

interface SkipLinksProps {
  links?: SkipLink[];
  className?: string;
}

export function SkipLinks({ links = DEFAULT_SKIP_LINKS, className }: SkipLinksProps) {
  return (
    <div className={cn("sr-only focus-within:not-sr-only", className)}>
      <nav aria-label="Links de atalho" className="fixed top-0 left-0 z-[200] p-2">
        <ul className="flex flex-col gap-1">
          {links.map((link) => (
            <li key={link.id}>
              <a
                href={link.target}
                className={cn(
                  "block px-4 py-2 rounded-md",
                  "bg-primary text-primary-foreground",
                  "font-medium text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  "transform -translate-y-full focus:translate-y-0",
                  "transition-transform duration-200"
                )}
                onClick={(e) => {
                  const target = document.querySelector(link.target);
                  if (target) {
                    e.preventDefault();
                    (target as HTMLElement).focus();
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

// ============================================
// MAIN CONTENT WRAPPER
// Wrapper que adiciona ID e role para acessibilidade
// ============================================

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function MainContent({ children, className, id = "main-content" }: MainContentProps) {
  return (
    <div
      id={id}
      tabIndex={-1}
      className={cn("outline-none flex-1", className)}
    >
      {children}
    </div>
  );
}

// ============================================
// LIVE REGION PROVIDER
// Provider para anúncios de screen reader
// ============================================

interface LiveRegionContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const LiveRegionContext = React.createContext<LiveRegionContextType | null>(null);

export function useLiveAnnounce() {
  const context = React.useContext(LiveRegionContext);
  if (!context) {
    // Return a no-op if not in provider
    return (_message: string, _priority?: 'polite' | 'assertive') => {
      // no-op outside provider
    };
  }
  return context.announce;
}

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [politeMessage, setPoliteMessage] = React.useState('');
  const [assertiveMessage, setAssertiveMessage] = React.useState('');
  const politeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const assertiveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const announce = React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      if (assertiveTimeoutRef.current) clearTimeout(assertiveTimeoutRef.current);
      setAssertiveMessage(message);
      assertiveTimeoutRef.current = setTimeout(() => setAssertiveMessage(''), 1000);
    } else {
      if (politeTimeoutRef.current) clearTimeout(politeTimeoutRef.current);
      setPoliteMessage(message);
      politeTimeoutRef.current = setTimeout(() => setPoliteMessage(''), 1000);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (politeTimeoutRef.current) clearTimeout(politeTimeoutRef.current);
      if (assertiveTimeoutRef.current) clearTimeout(assertiveTimeoutRef.current);
    };
  }, []);

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
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

// ============================================
// FOCUS TRAP
// Mantém foco dentro de um container (para modais)
// ============================================

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
}: FocusTrapProps) {
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
    <div ref={containerRef} onKeyDown={handleKeyDown}>
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

// ============================================
// LIVE REGION
// Anuncia mudanças para leitores de tela
// ============================================

interface LiveRegionProps {
  message: string;
  politeness?: "polite" | "assertive";
  className?: string;
}

export function LiveRegion({ message, politeness = "polite", className }: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className={cn("sr-only", className)}
    >
      {message}
    </div>
  );
}

// Hook for announcements
export function useAnnounce() {
  const [message, setMessage] = React.useState("");

  const announce = React.useCallback((text: string, clear = true) => {
    setMessage(text);
    if (clear) {
      setTimeout(() => setMessage(""), 1000);
    }
  }, []);

  return { message, announce };
}

// ============================================
// VISUALLY HIDDEN
// Esconde visualmente mas mantém acessível
// ============================================

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export function VisuallyHidden({ children, as: Component = "span" }: VisuallyHiddenProps) {
  return <Component className="sr-only">{children}</Component>;
}

// ============================================
// ACCESSIBLE ICON BUTTON
// Botão de ícone com label acessível
// ============================================

interface AccessibleIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  showLabel?: boolean;
}

export const AccessibleIconButton = React.forwardRef<HTMLButtonElement, AccessibleIconButtonProps>(
  ({ icon, label, showLabel = false, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "rounded-md p-2",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {icon}
        {showLabel ? <span>{label}</span> : <VisuallyHidden>{label}</VisuallyHidden>}
      </button>
    );
  }
);

AccessibleIconButton.displayName = "AccessibleIconButton";

// ============================================
// REDUCED MOTION HOOK
// Respeita preferência do usuário
// ============================================

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

// ============================================
// KEYBOARD NAVIGATION INDICATOR
// Mostra quando usuário está navegando por teclado
// ============================================

export function useKeyboardNavigation() {
  const [isKeyboardUser, setIsKeyboardUser] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setIsKeyboardUser(true);
      }
    };

    const handleMouseDown = () => {
      setIsKeyboardUser(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return isKeyboardUser;
}
