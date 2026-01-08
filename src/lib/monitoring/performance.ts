// Performance Monitoring
interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint?: number;
  timeToInteractive?: number;
  totalBlockingTime?: number;
}

export function getPerformanceMetrics(): PerformanceMetrics | null {
  if (typeof window === 'undefined' || !window.performance) return null;

  const timing = performance.timing;
  const paintEntries = performance.getEntriesByType('paint');

  const metrics: PerformanceMetrics = {
    pageLoadTime: timing.loadEventEnd - timing.navigationStart,
    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
    firstPaint: 0,
    firstContentfulPaint: 0,
  };

  paintEntries.forEach((entry) => {
    if (entry.name === 'first-paint') {
      metrics.firstPaint = entry.startTime;
    } else if (entry.name === 'first-contentful-paint') {
      metrics.firstContentfulPaint = entry.startTime;
    }
  });

  return metrics;
}

export function measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  return fn().finally(() => {
    const duration = performance.now() - start;
    if (import.meta.env.DEV) console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    performance.measure(name, { start, duration });
  });
}

export function measureSync<T>(name: string, fn: () => T): T {
  const start = performance.now();
  try {
    return fn();
  } finally {
    const duration = performance.now() - start;
    if (import.meta.env.DEV) console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }
}

export class PerformanceObserverManager {
  private observers: PerformanceObserver[] = [];

  observe(type: string, callback: (entries: PerformanceEntryList) => void) {
    const observer = new PerformanceObserver((list) => callback(list.getEntries()));
    observer.observe({ entryTypes: [type] });
    this.observers.push(observer);
  }

  disconnect() {
    this.observers.forEach((o) => o.disconnect());
    this.observers = [];
  }
}
