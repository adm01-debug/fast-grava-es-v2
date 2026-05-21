import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface PendingAction {
  id: string;
  type: 'update_job' | 'register_production' | 'qr_scan';
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
}

interface CachedData {
  jobs: any[];
  machines: any[];
  techniques: any[];
  lastSyncedAt: string | null;
}

const STORAGE_KEYS = {
  PENDING_ACTIONS: 'fastgravacoes_pending_actions',
  CACHED_DATA: 'fastgravacoes_cached_data',
};

const MAX_RETRIES = 3;

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [cachedData, setCachedData] = useState<CachedData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Load pending actions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PENDING_ACTIONS);
      if (stored) {
        setPendingActions(JSON.parse(stored));
      }
    } catch (error) {
      logger.warn('Failed to parse pending actions from localStorage', error, 'useOfflineSync');
      localStorage.removeItem(STORAGE_KEYS.PENDING_ACTIONS);
    }
  }, []);

  // Load cached data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CACHED_DATA);
      if (stored) {
        const data = JSON.parse(stored) as CachedData;
        setCachedData(data);
        if (data.lastSyncedAt) {
          setLastSyncedAt(new Date(data.lastSyncedAt));
        }
      }
    } catch (error) {
      logger.warn('Failed to parse cached data from localStorage', error, 'useOfflineSync');
      localStorage.removeItem(STORAGE_KEYS.CACHED_DATA);
    }
  }, []);

  // Save pending actions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(pendingActions));
    } catch (error) {
      logger.error('Failed to persist pending actions (quota exceeded?)', error, 'useOfflineSync');
    }
  }, [pendingActions]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexão restaurada', {
        description: 'Sincronizando dados pendentes...',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Sem conexão', {
        description: 'Os dados serão salvos localmente e sincronizados quando a conexão voltar.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync pending actions when coming back online (kept in a ref to avoid
  // re-running the effect on every pendingActions/cacheData change).
  const syncRef = useRef<(() => Promise<void>) | null>(null);
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      syncRef.current?.();
    }
  }, [isOnline, pendingActions.length]);

  // Cache essential data for offline use
  const cacheData = useCallback(async () => {
    if (!isOnline) return;

    try {
      const [jobsRes, machinesRes, techniquesRes] = await Promise.all([
        supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('machines').select('*').eq('is_active', true),
        supabase.from('techniques').select('*'),
      ]);

      const newCachedData: CachedData = {
        jobs: jobsRes.data || [],
        machines: machinesRes.data || [],
        techniques: techniquesRes.data || [],
        lastSyncedAt: new Date().toISOString(),
      };

      setCachedData(newCachedData);
      setLastSyncedAt(new Date());
      localStorage.setItem(STORAGE_KEYS.CACHED_DATA, JSON.stringify(newCachedData));

    } catch (error) {
      logger.error('Failed to cache data for offline use', error, 'useOfflineSync');
    }
  }, [isOnline]);

  // Add a pending action
  const addPendingAction = useCallback((
    type: PendingAction['type'],
    payload: Record<string, unknown>
  ) => {
    const action: PendingAction = {
      id: crypto.randomUUID(),
      type,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    setPendingActions(prev => [...prev, action]);

    toast.info('Ação salva offline', {
      description: 'Será sincronizada quando a conexão voltar.',
    });

    return action.id;
  }, []);

  // Process a single pending action
  const processPendingAction = async (action: PendingAction): Promise<boolean> => {
    try {
      switch (action.type) {
        case 'update_job': {
          const { jobId, updates } = action.payload as { jobId: string; updates: Record<string, unknown> };
          const { error } = await supabase
            .from('jobs')
            .update(updates)
            .eq('id', jobId);
          if (error) throw error;
          break;
        }

        case 'register_production': {
          const { jobId, producedQuantity, lostPieces, notes, photos } = action.payload as {
            jobId: string;
            producedQuantity: number;
            lostPieces: number;
            notes?: string;
            photos?: string[];
          };
          const { error } = await supabase
            .from('jobs')
            .update({
              produced_quantity: producedQuantity,
              lost_pieces: lostPieces,
              notes,
              production_photos: photos,
              status: 'finished',
              actual_end_time: new Date().toISOString(),
            })
            .eq('id', jobId);
          if (error) throw error;
          break;
        }

        case 'qr_scan': {
          const { jobId, operatorId, action: scanAction, deviceInfo, notes } = action.payload as {
            jobId: string;
            operatorId: string;
            action: string;
            deviceInfo?: string;
            notes?: string;
          };
          const { error } = await supabase
            .from('qr_scan_history')
            .insert({
              job_id: jobId,
              operator_id: operatorId,
              action: scanAction,
              device_info: deviceInfo,
              notes,
            });
          if (error) throw error;
          break;
        }

        default:
          return false;
      }

      return true;
    } catch (error) {
      logger.warn(`Pending action ${action.type} failed (retry ${action.retryCount})`, error, 'useOfflineSync');
      return false;
    }
  };

  // Sync all pending actions
  const syncPendingActions = useCallback(async () => {
    if (!isOnline || pendingActions.length === 0 || isSyncing) return;

    setIsSyncing(true);
    let successCount = 0;
    let failCount = 0;
    const remainingActions: PendingAction[] = [];

    for (const action of pendingActions) {
      const success = await processPendingAction(action);

      if (success) {
        successCount++;
      } else {
        if (action.retryCount < MAX_RETRIES) {
          remainingActions.push({
            ...action,
            retryCount: action.retryCount + 1,
          });
        } else {
          failCount++;
        }
      }
    }

    setPendingActions(remainingActions);
    setIsSyncing(false);

    if (successCount > 0) {
      toast.success(`${successCount} ação(ões) sincronizada(s)`, {
        description: failCount > 0 ? `${failCount} falhou após tentativas` : undefined,
      });
    }

    // Refresh cache after sync
    await cacheData();
  }, [isOnline, pendingActions, isSyncing, cacheData]);

  useEffect(() => {
    syncRef.current = syncPendingActions;
  }, [syncPendingActions]);

  // Update job offline (for operators)
  const updateJobOffline = useCallback((
    jobId: string,
    updates: Record<string, unknown>
  ) => {
    if (isOnline) {
      // If online, update directly
      return supabase.from('jobs').update(updates).eq('id', jobId);
    } else {
      // If offline, queue the action
      addPendingAction('update_job', { jobId, updates });

      // Update local cache
      if (cachedData) {
        const updatedJobs = cachedData.jobs.map((job: any) => {
          const jobObj = job as { id: string };
          if (jobObj.id === jobId) {
            return { ...jobObj, ...updates };
          }
          return job;
        });

        const newCachedData = { ...cachedData, jobs: updatedJobs };
        setCachedData(newCachedData);
        localStorage.setItem(STORAGE_KEYS.CACHED_DATA, JSON.stringify(newCachedData));
      }

      return { error: null, data: null };
    }
  }, [isOnline, cachedData, addPendingAction]);

  // Register production offline
  const registerProductionOffline = useCallback((
    jobId: string,
    producedQuantity: number,
    lostPieces: number,
    notes?: string,
    photos?: string[]
  ) => {
    if (isOnline) {
      return supabase
        .from('jobs')
        .update({
          produced_quantity: producedQuantity,
          lost_pieces: lostPieces,
          notes,
          production_photos: photos,
          status: 'finished',
          actual_end_time: new Date().toISOString(),
        })
        .eq('id', jobId);
    } else {
      addPendingAction('register_production', {
        jobId,
        producedQuantity,
        lostPieces,
        notes,
        photos,
      });

      // Update local cache
      if (cachedData) {
        const updatedJobs = cachedData.jobs.map((job: any) => {
          const jobObj = job as { id: string };
          if (jobObj.id === jobId) {
            return {
              ...jobObj,
              produced_quantity: producedQuantity,
              lost_pieces: lostPieces,
              notes,
              production_photos: photos,
              status: 'finished',
            };
          }
          return job;
        });

        const newCachedData = { ...cachedData, jobs: updatedJobs };
        setCachedData(newCachedData);
        localStorage.setItem(STORAGE_KEYS.CACHED_DATA, JSON.stringify(newCachedData));
      }

      return { error: null, data: null };
    }
  }, [isOnline, cachedData, addPendingAction]);

  // Record QR scan offline
  const recordQRScanOffline = useCallback((
    jobId: string,
    operatorId: string,
    action: string,
    deviceInfo?: string,
    notes?: string
  ) => {
    if (isOnline) {
      return supabase
        .from('qr_scan_history')
        .insert({
          job_id: jobId,
          operator_id: operatorId,
          action,
          device_info: deviceInfo,
          notes,
        });
    } else {
      addPendingAction('qr_scan', {
        jobId,
        operatorId,
        action,
        deviceInfo,
        notes,
      });

      return { error: null, data: null };
    }
  }, [isOnline, addPendingAction]);

  // Get cached jobs for offline use
  const getCachedJobs = useCallback(() => {
    return cachedData?.jobs || [];
  }, [cachedData]);

  // Get cached machines for offline use
  const getCachedMachines = useCallback(() => {
    return cachedData?.machines || [];
  }, [cachedData]);

  // Get cached techniques for offline use
  const getCachedTechniques = useCallback(() => {
    return cachedData?.techniques || [];
  }, [cachedData]);

  // Clear all pending actions
  const clearPendingActions = useCallback(() => {
    setPendingActions([]);
    localStorage.removeItem(STORAGE_KEYS.PENDING_ACTIONS);
  }, []);

  // Force sync
  const forceSync = useCallback(async () => {
    if (!isOnline) {
      toast.error('Sem conexão', {
        description: 'Aguarde a conexão ser restaurada para sincronizar.',
      });
      return;
    }

    await syncPendingActions();
    await cacheData();
  }, [isOnline, syncPendingActions, cacheData]);

  return {
    // State
    isOnline,
    isSyncing,
    pendingActions,
    pendingActionsCount: pendingActions.length,
    cachedData,
    lastSyncedAt,
    hasCachedData: !!cachedData,

    // Actions
    cacheData,
    syncPendingActions,
    forceSync,
    clearPendingActions,

    // Offline operations
    updateJobOffline,
    registerProductionOffline,
    recordQRScanOffline,

    // Cached data getters
    getCachedJobs,
    getCachedMachines,
    getCachedTechniques,
  };
}
