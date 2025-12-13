import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useBottleneckPrediction } from './useBottleneckPrediction';
import { useLoadBalancing } from './useLoadBalancing';
import { useEfficiencyAlertHistory } from './useEfficiencyAlertHistory';

interface EfficiencyNotificationConfig {
  enableBottleneckAlerts: boolean;
  enableLoadBalancingAlerts: boolean;
  checkIntervalMs: number;
}

const defaultConfig: EfficiencyNotificationConfig = {
  enableBottleneckAlerts: true,
  enableLoadBalancingAlerts: true,
  checkIntervalMs: 60000, // 1 minute
};

export function useEfficiencyNotifications(config: Partial<EfficiencyNotificationConfig> = {}) {
  const settings = { ...defaultConfig, ...config };
  
  const { alerts: bottleneckAlerts, criticalCount, warningCount } = useBottleneckPrediction();
  const { suggestions: loadBalancingSuggestions } = useLoadBalancing();
  const { recordAlert } = useEfficiencyAlertHistory();
  
  // Track previous state to detect changes
  const prevBottleneckCount = useRef<number>(0);
  const prevLoadBalancingCount = useRef<number>(0);
  const prevBottleneckIds = useRef<Set<string>>(new Set());
  const prevSuggestionIds = useRef<Set<string>>(new Set());
  const hasInitialized = useRef(false);

  const checkBottleneckAlerts = useCallback(() => {
    if (!settings.enableBottleneckAlerts) return;
    
    const currentCount = criticalCount + warningCount;
    const currentIds = new Set(bottleneckAlerts.map(a => `${a.techniqueId}-${a.date}`));
    
    // Find new alerts that weren't in the previous set
    if (hasInitialized.current) {
      bottleneckAlerts.forEach(alert => {
        const alertId = `${alert.techniqueId}-${alert.date}`;
        if (!prevBottleneckIds.current.has(alertId)) {
          // Record new alert to history
          recordAlert.mutate({
            alert_type: 'bottleneck',
            severity: alert.severity === 'critical' ? 'error' : 'warning',
            title: `Gargalo: ${alert.techniqueName}`,
            description: alert.message,
            technique_id: alert.techniqueId,
            metadata: {
              date: alert.date,
              occupancy: alert.occupancy,
              projectedOccupancy: alert.projectedOccupancy,
              jobCount: alert.jobCount,
              machineCount: alert.machineCount
            }
          });
        }
      });
      
      // Show toast notifications for new alerts
      if (currentCount > prevBottleneckCount.current) {
        const newAlerts = currentCount - prevBottleneckCount.current;
        const criticalAlerts = bottleneckAlerts.filter(a => a.severity === 'critical');
        
        if (criticalAlerts.length > 0) {
          toast.error(`${newAlerts} novo(s) alerta(s) de gargalo`, {
            description: criticalAlerts[0]?.message || 'Técnica próxima da saturação',
            action: {
              label: 'Ver Alertas',
              onClick: () => window.location.href = '/alerts',
            },
            duration: 8000,
          });
        } else {
          toast.warning(`${newAlerts} novo(s) alerta(s) de gargalo`, {
            description: bottleneckAlerts[0]?.message || 'Atenção à capacidade',
            action: {
              label: 'Ver Alertas',
              onClick: () => window.location.href = '/alerts',
            },
            duration: 6000,
          });
        }
      }
    }
    
    prevBottleneckCount.current = currentCount;
    prevBottleneckIds.current = currentIds;
  }, [bottleneckAlerts, criticalCount, warningCount, settings.enableBottleneckAlerts, recordAlert]);

  const checkLoadBalancingAlerts = useCallback(() => {
    if (!settings.enableLoadBalancingAlerts) return;
    
    const currentCount = loadBalancingSuggestions.length;
    const currentIds = new Set(loadBalancingSuggestions.map(s => `${s.jobId}-${s.currentMachineId}-${s.suggestedMachineId}`));
    
    // Find new suggestions that weren't in the previous set
    if (hasInitialized.current) {
      loadBalancingSuggestions.forEach(suggestion => {
        const suggestionId = `${suggestion.jobId}-${suggestion.currentMachineId}-${suggestion.suggestedMachineId}`;
        if (!prevSuggestionIds.current.has(suggestionId)) {
          // Record new suggestion to history
          recordAlert.mutate({
            alert_type: 'load_balancing',
            severity: 'info',
            title: `Balanceamento de Carga`,
            description: `Sugestão: mover job ${suggestion.orderNumber} de ${suggestion.currentMachineName} para ${suggestion.suggestedMachineName}`,
            machine_id: suggestion.currentMachineId,
            metadata: {
              jobId: suggestion.jobId,
              orderNumber: suggestion.orderNumber,
              client: suggestion.client,
              currentMachineId: suggestion.currentMachineId,
              suggestedMachineId: suggestion.suggestedMachineId,
              loadDifference: suggestion.loadDifference
            }
          });
        }
      });
      
      // Show toast notifications for new suggestions
      if (currentCount > prevLoadBalancingCount.current) {
        const newSuggestions = currentCount - prevLoadBalancingCount.current;
        const topSuggestion = loadBalancingSuggestions[0];
        
        toast.info(`${newSuggestions} nova(s) sugestão(ões) de balanceamento`, {
          description: topSuggestion 
            ? `Redistribuir de ${topSuggestion.currentMachineName} para ${topSuggestion.suggestedMachineName}` 
            : 'Carga desbalanceada detectada',
          action: {
            label: 'Ver Sugestões',
            onClick: () => window.location.href = '/alerts',
          },
          duration: 6000,
        });
      }
    }
    
    prevLoadBalancingCount.current = currentCount;
    prevSuggestionIds.current = currentIds;
  }, [loadBalancingSuggestions, settings.enableLoadBalancingAlerts, recordAlert]);

  // Initialize and run first check after a delay
  useEffect(() => {
    // Set initial values without triggering notifications
    prevBottleneckCount.current = criticalCount + warningCount;
    prevLoadBalancingCount.current = loadBalancingSuggestions.length;
    prevBottleneckIds.current = new Set(bottleneckAlerts.map(a => `${a.techniqueId}-${a.date}`));
    prevSuggestionIds.current = new Set(loadBalancingSuggestions.map(s => `${s.jobId}-${s.currentMachineId}-${s.suggestedMachineId}`));
    
    const initTimeout = setTimeout(() => {
      hasInitialized.current = true;
    }, 3000);
    
    return () => clearTimeout(initTimeout);
  }, []); // Only run once on mount

  // Periodic checks for changes
  useEffect(() => {
    if (!hasInitialized.current) return;
    
    checkBottleneckAlerts();
    checkLoadBalancingAlerts();
  }, [bottleneckAlerts, loadBalancingSuggestions, checkBottleneckAlerts, checkLoadBalancingAlerts]);

  // Manual check functions
  const forceCheckBottlenecks = useCallback(() => {
    if (criticalCount > 0) {
      toast.error(`${criticalCount} gargalo(s) crítico(s) detectado(s)`, {
        description: bottleneckAlerts.find(a => a.severity === 'critical')?.message,
        action: {
          label: 'Ver Alertas',
          onClick: () => window.location.href = '/alerts',
        },
      });
    } else if (warningCount > 0) {
      toast.warning(`${warningCount} alerta(s) de capacidade`, {
        description: bottleneckAlerts[0]?.message,
        action: {
          label: 'Ver Alertas',
          onClick: () => window.location.href = '/alerts',
        },
      });
    } else {
      toast.success('Sem gargalos detectados', {
        description: 'Capacidade operacional normal',
      });
    }
  }, [bottleneckAlerts, criticalCount, warningCount]);

  const forceCheckLoadBalancing = useCallback(() => {
    if (loadBalancingSuggestions.length > 0) {
      toast.info(`${loadBalancingSuggestions.length} sugestão(ões) de balanceamento`, {
        description: 'Redistribuição pode otimizar a produção',
        action: {
          label: 'Ver Sugestões',
          onClick: () => window.location.href = '/alerts',
        },
      });
    } else {
      toast.success('Carga balanceada', {
        description: 'Nenhuma redistribuição necessária',
      });
    }
  }, [loadBalancingSuggestions]);

  return {
    checkBottleneckAlerts: forceCheckBottlenecks,
    checkLoadBalancingAlerts: forceCheckLoadBalancing,
    bottleneckCount: criticalCount + warningCount,
    loadBalancingCount: loadBalancingSuggestions.length,
  };
}
