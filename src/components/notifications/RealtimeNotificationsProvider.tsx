import { useRealtimeResetRequests } from '@/hooks/useRealtimeResetRequests';

export function RealtimeNotificationsProvider({ children }: { children: React.ReactNode }) {
  // Subscribe to realtime password reset request notifications
  useRealtimeResetRequests();

  return <>{children}</>;
}
