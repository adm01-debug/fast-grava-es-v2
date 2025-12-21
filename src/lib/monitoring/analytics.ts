// Analytics Configuration (Mixpanel/Amplitude compatible)
type EventProperties = Record<string, any>;

interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
}

const config: AnalyticsConfig = {
  enabled: import.meta.env.PROD,
  debug: import.meta.env.DEV,
};

let userId: string | null = null;
let userProperties: Record<string, any> = {};

export function initAnalytics() {
  if (config.debug) console.log('[Analytics] Initialized');
}

export function identify(id: string, properties?: Record<string, any>) {
  userId = id;
  userProperties = properties || {};
  if (config.debug) console.log('[Analytics] Identify:', id, properties);
}

export function track(event: string, properties?: EventProperties) {
  const payload = {
    event,
    properties: {
      ...properties,
      timestamp: new Date().toISOString(),
      userId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    },
  };

  if (config.debug) console.log('[Analytics] Track:', payload);

  if (config.enabled) {
    // Send to analytics backend
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(console.error);
  }
}

export function pageView(pageName: string, properties?: EventProperties) {
  track('Page View', { pageName, ...properties });
}

export function reset() {
  userId = null;
  userProperties = {};
  if (config.debug) console.log('[Analytics] Reset');
}
