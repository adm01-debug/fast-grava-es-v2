import { useCallback, useEffect, useRef } from 'react';

// Event types for analytics
type EventCategory = 
  | 'navigation'
  | 'interaction'
  | 'form'
  | 'error'
  | 'performance'
  | 'business'
  | 'user';

interface AnalyticsEvent {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

interface PageView {
  path: string;
  title: string;
  referrer?: string;
  timestamp: number;
}

// Analytics store
const eventQueue: AnalyticsEvent[] = [];
const pageViews: PageView[] = [];
let sessionStartTime = Date.now();

// Track event
export function trackEvent(
  category: EventCategory,
  action: string,
  label?: string,
  value?: number,
  metadata?: Record<string, unknown>
) {
  const event: AnalyticsEvent = {
    category,
    action,
    label,
    value,
    metadata,
    timestamp: Date.now(),
  };

  eventQueue.push(event);
  
  // Log in development
  if (import.meta.env.DEV) {
    console.log('[Analytics]', event);
  }

  // Flush if queue is large
  if (eventQueue.length >= 10) {
    flushEvents();
  }
}

// Track page view
export function trackPageView(path: string, title: string) {
  const pageView: PageView = {
    path,
    title,
    referrer: document.referrer,
    timestamp: Date.now(),
  };

  pageViews.push(pageView);

  if (import.meta.env.DEV) {
    console.log('[Analytics] Page View:', pageView);
  }
}

// Flush events to server
async function flushEvents() {
  if (eventQueue.length === 0) return;

  const events = [...eventQueue];
  eventQueue.length = 0;

  try {
    // Here you would send to your analytics endpoint
    // await fetch('/api/analytics', {
    //   method: 'POST',
    //   body: JSON.stringify({ events, pageViews }),
    // });
  } catch (error) {
    // Re-queue failed events
    eventQueue.push(...events);
  }
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    flushEvents();
  });

  // Periodic flush
  setInterval(flushEvents, 30000);
}

// Hook for tracking component interactions
export function useAnalytics() {
  const track = useCallback((
    action: string,
    label?: string,
    value?: number,
    metadata?: Record<string, unknown>
  ) => {
    trackEvent('interaction', action, label, value, metadata);
  }, []);

  const trackClick = useCallback((elementName: string, metadata?: Record<string, unknown>) => {
    trackEvent('interaction', 'click', elementName, undefined, metadata);
  }, []);

  const trackFormSubmit = useCallback((formName: string, success: boolean, metadata?: Record<string, unknown>) => {
    trackEvent('form', success ? 'submit_success' : 'submit_error', formName, undefined, metadata);
  }, []);

  const trackError = useCallback((errorType: string, message: string, metadata?: Record<string, unknown>) => {
    trackEvent('error', errorType, message, undefined, metadata);
  }, []);

  const trackBusinessEvent = useCallback((action: string, metadata?: Record<string, unknown>) => {
    trackEvent('business', action, undefined, undefined, metadata);
  }, []);

  return {
    track,
    trackClick,
    trackFormSubmit,
    trackError,
    trackBusinessEvent,
  };
}

// Hook for tracking page views
export function usePageTracking(path: string, title: string) {
  useEffect(() => {
    trackPageView(path, title);
  }, [path, title]);
}

// Hook for tracking time on page
export function useTimeOnPage() {
  const startTime = useRef(Date.now());

  useEffect(() => {
    return () => {
      const timeOnPage = Date.now() - startTime.current;
      trackEvent('performance', 'time_on_page', window.location.pathname, timeOnPage);
    };
  }, []);
}

// Hook for tracking scroll depth
export function useScrollTracking() {
  const maxScrollDepth = useRef(0);
  const milestones = useRef(new Set<number>());

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = Math.round((window.scrollY / scrollHeight) * 100);
      
      if (scrollDepth > maxScrollDepth.current) {
        maxScrollDepth.current = scrollDepth;

        // Track milestones (25%, 50%, 75%, 100%)
        [25, 50, 75, 100].forEach((milestone) => {
          if (scrollDepth >= milestone && !milestones.current.has(milestone)) {
            milestones.current.add(milestone);
            trackEvent('interaction', 'scroll_depth', `${milestone}%`, milestone);
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

// Performance tracking
export function trackPerformance() {
  if (typeof window === 'undefined' || !window.performance) return;

  // Wait for page to fully load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const timing = performance.timing;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

      if (navigation) {
        trackEvent('performance', 'page_load', undefined, undefined, {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          ttfb: navigation.responseStart - navigation.requestStart,
          domLoad: navigation.domContentLoadedEventEnd - navigation.startTime,
          windowLoad: navigation.loadEventEnd - navigation.startTime,
        });
      }

      // Track largest contentful paint
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        const lcp = lcpEntries[lcpEntries.length - 1];
        trackEvent('performance', 'lcp', undefined, Math.round(lcp.startTime));
      }
    }, 0);
  });
}

// Session tracking
export function getSessionDuration(): number {
  return Date.now() - sessionStartTime;
}

export function resetSession() {
  sessionStartTime = Date.now();
  eventQueue.length = 0;
  pageViews.length = 0;
}

// Get analytics summary
export function getAnalyticsSummary() {
  return {
    sessionDuration: getSessionDuration(),
    totalEvents: eventQueue.length,
    totalPageViews: pageViews.length,
    eventsByCategory: eventQueue.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}
