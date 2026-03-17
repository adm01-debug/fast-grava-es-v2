import { useSmartDelayAlerts } from '@/hooks/useSmartDelayAlerts';
import { usePriorityEscalation } from '@/hooks/usePriorityEscalation';

/**
 * Combines smart delay detection and priority escalation watchers.
 * Renders nothing — purely side-effect driven.
 */
export function SmartAlertsWatcher() {
  useSmartDelayAlerts();
  usePriorityEscalation();
  return null;
}
