// Prefetch utilities for lazy-loaded routes
// Maps route paths to their dynamic imports

const routeModules: Record<string, () => Promise<unknown>> = {
  '/': () => import('@/pages/Index'),
  '/calendar/daily': () => import('@/pages/DailyCalendar'),
  '/calendar/weekly': () => import('@/pages/WeeklyCalendar'),
  '/kanban': () => import('@/pages/KanbanBoard'),
  '/pending': () => import('@/pages/PendingQueue'),
  '/efficiency': () => import('@/pages/EfficiencyDashboard'),
  '/kpis': () => import('@/pages/KPIDashboard'),
  '/alerts': () => import('@/pages/AlertsDashboard'),
  '/knowledge': () => import('@/pages/TechnicalKnowledgeBase'),
  '/operator': () => import('@/pages/OperatorView'),
  '/scanner': () => import('@/pages/QRScannerPage'),
  '/assistant': () => import('@/pages/TechnicalAssistantPage'),
  '/integrations/bitrix24': () => import('@/pages/Bitrix24ConfigPage'),
  '/design-system': () => import('@/pages/DesignSystemPage'),
  '/auth': () => import('@/pages/AuthPage'),
};

// Cache to prevent duplicate prefetches
const prefetchedRoutes = new Set<string>();

/**
 * Prefetch a route's JavaScript bundle
 * This loads the module in the background so it's ready when the user navigates
 */
export function prefetchRoute(path: string): void {
  // Normalize path (remove trailing slashes, handle params)
  const normalizedPath = path.split('?')[0].replace(/\/$/, '') || '/';
  
  // Find matching route module
  const moduleLoader = routeModules[normalizedPath];
  
  if (moduleLoader && !prefetchedRoutes.has(normalizedPath)) {
    prefetchedRoutes.add(normalizedPath);
    
    // Use requestIdleCallback for non-critical prefetching
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        moduleLoader().catch(() => {
          // Remove from cache if prefetch fails so it can be retried
          prefetchedRoutes.delete(normalizedPath);
        });
      }, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        moduleLoader().catch(() => {
          prefetchedRoutes.delete(normalizedPath);
        });
      }, 100);
    }
  }
}

/**
 * Prefetch multiple routes at once
 */
export function prefetchRoutes(paths: string[]): void {
  paths.forEach(prefetchRoute);
}

/**
 * Get a prefetch handler for use with onMouseEnter, onFocus, etc.
 */
export function getPrefetchHandler(path: string): () => void {
  return () => prefetchRoute(path);
}

/**
 * Check if a route has been prefetched
 */
export function isRoutePrefetched(path: string): boolean {
  const normalizedPath = path.split('?')[0].replace(/\/$/, '') || '/';
  return prefetchedRoutes.has(normalizedPath);
}
