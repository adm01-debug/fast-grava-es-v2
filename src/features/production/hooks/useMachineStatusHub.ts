import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface MachineStatus {
  machineId: string;
  status: 'idle' | 'production' | 'maintenance' | 'offline';
  activeJobId?: string | null;
  lastUpdate: string;
}

export function useMachineStatusHub() {
  const [statuses, setStatuses] = useState<Record<string, MachineStatus>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let refreshTimeoutId: number | null = null;

    async function fetchInitialStatus() {
      try {
        const [{ data: machines, error: machinesError }, { data: activeJobs, error: jobsError }] = await Promise.all([
          supabase.from('machines').select('id, is_active'),
          supabase.from('jobs').select('id, machine_id, status').eq('status', 'production'),
        ]);

        if (machinesError) throw machinesError;
        if (jobsError) throw jobsError;

        const newStatuses: Record<string, MachineStatus> = {};

        machines?.forEach(m => {
          const job = activeJobs?.find(j => j.machine_id === m.id);
          newStatuses[m.id] = {
            machineId: m.id,
            status: !m.is_active ? 'offline' : job ? 'production' : 'idle',
            activeJobId: job?.id,
            lastUpdate: new Date().toISOString()
          };
        });

        if (isMounted) setStatuses(newStatuses);
      } catch (error) {
        logger.warn('Não foi possível atualizar o status das máquinas', error, 'useMachineStatusHub');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    function scheduleStatusRefresh() {
      if (refreshTimeoutId) window.clearTimeout(refreshTimeoutId);

      refreshTimeoutId = window.setTimeout(() => {
        void fetchInitialStatus();
      }, 500);
    }

    void fetchInitialStatus();

    // Subscribe to job and machine changes
    const channel = supabase.channel('machine-status-hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, scheduleStatusRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'machines' }, scheduleStatusRefresh)
      .subscribe();

    return () => {
      isMounted = false;
      if (refreshTimeoutId) window.clearTimeout(refreshTimeoutId);
      supabase.removeChannel(channel);
    };
  }, []);

  return { statuses, isLoading };
}
