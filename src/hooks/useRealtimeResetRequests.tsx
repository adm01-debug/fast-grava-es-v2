import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';

export function useRealtimeResetRequests() {
  const { isCoordinator, isManager, user } = useAuth();

  useEffect(() => {
    // Only subscribe for coordinators and managers
    if (!isCoordinator && !isManager) return;
    if (!user) return;

    if (import.meta.env.DEV) 

    const channel = supabase
      .channel('password-reset-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'password_reset_requests',
        },
        (payload) => {
          if (import.meta.env.DEV) 
          
          const newRequest = payload.new as {
            user_email: string;
            requested_by_name: string | null;
            status: string;
          };

          // Show toast notification
          toast.info(
            `Nova solicitação de reset de senha`,
            {
              description: `${newRequest.user_email} solicitou reset de senha`,
              duration: 10000,
              icon: <KeyRound className="h-4 w-4" />,
              action: {
                label: 'Ver',
                onClick: () => {
                  window.location.href = '/settings?tab=users';
                },
              },
            }
          );
        }
      )
      .subscribe((status) => {
        if (import.meta.env.DEV) 
      });

    return () => {
      if (import.meta.env.DEV) 
      supabase.removeChannel(channel);
    };
  }, [isCoordinator, isManager, user]);
}
