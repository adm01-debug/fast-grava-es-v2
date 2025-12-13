import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface SyncResult {
  synced?: string[];
  errors?: string[];
  total?: number;
  success?: boolean;
  skipped?: boolean;
  error?: string;
}

export const useBitrix24Sync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const callBitrixSync = useCallback(async (action: string, body?: any): Promise<SyncResult> => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const url = `https://${projectId}.supabase.co/functions/v1/bitrix24-sync?action=${action}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sync failed');
    }

    return response.json();
  }, []);

  const testConnection = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await callBitrixSync('test');
      toast({
        title: 'Conexão OK',
        description: 'Conexão com Bitrix24 estabelecida com sucesso.'
      });
      return result;
    } catch (error: any) {
      toast({
        title: 'Erro de conexão',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callBitrixSync, toast]);

  const pullFromBitrix = useCallback(async (categoryId?: string) => {
    setIsLoading(true);
    try {
      const result = await callBitrixSync('pull', { categoryId });
      
      setLastSync(new Date());
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      toast({
        title: 'Sincronização concluída',
        description: `${result.synced?.length || 0} jobs sincronizados do Bitrix24.`
      });
      
      return result;
    } catch (error: any) {
      toast({
        title: 'Erro na sincronização',
        description: error.message,
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callBitrixSync, toast, queryClient]);

  const pushToBitrix = useCallback(async (jobId: string, status: string) => {
    try {
      const result = await callBitrixSync('push', { jobId, status });
      
      if (!result.skipped) {
        toast({
          title: 'Status atualizado',
          description: 'Status sincronizado com Bitrix24.'
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('Bitrix24 push error:', error);
      // Don't show error toast for non-Bitrix jobs
      return { error: error.message };
    }
  }, [callBitrixSync, toast]);

  return {
    isLoading,
    lastSync,
    testConnection,
    pullFromBitrix,
    pushToBitrix
  };
};
