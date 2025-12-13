import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface DbJob {
  id: string;
  order_number: string;
  client: string;
  product: string;
  quantity: number;
  technique_id: string;
  machine_id: string | null;
  scheduled_date: string | null;
  start_time: string | null;
  end_time: string | null;
  estimated_duration: number;
  status: 'queue' | 'ready' | 'scheduled' | 'production' | 'finished' | 'paused' | 'cancelled' | 'delayed' | 'rework';
  gravure_color: string | null;
  notes: string | null;
  actual_start_time: string | null;
  actual_end_time: string | null;
  lost_pieces: number | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface DbTechnique {
  id: string;
  name: string;
  short_name: string;
  color: string;
  setup_time: number;
}

export interface DbMachine {
  id: string;
  code: string;
  name: string;
  technique_id: string;
  is_active: boolean;
}

export function useTechniques() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['techniques'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('techniques')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as DbTechnique[];
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('techniques-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'techniques'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['techniques'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useMachines() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('*')
        .eq('is_active', true)
        .order('code');
      
      if (error) throw error;
      return data as DbMachine[];
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('machines-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'machines'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['machines'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useJobs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as DbJob[];
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('jobs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['jobs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: DbJob['status'] }) => {
      const updateData: Partial<DbJob> = { status };
      
      if (status === 'production') {
        updateData.actual_start_time = new Date().toISOString();
      } else if (status === 'finished') {
        updateData.actual_end_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', jobId);
      
      if (error) throw error;

      // Push status update to Bitrix24 (fire and forget)
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        if (projectId) {
          fetch(`https://${projectId}.supabase.co/functions/v1/bitrix24-sync?action=push`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({ jobId, status })
          }).catch(console.error);
        }
      } catch (e) {
        console.error('Bitrix24 sync error:', e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

export function useBufferStatus() {
  const { data: jobs } = useJobs();
  const { data: techniques } = useTechniques();

  if (!jobs || !techniques) {
    return { bufferByTechnique: [], isLoading: true };
  }

  const bufferByTechnique = techniques.map(technique => {
    const readyJobs = jobs.filter(
      job => job.technique_id === technique.id && job.status === 'ready'
    );
    
    const queueJobs = jobs.filter(
      job => job.technique_id === technique.id && job.status === 'queue'
    );

    return {
      technique,
      readyCount: readyJobs.length,
      queueCount: queueJobs.length,
      isHealthy: readyJobs.length >= 3,
      isCritical: readyJobs.length === 0,
      isWarning: readyJobs.length > 0 && readyJobs.length < 3,
    };
  }).filter(item => item.queueCount > 0 || item.readyCount > 0);

  return { bufferByTechnique, isLoading: false };
}
