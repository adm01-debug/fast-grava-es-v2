import { useSmartDelayAlerts } from '@/hooks/useSmartDelayAlerts';
import { usePriorityEscalation } from '@/features/jobs';
import { useTechniqueCapacityAlerts } from '@/hooks/useTechniqueCapacityAlerts';

/**
 * Combines smart delay detection, priority escalation, and capacity alerts.
 * Renders nothing — purely side-effect driven.
 */
export function SmartAlertsWatcher() {
  useSmartDelayAlerts();
  usePriorityEscalation();
  useTechniqueCapacityAlerts();
  return null;
}
