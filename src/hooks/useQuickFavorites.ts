import { useState, useEffect, useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { useAuth } from '@/contexts/AuthContext';

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

const AVAILABLE_SHORTCUTS = [
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

export function useQuickFavorites() {
  const { user } = useAuth();
  const storageKey = `quick-favorites-${user?.id || 'guest'}`;
  
  const [favorites, setFavorites] = useState<QuickFavorite[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_FAVORITES;
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : DEFAULT_FAVORITES;
  });

  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        setFavorites(DEFAULT_FAVORITES);
      }
    }
  }, [user?.id, storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(favorites));
  }, [favorites, storageKey]);

  const addFavorite = useCallback((shortcut: QuickFavorite) => {
    setFavorites(prev => {
      if (prev.some(f => f.id === shortcut.id)) return prev;
      if (prev.length >= 6) return prev; // Max 6 favorites
      return [...prev, shortcut];
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  }, []);

  const reorderFavorites = useCallback((newOrder: QuickFavorite[]) => {
    setFavorites(newOrder);
  }, []);

  const resetToDefault = useCallback(() => {
    setFavorites(DEFAULT_FAVORITES);
  }, []);

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
    maxFavorites: 6,
  };
}
