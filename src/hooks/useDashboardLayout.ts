import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface WidgetConfig {
  id: string;
  title: string;
  section: 'main' | 'sidebar' | 'efficiency' | 'bottom';
  visible: boolean;
  order: number;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'occupancy', title: 'Ocupação por Técnica', section: 'main', visible: true, order: 0 },
  { id: 'buffer', title: 'Status do Buffer', section: 'sidebar', visible: true, order: 0 },
  { id: 'conflicts', title: 'Alertas de Conflitos', section: 'sidebar', visible: true, order: 1 },
  { id: 'alerts', title: 'Alertas', section: 'sidebar', visible: true, order: 2 },
  { id: 'sequencing', title: 'Sequenciamento Inteligente', section: 'efficiency', visible: true, order: 0 },
  { id: 'loadbalancing', title: 'Balanceamento de Carga', section: 'efficiency', visible: true, order: 1 },
  { id: 'bottleneck', title: 'Previsão de Gargalos', section: 'efficiency', visible: true, order: 2 },
  { id: 'timeline', title: 'Timeline de Hoje', section: 'bottom', visible: true, order: 0 },
  { id: 'jobs', title: 'Jobs Recentes', section: 'bottom', visible: true, order: 1 },
];

const STORAGE_KEY = 'dashboard-layout';

export function useDashboardLayout() {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load layout from localStorage on mount
  useEffect(() => {
    const storageKey = user ? `${STORAGE_KEY}-${user.id}` : STORAGE_KEY;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as WidgetConfig[];
        // Merge with defaults to handle new widgets
        const merged = DEFAULT_WIDGETS.map(defaultWidget => {
          const savedWidget = parsed.find(w => w.id === defaultWidget.id);
          return savedWidget ? { ...defaultWidget, ...savedWidget } : defaultWidget;
        });
        setWidgets(merged);
      } catch {
        setWidgets(DEFAULT_WIDGETS);
      }
    }
  }, [user]);

  // Save layout to localStorage
  const saveLayout = useCallback((newWidgets: WidgetConfig[]) => {
    const storageKey = user ? `${STORAGE_KEY}-${user.id}` : STORAGE_KEY;
    localStorage.setItem(storageKey, JSON.stringify(newWidgets));
    setWidgets(newWidgets);
  }, [user]);

  // Reorder widgets within a section
  const reorderWidgets = useCallback((section: WidgetConfig['section'], activeId: string, overId: string) => {
    const sectionWidgets = widgets.filter(w => w.section === section);
    const activeIndex = sectionWidgets.findIndex(w => w.id === activeId);
    const overIndex = sectionWidgets.findIndex(w => w.id === overId);

    if (activeIndex === -1 || overIndex === -1) return;

    const newSectionWidgets = [...sectionWidgets];
    const [removed] = newSectionWidgets.splice(activeIndex, 1);
    newSectionWidgets.splice(overIndex, 0, removed);

    // Update order for section widgets
    const reordered = newSectionWidgets.map((w, index) => ({ ...w, order: index }));

    // Merge back with other sections
    const otherWidgets = widgets.filter(w => w.section !== section);
    const newWidgets = [...otherWidgets, ...reordered];

    saveLayout(newWidgets);
  }, [widgets, saveLayout]);

  // Toggle widget visibility
  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    const newWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    );
    saveLayout(newWidgets);
  }, [widgets, saveLayout]);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    saveLayout(DEFAULT_WIDGETS);
  }, [saveLayout]);

  // Get widgets for a specific section, sorted by order
  const getWidgetsBySection = useCallback((section: WidgetConfig['section']) => {
    return widgets
      .filter(w => w.section === section && w.visible)
      .sort((a, b) => a.order - b.order);
  }, [widgets]);

  return {
    widgets,
    isEditMode,
    setIsEditMode,
    reorderWidgets,
    toggleWidgetVisibility,
    resetLayout,
    getWidgetsBySection,
  };
}
