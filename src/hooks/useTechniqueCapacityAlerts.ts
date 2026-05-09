import { useEffect, useRef, useMemo } from 'react';
import { useSchedulingData } from './useSchedulingData';
import { useNotificationsContext } from '@/contexts/NotificationsContext';
import { useAuth } from '@/contexts/AuthContext';

interface TechniqueCapacity {
  techniqueId: string;
  techniqueName: string;
  totalMachines: number;
  activeJobs: number;
  scheduledJobs: number;
  occupancyPercent: number;
  status: 'normal' | 'warning' | 'critical';
}

/**
 * Monitors technique capacity and alerts when occupancy exceeds thresholds.
 * Warning at 75%, Critical at 85%.
 * Checks every 5 minutes.
 */
export function useTechniqueCapacityAlerts() {
  const { user } = useAuth();
  const { jobs, machines, techniques } = useSchedulingData();
  const { add } = useNotificationsContext();
  const alertedRef = useRef<Set<string>>(new Set());

  const capacities = useMemo((): TechniqueCapacity[] => {
    if (!techniques.length || !machines.length) return [];

    const today = new Date().toISOString().split('T')[0];

    return techniques.map(tech => {
      const techMachines = machines.filter(m => m.technique_id === tech.id && m.is_active);
      const activeJobs = jobs.filter(
        j => j.technique_id === tech.id &&
          ['production', 'ready', 'scheduled'].includes(j.status)
      );
      const weekJobs = jobs.filter(
        j => j.technique_id === tech.id &&
          !['finished', 'cancelled'].includes(j.status)
      );

      // Occupancy = active jobs / available machine slots (assume 2 jobs per machine per day)
      const maxCapacity = techMachines.length * 2;
      const occupancy = maxCapacity > 0 ? (activeJobs.length / maxCapacity) * 100 : 0;

      let status: 'normal' | 'warning' | 'critical' = 'normal';
      const warningT = tech.medium_threshold ? (tech.medium_threshold / 600) * 100 : 75;
      const criticalT = tech.high_threshold ? (tech.high_threshold / 600) * 100 : 85;

      if (occupancy >= criticalT) status = 'critical';
      else if (occupancy >= warningT) status = 'warning';

      return {
        techniqueId: tech.id,
        techniqueName: tech.name,
        totalMachines: techMachines.length,
        activeJobs: activeJobs.length,
        scheduledJobs: weekJobs.length,
        occupancyPercent: Math.round(occupancy),
        status,
      };
    }).sort((a, b) => b.occupancyPercent - a.occupancyPercent);
  }, [techniques, machines, jobs]);

  useEffect(() => {
    if (!user) return;

    const checkCapacity = () => {
      for (const cap of capacities) {
        if (cap.status === 'normal') continue;
        const key = `cap-${cap.techniqueId}-${cap.status}`;
        if (alertedRef.current.has(key)) continue;
        alertedRef.current.add(key);

        if (cap.status === 'critical') {
          add({
            title: '🔴 Capacidade Crítica!',
            message: `${cap.techniqueName} está com ${cap.occupancyPercent}% de ocupação (${cap.activeJobs} jobs ativos em ${cap.totalMachines} máquinas)`,
            type: 'error',
            href: '/efficiency',
          });
        } else {
          add({
            title: '🟡 Capacidade em Atenção',
            message: `${cap.techniqueName} atingiu ${cap.occupancyPercent}% de ocupação — considere redistribuir`,
            type: 'warning',
            href: '/efficiency',
          });
        }
      }
    };

    checkCapacity();
    const interval = setInterval(checkCapacity, 5 * 60 * 1000);

    // Reset alerts daily
    const resetDaily = setInterval(() => {
      alertedRef.current.clear();
    }, 24 * 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearInterval(resetDaily);
    };
  }, [user, capacities, add]);

  return { capacities };
}
