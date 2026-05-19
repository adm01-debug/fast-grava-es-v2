import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  renderTime: number;
  reFetchCount: number;
  responseTime: number;
  lastResponseAt: Date | null;
}

/**
 * Hook to track performance metrics for a specific component or data fetch
 * and persist them to telemetry_traces table
 */
export function usePerformanceMetrics(componentName: string) {
  const startTime = useRef(performance.now());
  const reFetchCount = useRef(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    reFetchCount: 0,
    responseTime: 0,
    lastResponseAt: null,
  });

  // Track render time and persist
  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    setMetrics(prev => ({
      ...prev,
      renderTime: duration
    }));

    // Persist slow renders or just standard traces
    const persistTrace = async () => {
      try {
        await supabase.from('telemetry_traces').insert({
          name: `render:${componentName}`,
          duration_ms: duration,
          service_name: 'frontend',
          span_id: crypto.randomUUID().slice(0, 8),
          trace_id: crypto.randomUUID(),
          attributes: {
            type: 'render',
            reFetchCount: reFetchCount.current,
            url: window.location.pathname
          }
        });
      } catch (err) {
        console.error('Failed to persist telemetry trace:', err);
      }
    };

    if (duration > 16) { // Only log if it takes more than 1 frame (~16ms) to keep it efficient
      persistTrace();
    }

    if (duration > 100) {
      console.warn(`[PERF] Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
    }
  }, []); // Only on mount for page-level components

  const recordFetch = async (duration: number) => {
    reFetchCount.current += 1;
    setMetrics(prev => ({
      ...prev,
      reFetchCount: reFetchCount.current,
      responseTime: duration,
      lastResponseAt: new Date()
    }));

    // Persist fetch trace
    try {
      await supabase.from('telemetry_traces').insert({
        name: `fetch:${componentName}`,
        duration_ms: duration,
        service_name: 'frontend',
        span_id: crypto.randomUUID().slice(0, 8),
        trace_id: crypto.randomUUID(),
        attributes: {
          type: 'fetch',
          fetchIndex: reFetchCount.current,
          url: window.location.pathname
        }
      });
    } catch (err) {
      console.error('Failed to persist fetch telemetry:', err);
    }
  };

  return {
    metrics,
    recordFetch
  };
}
