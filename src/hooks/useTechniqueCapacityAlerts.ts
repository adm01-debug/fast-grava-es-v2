import { useMemo, useEffect, useRef } from 'react';
import { useSchedulingData } from './useSchedulingData';
import { useNotificationsContext } from '@/contexts/NotificationsContext';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook that monitors technique capacity and alerts when a technique is reaching 
 * or exceeding its daily production capacity.
 */
export function useTechniqueCapacityAlerts() {
  const { user } = useAuth();
  const { jobs, techniques } = useSchedulingData();
  const { add } = useNotificationsContext();
  const alertedRef = useRef<Set<string>>(new Set());

  // Daily capacity in minutes (e.g., 8 hours = 480 minutes)
  const DAILY_CAPACITY = 480;

  useEffect(() => {
    if (!user || !jobs.length || !techniques.length) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Calculate load per technique for today
    const loadByTechnique = new Map<string, number>();
    
    jobs.forEach(job => {
      if (job.scheduled_date === today && !['finished', 'cancelled'].includes(job.status)) {
        const currentLoad = loadByTechnique.get(job.technique_id) || 0;
        loadByTechnique.set(job.technique_id, currentLoad + (job.estimated_duration || 0));
      }
    });

    // Check thresholds and alert
    techniques.forEach(technique => {
      const load = loadByTechnique.get(technique.id) || 0;
      const utilization = (load / DAILY_CAPACITY) * 100;

      // Thresholds: 90% (Warning), 105% (Critical)
      if (utilization >= 105) {
        const key = `capacity-critical-${technique.id}-${today}`;
        if (!alertedRef.current.has(key)) {
          alertedRef.current.add(key);
          add({
            title: '⚠️ Capacidade Excedida',
            message: `Técnica ${technique.name} está com ${Math.round(utilization)}% de ocupação para hoje.`,
            type: 'error',
            href: '/kanban',
          });
        }
      } else if (utilization >= 90) {
        const key = `capacity-warn-${technique.id}-${today}`;
        if (!alertedRef.current.has(key)) {
          alertedRef.current.add(key);
          add({
            title: '📊 Técnica Próxima ao Limite',
            message: `Técnica ${technique.name} atingiu ${Math.round(utilization)}% da capacidade diária.`,
            type: 'warning',
            href: '/kanban',
          });
        }
      }
    });

    // Cleanup old keys at midnight
    const cleanup = () => {
      if (alertedRef.current.size > 100) {
        alertedRef.current.clear();
      }
    };
    
    const timer = setTimeout(cleanup, 3600000); // Check once per hour if needs cleanup
    return () => clearTimeout(timer);
    
  }, [user, jobs, techniques, add]);
}
