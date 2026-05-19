import { useEfficiencyNotifications } from '@/features/notifications';
import { useNotifications } from '@/features/notifications';

export function EfficiencyNotificationProvider({ children }: { children: React.ReactNode }) {
  // Initialize both notification systems
  useNotifications();
  useEfficiencyNotifications();

  return <>{children}</>;
}
