import { useState, useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  reFetchCount: number;
  responseTime: number;
  lastResponseAt: Date | null;
}

/**
 * Hook to track performance metrics for a specific component or data fetch
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

  // Track render time
  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    
    setMetrics(prev => ({
      ...prev,
      renderTime: duration
    }));

    // In a real scenario, we could send this to an analytics endpoint
    if (duration > 100) { // Log slow renders (>100ms)
      console.warn(`[PERF] Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
    }
  });

  const recordFetch = (duration: number) => {
    reFetchCount.current += 1;
    setMetrics(prev => ({
      ...prev,
      reFetchCount: reFetchCount.current,
      responseTime: duration,
      lastResponseAt: new Date()
    }));
  };

  return {
    metrics,
    recordFetch
  };
}
