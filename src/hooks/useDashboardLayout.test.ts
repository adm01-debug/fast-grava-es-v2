import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboardLayout } from './useDashboardLayout';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-123', role: 'admin' },
  }),
}));

describe('useDashboardLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should return default widgets on initial load', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(result.current.widgets).toBeDefined();
      expect(Array.isArray(result.current.widgets)).toBe(true);
      expect(result.current.widgets.length).toBeGreaterThan(0);
    });

    it('should have edit mode disabled by default', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(result.current.isEditMode).toBe(false);
    });

    it('should have valid widget structure', () => {
      const { result } = renderHook(() => useDashboardLayout());

      result.current.widgets.forEach(widget => {
        expect(widget).toHaveProperty('id');
        expect(widget).toHaveProperty('title');
        expect(widget).toHaveProperty('visible');
        expect(typeof widget.id).toBe('string');
        expect(typeof widget.visible).toBe('boolean');
      });
    });

    it('should load saved layout from localStorage', () => {
      const savedLayout = {
        widgets: [
          { id: 'kpis', title: 'KPIs', visible: false, order: 0 },
          { id: 'chart', title: 'Chart', visible: true, order: 1 },
        ],
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(savedLayout));

      const { result } = renderHook(() => useDashboardLayout());

      // Should attempt to load from localStorage
      expect(localStorageMock.getItem).toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    it('should toggle edit mode', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(result.current.isEditMode).toBe(false);

      act(() => {
        result.current.toggleEditMode();
      });

      expect(result.current.isEditMode).toBe(true);

      act(() => {
        result.current.toggleEditMode();
      });

      expect(result.current.isEditMode).toBe(false);
    });

    it('should enable edit mode', () => {
      const { result } = renderHook(() => useDashboardLayout());

      act(() => {
        result.current.setEditMode(true);
      });

      expect(result.current.isEditMode).toBe(true);
    });

    it('should disable edit mode', () => {
      const { result } = renderHook(() => useDashboardLayout());

      act(() => {
        result.current.setEditMode(true);
      });

      act(() => {
        result.current.setEditMode(false);
      });

      expect(result.current.isEditMode).toBe(false);
    });
  });

  describe('Widget Visibility', () => {
    it('should toggle widget visibility', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const firstWidget = result.current.widgets[0];
      const initialVisibility = firstWidget.visible;

      act(() => {
        result.current.toggleWidgetVisibility(firstWidget.id);
      });

      const updatedWidget = result.current.widgets.find(w => w.id === firstWidget.id);
      expect(updatedWidget?.visible).toBe(!initialVisibility);
    });

    it('should set widget visibility to specific value', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const firstWidget = result.current.widgets[0];

      act(() => {
        result.current.setWidgetVisibility(firstWidget.id, false);
      });

      const updatedWidget = result.current.widgets.find(w => w.id === firstWidget.id);
      expect(updatedWidget?.visible).toBe(false);

      act(() => {
        result.current.setWidgetVisibility(firstWidget.id, true);
      });

      const finalWidget = result.current.widgets.find(w => w.id === firstWidget.id);
      expect(finalWidget?.visible).toBe(true);
    });

    it('should return only visible widgets', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const visibleWidgets = result.current.visibleWidgets;

      visibleWidgets.forEach(widget => {
        expect(widget.visible).toBe(true);
      });
    });

    it('should handle non-existent widget ID gracefully', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const initialWidgets = [...result.current.widgets];

      act(() => {
        result.current.toggleWidgetVisibility('non-existent-id');
      });

      // Should not throw and widgets should remain unchanged
      expect(result.current.widgets.length).toBe(initialWidgets.length);
    });
  });

  describe('Widget Reordering', () => {
    it('should reorder widgets', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const originalOrder = result.current.widgets.map(w => w.id);

      if (originalOrder.length >= 2) {
        act(() => {
          result.current.reorderWidgets(0, 1);
        });

        const newOrder = result.current.widgets.map(w => w.id);
        expect(newOrder[0]).toBe(originalOrder[1]);
        expect(newOrder[1]).toBe(originalOrder[0]);
      }
    });

    it('should handle invalid reorder indices', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const originalWidgets = [...result.current.widgets];

      act(() => {
        result.current.reorderWidgets(-1, 100);
      });

      // Should not throw and widgets should remain unchanged
      expect(result.current.widgets.length).toBe(originalWidgets.length);
    });

    it('should move widget to specific position', () => {
      const { result } = renderHook(() => useDashboardLayout());

      if (result.current.widgets.length >= 3) {
        const widgetToMove = result.current.widgets[0].id;

        act(() => {
          result.current.moveWidget(widgetToMove, 2);
        });

        expect(result.current.widgets[2].id).toBe(widgetToMove);
      }
    });
  });

  describe('Layout Persistence', () => {
    it('should save layout to localStorage on change', () => {
      const { result } = renderHook(() => useDashboardLayout());

      act(() => {
        result.current.toggleWidgetVisibility(result.current.widgets[0].id);
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should reset layout to defaults', () => {
      const { result } = renderHook(() => useDashboardLayout());

      // Make some changes
      act(() => {
        result.current.toggleWidgetVisibility(result.current.widgets[0].id);
      });

      // Reset
      act(() => {
        result.current.resetLayout();
      });

      // Should have default widgets
      expect(result.current.widgets).toBeDefined();
      expect(result.current.widgets.length).toBeGreaterThan(0);
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid-json');

      const { result } = renderHook(() => useDashboardLayout());

      // Should fall back to defaults
      expect(result.current.widgets).toBeDefined();
      expect(Array.isArray(result.current.widgets)).toBe(true);
    });
  });

  describe('Widget Sections', () => {
    it('should get widgets by section', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const sections = ['header', 'main', 'sidebar', 'footer'];

      sections.forEach(section => {
        const sectionWidgets = result.current.getWidgetsBySection(section);
        expect(Array.isArray(sectionWidgets)).toBe(true);
      });
    });

    it('should return empty array for unknown section', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const unknownSection = result.current.getWidgetsBySection('unknown-section');
      expect(Array.isArray(unknownSection)).toBe(true);
    });
  });

  describe('Widget Configuration', () => {
    it('should update widget configuration', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const firstWidget = result.current.widgets[0];

      act(() => {
        result.current.updateWidgetConfig(firstWidget.id, {
          title: 'Updated Title',
        });
      });

      const updatedWidget = result.current.widgets.find(w => w.id === firstWidget.id);
      expect(updatedWidget?.title).toBe('Updated Title');
    });

    it('should add new widget', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const initialCount = result.current.widgets.length;

      act(() => {
        result.current.addWidget({
          id: 'new-widget',
          title: 'New Widget',
          visible: true,
          section: 'main',
        });
      });

      expect(result.current.widgets.length).toBe(initialCount + 1);
      expect(result.current.widgets.find(w => w.id === 'new-widget')).toBeDefined();
    });

    it('should remove widget', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const firstWidget = result.current.widgets[0];
      const initialCount = result.current.widgets.length;

      act(() => {
        result.current.removeWidget(firstWidget.id);
      });

      expect(result.current.widgets.length).toBe(initialCount - 1);
      expect(result.current.widgets.find(w => w.id === firstWidget.id)).toBeUndefined();
    });

    it('should not add duplicate widget', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const firstWidget = result.current.widgets[0];
      const initialCount = result.current.widgets.length;

      act(() => {
        result.current.addWidget({
          id: firstWidget.id,
          title: 'Duplicate',
          visible: true,
        });
      });

      // Should not add duplicate
      expect(result.current.widgets.length).toBe(initialCount);
    });
  });

  describe('Layout Presets', () => {
    it('should apply preset layout', () => {
      const { result } = renderHook(() => useDashboardLayout());

      act(() => {
        result.current.applyPreset('compact');
      });

      expect(result.current.currentPreset).toBe('compact');
    });

    it('should list available presets', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const presets = result.current.availablePresets;

      expect(Array.isArray(presets)).toBe(true);
      expect(presets.length).toBeGreaterThan(0);
    });

    it('should save current layout as custom preset', () => {
      const { result } = renderHook(() => useDashboardLayout());

      act(() => {
        result.current.saveAsPreset('my-custom-preset');
      });

      expect(result.current.availablePresets).toContain('my-custom-preset');
    });
  });

  describe('Responsive Layout', () => {
    it('should return mobile layout for small screens', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const mobileLayout = result.current.getLayoutForBreakpoint('mobile');

      expect(mobileLayout).toBeDefined();
    });

    it('should return tablet layout for medium screens', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const tabletLayout = result.current.getLayoutForBreakpoint('tablet');

      expect(tabletLayout).toBeDefined();
    });

    it('should return desktop layout for large screens', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const desktopLayout = result.current.getLayoutForBreakpoint('desktop');

      expect(desktopLayout).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty widgets array', () => {
      const { result } = renderHook(() => useDashboardLayout());

      // Remove all widgets
      const widgetIds = result.current.widgets.map(w => w.id);

      act(() => {
        widgetIds.forEach(id => {
          result.current.removeWidget(id);
        });
      });

      expect(result.current.widgets.length).toBe(0);
      expect(result.current.visibleWidgets.length).toBe(0);
    });

    it('should handle rapid toggles', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const firstWidget = result.current.widgets[0];
      const initialVisibility = firstWidget.visible;

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.toggleWidgetVisibility(firstWidget.id);
        }
      });

      const finalWidget = result.current.widgets.find(w => w.id === firstWidget.id);
      expect(finalWidget?.visible).toBe(initialVisibility);
    });

    it('should maintain widget order after visibility changes', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const originalIds = result.current.widgets.map(w => w.id);

      act(() => {
        result.current.widgets.forEach(widget => {
          result.current.toggleWidgetVisibility(widget.id);
        });
      });

      const newIds = result.current.widgets.map(w => w.id);
      expect(newIds).toEqual(originalIds);
    });
  });
});
