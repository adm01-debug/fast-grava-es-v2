// Navigation helper for programmatic navigation without page reload
// This provides a way to navigate from outside React components

// Event-based navigation that works with React Router
export const NAVIGATION_EVENT = 'app:navigate';

interface NavigationEvent extends CustomEvent {
  detail: { path: string };
}

/**
 * Navigate to a path using React Router without page reload.
 * This dispatches a custom event that can be listened to by a component
 * with access to the router.
 */
export function navigateTo(path: string): void {
  // Check if we're already on this path
  if (window.location.pathname === path) return;
  
  // Dispatch custom event for React Router to handle
  const event = new CustomEvent(NAVIGATION_EVENT, { 
    detail: { path },
    bubbles: true 
  });
  window.dispatchEvent(event);
}

/**
 * Type guard for navigation events
 */
export function isNavigationEvent(event: Event): event is NavigationEvent {
  return event.type === NAVIGATION_EVENT && 'detail' in event;
}
