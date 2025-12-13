import { useEfficiencyNotifications } from '@/hooks/useEfficiencyNotifications';
import { useNotifications } from '@/hooks/useNotifications';

export function EfficiencyNotificationProvider({ children }: { children: React.ReactNode }) {
  // Initialize both notification systems
  useNotifications();
  useEfficiencyNotifications();
  
  return <>{children}</>;
}
