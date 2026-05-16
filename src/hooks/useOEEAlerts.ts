import { useOEE } from './useOEE';
import { useBusinessConfig } from './useBusinessConfig';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';

const CONTEXT = 'useOEEAlerts';

export function useOEEAlerts() {
  const { data: oeeData } = useOEE(1, 0); // Check current day OEE
  const { getConfig } = useBusinessConfig();
  const lastAlertsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!oeeData || !oeeData.byMachine) return;

    const thresholds = {
      oee: {
        warning: Number(getConfig('oee_threshold_warning', 65)),
        critical: Number(getConfig('oee_threshold_critical', 50)),
      },
      availability: {
        warning: Number(getConfig('availability_threshold_warning', 70)),
      },
      performance: {
        warning: Number(getConfig('performance_threshold_warning', 75)),
      }
    };

    oeeData.byMachine.forEach(machine => {
      // Logic to prevent alert spam: only alert once every 4 hours per metric/machine
      const now = Date.now();
      const throttleMs = 4 * 60 * 60 * 1000;

      const checkMetric = async (name: string, value: number, warningThreshold: number, criticalThreshold?: number) => {
        const alertKey = `${machine.machineId}-${name}`;
        const lastAlert = lastAlertsRef.current[alertKey] || 0;

        if (now - lastAlert < throttleMs) return;

        let severity: 'WARNING' | 'CRITICAL' | null = null;
        let threshold = warningThreshold;

        if (criticalThreshold && value < criticalThreshold) {
          severity = 'CRITICAL';
          threshold = criticalThreshold;
        } else if (value < warningThreshold) {
          severity = 'WARNING';
          threshold = warningThreshold;
        }

        if (severity) {
          try {
            await supabase.rpc('check_and_notify_kpi_alert', {
              p_machine_id: machine.machineId,
              p_metric_name: name,
              p_metric_value: value,
              p_threshold: threshold,
              p_severity: severity
            });
            
            lastAlertsRef.current[alertKey] = now;
            logger.info(`Alert triggered for ${machine.machineName}: ${name} is ${value}%`, { machine: machine.machineName, metric: name, value }, CONTEXT);
          } catch (err) {
            logger.error(`Failed to send KPI alert for ${machine.machineName}`, err, CONTEXT);
          }
        }
      };

      // Check main metrics
      checkMetric('OEE', machine.oee, thresholds.oee.warning, thresholds.oee.critical);
      checkMetric('Disponibilidade', machine.availability, thresholds.availability.warning);
      checkMetric('Performance', machine.performance, thresholds.performance.warning);
    });
  }, [oeeData, getConfig]);

  return null;
}
