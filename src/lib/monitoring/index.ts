// Monitoring exports
export * from './sentry';
export * from './analytics';
export * from './webVitals';
export * from './performance';
export * from './logger';

import { initSentry } from './sentry';
import { initAnalytics } from './analytics';
import { initWebVitals } from './webVitals';

export function initMonitoring() {
  initSentry();
  initAnalytics();
  initWebVitals();
  if (import.meta.env.DEV) console.log('[Monitoring] All monitoring services initialized');
}
