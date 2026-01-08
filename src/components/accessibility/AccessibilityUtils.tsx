/**
 * Accessibility Utilities - Re-exports from canonical locations
 * 
 * This module provides consolidated exports for accessibility utilities.
 * All implementations are in their canonical locations.
 */

// Re-export from SkipLinks (canonical accessibility module)
export { 
  SkipLinks,
  MainContent,
  AccessibilityProvider,
  useLiveAnnounce,
  FocusTrap,
  LiveRegion,
  useAnnounce,
  VisuallyHidden,
  AccessibleIconButton,
  usePrefersReducedMotion,
  useKeyboardNavigation,
} from "@/components/accessibility/SkipLinks";

// Re-export useFocusTrap from canonical hook
export { useFocusTrap } from "@/hooks/use-focus-trap";

// Alias for backward compatibility
export { useLiveAnnounce as useLiveRegion } from "@/components/accessibility/SkipLinks";
export { usePrefersReducedMotion as useReducedMotion } from "@/components/accessibility/SkipLinks";

// Skip to content link (alias for SkipLinks)
export function SkipToContent({ targetId = "main-content" }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
    >
      Pular para o conteúdo principal
    </a>
  );
}

// Focus visible indicator
export function FocusRing({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background rounded-md ${className || ''}`}
    >
      {children}
    </div>
  );
}

// Color contrast checker
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const toLinear = (c: number) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Check if contrast meets WCAG requirements
export function meetsContrastRequirement(
  ratio: number,
  level: "AA" | "AAA" = "AA",
  isLargeText = false
): boolean {
  if (level === "AAA") {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}
