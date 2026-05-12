import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
    async function fetchInitialStatus() {
      const { data: machines } = await supabase.from('machines').select('id, is_active');
      const { data: activeJobs } = await supabase.from('jobs').select('id, machine_id, status').eq('status', 'production');

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

      setStatuses(newStatuses);
      setIsLoading(false);
    }

    fetchInitialStatus();

    // Subscribe to job and machine changes
    const channel = supabase.channel('machine-status-hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => fetchInitialStatus())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'machines' }, () => fetchInitialStatus())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { statuses, isLoading };
}
