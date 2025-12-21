// Web Vitals Monitoring
import { onCLS, onFCP, onFID, onLCP, onTTFB, Metric } from 'web-vitals';

interface VitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
}

const vitalsQueue: VitalMetric[] = [];

function sendToAnalytics(metric: Metric) {
  const vital: VitalMetric = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
  };

  vitalsQueue.push(vital);

  // Batch send every 10 metrics or on page unload
  if (vitalsQueue.length >= 10) {
    flushVitals();
  }
}

function flushVitals() {
  if (vitalsQueue.length === 0) return;

  const metrics = [...vitalsQueue];
  vitalsQueue.length = 0;

  if (import.meta.env.PROD) {
    navigator.sendBeacon('/api/vitals', JSON.stringify({
      metrics,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }));
  } else {
    console.log('[WebVitals]', metrics);
  }
}

export function initWebVitals() {
  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onFID(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);

  // Flush on page unload
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushVitals();
    }
  });
}

export function getWebVitals(): Promise<Record<string, number>> {
  return new Promise((resolve) => {
    const vitals: Record<string, number> = {};

    onLCP((m) => { vitals.LCP = m.value; });
    onFID((m) => { vitals.FID = m.value; });
    onCLS((m) => { vitals.CLS = m.value; });
    onFCP((m) => { vitals.FCP = m.value; });
    onTTFB((m) => { vitals.TTFB = m.value; });

    setTimeout(() => resolve(vitals), 5000);
  });
}
