import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BufferPromotionResult {
  techniqueId: string;
  techniqueName: string;
  promotedJobs: string[];
  promotedCount: number;
}

export function useAutoBufferPromotion(options?: { showToasts?: boolean }) {
  const { showToasts = true } = options || {};
  const queryClient = useQueryClient();

  const triggerPromotion = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('auto-promote-jobs', {
        body: {}
      });

      if (error) throw error;

      if (data?.promoted?.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['jobs'] });
        if (showToasts) {
          const totalPromoted = data.promoted.reduce((sum: number, r: any) => sum + r.count, 0);
          toast.success(`${totalPromoted} job(s) promovido(s) automaticamente`, {
            description: 'O buffer de produção foi reabastecido pelo servidor.',
          });
        }
      }
      return data;
    } catch (error) {
      console.error('Failed to trigger auto-promotion:', error);
      if (showToasts) {
        toast.error('Falha ao acionar promoção automática');
      }
      return null;
    }
  }, [queryClient, showToasts]);

  return {
    triggerPromotion,
    bufferTarget: 3,
  };
}
