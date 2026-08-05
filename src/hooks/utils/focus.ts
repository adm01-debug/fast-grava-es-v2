/**
 * Utility to find focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];

  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(
    container.querySelectorAll<HTMLElement>(focusableSelectors)
  ).filter(el => {
    // Filter out hidden elements
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  });
}
