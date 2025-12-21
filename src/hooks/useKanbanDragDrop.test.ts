import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

import { useKanbanDragDrop } from './useKanbanDragDrop';

describe('useKanbanDragDrop', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('Drag State', () => {
    it('should track dragging state', () => {
      const { result } = renderHook(() => useKanbanDragDrop());
      expect(typeof result.current.isDragging).toBe('boolean');
    });

    it('should track active item', () => {
      const { result } = renderHook(() => useKanbanDragDrop());
      expect(result.current.activeItem).toBeDefined();
    });

    it('should track over column', () => {
      const { result } = renderHook(() => useKanbanDragDrop());
      expect(result.current.overColumn).toBeDefined();
    });
  });

  describe('Handlers', () => {
    it('should have onDragStart handler', () => {
      const { result } = renderHook(() => useKanbanDragDrop());
      expect(typeof result.current.onDragStart).toBe('function');
    });

    it('should have onDragEnd handler', () => {
      const { result } = renderHook(() => useKanbanDragDrop());
      expect(typeof result.current.onDragEnd).toBe('function');
    });

    it('should have onDragOver handler', () => {
      const { result } = renderHook(() => useKanbanDragDrop());
      expect(typeof result.current.onDragOver).toBe('function');
    });

    it('should have onDragCancel handler', () => {
      const { result } = renderHook(() => useKanbanDragDrop());
      expect(typeof result.current.onDragCancel).toBe('function');
    });
  });

  describe('Column Management', () => {
    it('should have moveToColumn function', () => {
      const { result } = renderHook(() => useKanbanDragDrop());
      expect(typeof result.current.moveToColumn).toBe('function');
    });

    it('should have reorderInColumn function', () => {
      const { result } = renderHook(() => useKanbanDragDrop());
      expect(typeof result.current.reorderInColumn).toBe('function');
    });
  });

  describe('Sensors', () => {
    it('should provide sensors config', () => {
      const { result } = renderHook(() => useKanbanDragDrop());
      expect(result.current.sensors).toBeDefined();
    });
  });
});
