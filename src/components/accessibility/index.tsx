import * as React from "react";
import { cn } from "@/lib/utils";

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

export function SkipLinks({ links = DEFAULT_SKIP_LINKS, className }: SkipLinksProps): JSX.Element {
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

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function MainContent({ children, className, id = "main-content" }: MainContentProps): JSX.Element {
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

interface LiveRegionProps {
  message: string;
  politeness?: "polite" | "assertive";
  className?: string;
}

export function LiveRegion({ message, politeness = "polite", className }: LiveRegionProps): JSX.Element {
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
