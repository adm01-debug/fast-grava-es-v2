import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface QuickFavorite {
  id: string;
  label: string;
  href: string;
  icon: string;
}

const DEFAULT_FAVORITES: QuickFavorite[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: 'Home' },
  { id: 'alerts', label: 'Alertas', href: '/alerts', icon: 'AlertTriangle' },
];

const AVAILABLE_SHORTCUTS: QuickFavorite[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/', icon: 'Home' },
  { id: 'daily-calendar', label: 'Calendário Diário', href: '/calendar/daily', icon: 'Calendar' },
  { id: 'weekly-calendar', label: 'Calendário Semanal', href: '/calendar/weekly', icon: 'CalendarDays' },
  { id: 'kanban', label: 'Kanban', href: '/kanban', icon: 'LayoutGrid' },
  { id: 'pending', label: 'Pendências', href: '/pending', icon: 'List' },
  { id: 'efficiency', label: 'Eficiência', href: '/efficiency', icon: 'Zap' },
  { id: 'kpis', label: 'KPIs', href: '/kpis', icon: 'BarChart3' },
  { id: 'alerts', label: 'Alertas', href: '/alerts', icon: 'AlertTriangle' },
  { id: 'knowledge', label: 'Base de Conhecimento', href: '/knowledge', icon: 'BookOpen' },
  { id: 'operator', label: 'Visão Operador', href: '/operator', icon: 'UserCircle' },
  { id: 'scanner', label: 'Scanner QR', href: '/scanner', icon: 'QrCode' },
  { id: 'assistant', label: 'Assistente IA', href: '/assistant', icon: 'Bot' },
  { id: 'machines', label: 'Máquinas', href: '/machines', icon: 'Printer' },
  { id: 'operators', label: 'Operadores', href: '/operators', icon: 'Users' },
  { id: 'new-job', label: 'Novo Agendamento', href: '/new-job', icon: 'Plus' },
];

const MAX_FAVORITES = 6;

export function useQuickFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch favorites from database
  const { data: dbFavorites, isLoading } = useQuery({
    queryKey: ['user-favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select('favorites')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching favorites:', error);
        return null;
      }
      
      return data?.favorites as unknown as QuickFavorite[] | null;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const favorites = dbFavorites ?? DEFAULT_FAVORITES;

  // Mutation to save favorites
  const saveMutation = useMutation({
    mutationFn: async (newFavorites: QuickFavorite[]) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Check if record exists
      const { data: existing } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('user_favorites')
          .update({ favorites: JSON.parse(JSON.stringify(newFavorites)) })
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_favorites')
          .insert([{
            user_id: user.id,
            favorites: JSON.parse(JSON.stringify(newFavorites)),
          }]);
        
        if (error) throw error;
      }
      
      return newFavorites;
    },
    onSuccess: (newFavorites) => {
      queryClient.setQueryData(['user-favorites', user?.id], newFavorites);
    },
  });

  const addFavorite = useCallback((shortcut: QuickFavorite) => {
    const currentFavorites = dbFavorites ?? DEFAULT_FAVORITES;
    if (currentFavorites.some(f => f.id === shortcut.id)) return;
    if (currentFavorites.length >= MAX_FAVORITES) return;
    
    const newFavorites = [...currentFavorites, shortcut];
    saveMutation.mutate(newFavorites);
  }, [dbFavorites, saveMutation]);

  const removeFavorite = useCallback((id: string) => {
    const currentFavorites = dbFavorites ?? DEFAULT_FAVORITES;
    const newFavorites = currentFavorites.filter(f => f.id !== id);
    saveMutation.mutate(newFavorites);
  }, [dbFavorites, saveMutation]);

  const reorderFavorites = useCallback((newOrder: QuickFavorite[]) => {
    saveMutation.mutate(newOrder);
  }, [saveMutation]);

  const resetToDefault = useCallback(() => {
    saveMutation.mutate(DEFAULT_FAVORITES);
  }, [saveMutation]);

  const isFavorite = useCallback((id: string) => {
    return favorites.some(f => f.id === id);
  }, [favorites]);

  return {
    favorites,
    availableShortcuts: AVAILABLE_SHORTCUTS,
    addFavorite,
    removeFavorite,
    reorderFavorites,
    resetToDefault,
    isFavorite,
    maxFavorites: MAX_FAVORITES,
    isLoading,
  };
}
