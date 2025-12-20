import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

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

import { useDashboardLayout } from './useDashboardLayout';

describe('useDashboardLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('Layout State', () => {
    it('should return default layout', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(result.current.layout).toBeDefined();
      expect(Array.isArray(result.current.layout)).toBe(true);
    });

    it('should have widgets array', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(result.current.widgets).toBeDefined();
    });

    it('should track edit mode', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.isEditing).toBe('boolean');
    });
  });

  describe('Layout Management', () => {
    it('should have setLayout function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.setLayout).toBe('function');
    });

    it('should have resetLayout function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.resetLayout).toBe('function');
    });

    it('should have saveLayout function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.saveLayout).toBe('function');
    });
  });

  describe('Widget Management', () => {
    it('should have addWidget function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.addWidget).toBe('function');
    });

    it('should have removeWidget function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.removeWidget).toBe('function');
    });

    it('should have updateWidget function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.updateWidget).toBe('function');
    });

    it('should have toggleWidget function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.toggleWidget).toBe('function');
    });
  });

  describe('Edit Mode', () => {
    it('should have toggleEditMode function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.toggleEditMode).toBe('function');
    });

    it('should toggle edit mode', () => {
      const { result } = renderHook(() => useDashboardLayout());

      const initialEditMode = result.current.isEditing;

      act(() => {
        result.current.toggleEditMode();
      });

      expect(result.current.isEditing).toBe(!initialEditMode);
    });

    it('should have enterEditMode function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.enterEditMode).toBe('function');
    });

    it('should have exitEditMode function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.exitEditMode).toBe('function');
    });
  });

  describe('Drag and Drop', () => {
    it('should have onDragStart function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.onDragStart).toBe('function');
    });

    it('should have onDragEnd function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.onDragEnd).toBe('function');
    });

    it('should have moveWidget function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.moveWidget).toBe('function');
    });

    it('should have reorderWidgets function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.reorderWidgets).toBe('function');
    });
  });

  describe('Persistence', () => {
    it('should save layout to localStorage', () => {
      const { result } = renderHook(() => useDashboardLayout());

      act(() => {
        result.current.saveLayout();
      });

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should load layout from localStorage', () => {
      const savedLayout = JSON.stringify([{ id: 'test', x: 0, y: 0, w: 2, h: 2 }]);
      localStorageMock.getItem.mockReturnValue(savedLayout);

      const { result } = renderHook(() => useDashboardLayout());

      expect(result.current.layout).toBeDefined();
    });
  });

  describe('Presets', () => {
    it('should have availablePresets', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(result.current.availablePresets).toBeDefined();
    });

    it('should have applyPreset function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.applyPreset).toBe('function');
    });

    it('should have saveAsPreset function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.saveAsPreset).toBe('function');
    });
  });

  describe('Responsive', () => {
    it('should track current breakpoint', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(result.current.currentBreakpoint).toBeDefined();
    });

    it('should have cols config', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(result.current.cols).toBeDefined();
    });

    it('should have breakpoints config', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(result.current.breakpoints).toBeDefined();
    });
  });

  describe('Widget Visibility', () => {
    it('should have visibleWidgets array', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(result.current.visibleWidgets).toBeDefined();
    });

    it('should have hiddenWidgets array', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(result.current.hiddenWidgets).toBeDefined();
    });

    it('should have showWidget function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.showWidget).toBe('function');
    });

    it('should have hideWidget function', () => {
      const { result } = renderHook(() => useDashboardLayout());

      expect(typeof result.current.hideWidget).toBe('function');
    });
  });
});
