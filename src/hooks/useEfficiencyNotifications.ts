import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useBottleneckPrediction, BottleneckAlert } from './useBottleneckPrediction';
import { useLoadBalancing, LoadBalancingSuggestion } from './useLoadBalancing';

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
  
  // Track previous state to detect changes
  const prevBottleneckCount = useRef<number>(0);
  const prevLoadBalancingCount = useRef<number>(0);
  const hasInitialized = useRef(false);

  const checkBottleneckAlerts = useCallback(() => {
    if (!settings.enableBottleneckAlerts) return;
    
    const currentCount = criticalCount + warningCount;
    
    // Only notify on increases (new alerts)
    if (hasInitialized.current && currentCount > prevBottleneckCount.current) {
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
    
    prevBottleneckCount.current = currentCount;
  }, [bottleneckAlerts, criticalCount, warningCount, settings.enableBottleneckAlerts]);

  const checkLoadBalancingAlerts = useCallback(() => {
    if (!settings.enableLoadBalancingAlerts) return;
    
    const currentCount = loadBalancingSuggestions.length;
    
    // Only notify on increases (new suggestions)
    if (hasInitialized.current && currentCount > prevLoadBalancingCount.current) {
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
    
    prevLoadBalancingCount.current = currentCount;
  }, [loadBalancingSuggestions, settings.enableLoadBalancingAlerts]);

  // Initialize and run first check after a delay
  useEffect(() => {
    // Set initial values without triggering notifications
    prevBottleneckCount.current = criticalCount + warningCount;
    prevLoadBalancingCount.current = loadBalancingSuggestions.length;
    
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
