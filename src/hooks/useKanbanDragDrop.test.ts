import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKanbanDragDrop } from './useKanbanDragDrop';

// Mock data
const mockColumns = [
  { id: 'pending', title: 'Pendente', items: [{ id: '1', title: 'Job 1' }, { id: '2', title: 'Job 2' }] },
  { id: 'in_progress', title: 'Em Andamento', items: [{ id: '3', title: 'Job 3' }] },
  { id: 'completed', title: 'Concluído', items: [] },
];

// Mock callbacks
const mockOnDragEnd = vi.fn();
const mockOnStatusChange = vi.fn();

describe('useKanbanDragDrop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with provided columns', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      expect(result.current.columns).toEqual(mockColumns);
    });

    it('should have no dragging state initially', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      expect(result.current.isDragging).toBe(false);
      expect(result.current.draggedItem).toBeNull();
    });

    it('should have no active column initially', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      expect(result.current.activeColumn).toBeNull();
    });
  });

  describe('Drag Start', () => {
    it('should set dragging state on drag start', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.handleDragStart({ id: '1', title: 'Job 1' }, 'pending');
      });

      expect(result.current.isDragging).toBe(true);
      expect(result.current.draggedItem).toEqual({ id: '1', title: 'Job 1' });
      expect(result.current.sourceColumn).toBe('pending');
    });

    it('should add dragging class to item', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.handleDragStart({ id: '1', title: 'Job 1' }, 'pending');
      });

      expect(result.current.getDragItemProps('1').className).toContain('dragging');
    });
  });

  describe('Drag Over', () => {
    it('should update active column on drag over', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.handleDragStart({ id: '1', title: 'Job 1' }, 'pending');
      });

      act(() => {
        result.current.handleDragOver('in_progress');
      });

      expect(result.current.activeColumn).toBe('in_progress');
    });

    it('should highlight drop zone', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.handleDragStart({ id: '1', title: 'Job 1' }, 'pending');
      });

      act(() => {
        result.current.handleDragOver('in_progress');
      });

      expect(result.current.getColumnProps('in_progress').isDropTarget).toBe(true);
    });
  });

  describe('Drop', () => {
    it('should move item to new column on drop', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.handleDragStart({ id: '1', title: 'Job 1' }, 'pending');
      });

      act(() => {
        result.current.handleDrop('in_progress');
      });

      const pendingColumn = result.current.columns.find(c => c.id === 'pending');
      const inProgressColumn = result.current.columns.find(c => c.id === 'in_progress');

      expect(pendingColumn?.items.find(i => i.id === '1')).toBeUndefined();
      expect(inProgressColumn?.items.find(i => i.id === '1')).toBeDefined();
    });

    it('should call onDragEnd callback', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.handleDragStart({ id: '1', title: 'Job 1' }, 'pending');
      });

      act(() => {
        result.current.handleDrop('in_progress');
      });

      expect(mockOnDragEnd).toHaveBeenCalledWith({
        itemId: '1',
        sourceColumn: 'pending',
        destinationColumn: 'in_progress',
        item: { id: '1', title: 'Job 1' },
      });
    });

    it('should reset dragging state after drop', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.handleDragStart({ id: '1', title: 'Job 1' }, 'pending');
      });

      act(() => {
        result.current.handleDrop('in_progress');
      });

      expect(result.current.isDragging).toBe(false);
      expect(result.current.draggedItem).toBeNull();
    });

    it('should not move if dropped on same column', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      const initialPendingItems = [...mockColumns[0].items];

      act(() => {
        result.current.handleDragStart({ id: '1', title: 'Job 1' }, 'pending');
      });

      act(() => {
        result.current.handleDrop('pending');
      });

      const pendingColumn = result.current.columns.find(c => c.id === 'pending');
      expect(pendingColumn?.items.length).toBe(initialPendingItems.length);
    });
  });

  describe('Drag Cancel', () => {
    it('should reset state on drag cancel', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.handleDragStart({ id: '1', title: 'Job 1' }, 'pending');
      });

      act(() => {
        result.current.handleDragCancel();
      });

      expect(result.current.isDragging).toBe(false);
      expect(result.current.draggedItem).toBeNull();
      expect(result.current.activeColumn).toBeNull();
    });

    it('should not modify columns on cancel', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.handleDragStart({ id: '1', title: 'Job 1' }, 'pending');
      });

      act(() => {
        result.current.handleDragOver('in_progress');
      });

      act(() => {
        result.current.handleDragCancel();
      });

      expect(result.current.columns).toEqual(mockColumns);
    });
  });

  describe('Reorder Within Column', () => {
    it('should reorder items within same column', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.reorderInColumn('pending', 0, 1);
      });

      const pendingColumn = result.current.columns.find(c => c.id === 'pending');
      expect(pendingColumn?.items[0].id).toBe('2');
      expect(pendingColumn?.items[1].id).toBe('1');
    });

    it('should handle invalid indices gracefully', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      const initialColumns = JSON.stringify(result.current.columns);

      act(() => {
        result.current.reorderInColumn('pending', -1, 100);
      });

      expect(JSON.stringify(result.current.columns)).toBe(initialColumns);
    });
  });

  describe('Column Operations', () => {
    it('should add new column', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.addColumn({ id: 'review', title: 'Em Revisão', items: [] });
      });

      expect(result.current.columns.length).toBe(4);
      expect(result.current.columns.find(c => c.id === 'review')).toBeDefined();
    });

    it('should remove column', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.removeColumn('completed');
      });

      expect(result.current.columns.length).toBe(2);
      expect(result.current.columns.find(c => c.id === 'completed')).toBeUndefined();
    });

    it('should update column title', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.updateColumnTitle('pending', 'Aguardando');
      });

      const pendingColumn = result.current.columns.find(c => c.id === 'pending');
      expect(pendingColumn?.title).toBe('Aguardando');
    });
  });

  describe('Item Operations', () => {
    it('should add item to column', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.addItem('pending', { id: '4', title: 'Job 4' });
      });

      const pendingColumn = result.current.columns.find(c => c.id === 'pending');
      expect(pendingColumn?.items.find(i => i.id === '4')).toBeDefined();
    });

    it('should remove item from column', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.removeItem('pending', '1');
      });

      const pendingColumn = result.current.columns.find(c => c.id === 'pending');
      expect(pendingColumn?.items.find(i => i.id === '1')).toBeUndefined();
    });

    it('should update item', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.updateItem('pending', '1', { title: 'Updated Job 1' });
      });

      const pendingColumn = result.current.columns.find(c => c.id === 'pending');
      const item = pendingColumn?.items.find(i => i.id === '1');
      expect(item?.title).toBe('Updated Job 1');
    });
  });

  describe('Accessibility', () => {
    it('should provide keyboard navigation props', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      const itemProps = result.current.getDragItemProps('1');
      expect(itemProps.tabIndex).toBeDefined();
      expect(itemProps.role).toBe('listitem');
    });

    it('should provide column aria attributes', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      const columnProps = result.current.getColumnProps('pending');
      expect(columnProps.role).toBe('list');
      expect(columnProps['aria-label']).toBeDefined();
    });
  });

  describe('Touch Support', () => {
    it('should handle touch start', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.handleTouchStart({ id: '1', title: 'Job 1' }, 'pending');
      });

      expect(result.current.isDragging).toBe(true);
    });

    it('should handle touch move', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.handleTouchStart({ id: '1', title: 'Job 1' }, 'pending');
      });

      act(() => {
        result.current.handleTouchMove('in_progress');
      });

      expect(result.current.activeColumn).toBe('in_progress');
    });

    it('should handle touch end', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
        })
      );

      act(() => {
        result.current.handleTouchStart({ id: '1', title: 'Job 1' }, 'pending');
      });

      act(() => {
        result.current.handleTouchMove('in_progress');
      });

      act(() => {
        result.current.handleTouchEnd();
      });

      expect(result.current.isDragging).toBe(false);
      expect(mockOnDragEnd).toHaveBeenCalled();
    });
  });

  describe('Undo/Redo', () => {
    it('should support undo', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
          enableHistory: true,
        })
      );

      act(() => {
        result.current.handleDragStart({ id: '1', title: 'Job 1' }, 'pending');
      });

      act(() => {
        result.current.handleDrop('in_progress');
      });

      act(() => {
        result.current.undo();
      });

      const pendingColumn = result.current.columns.find(c => c.id === 'pending');
      expect(pendingColumn?.items.find(i => i.id === '1')).toBeDefined();
    });

    it('should support redo', () => {
      const { result } = renderHook(() =>
        useKanbanDragDrop({
          initialColumns: mockColumns,
          onDragEnd: mockOnDragEnd,
          enableHistory: true,
        })
      );

      act(() => {
        result.current.handleDragStart({ id: '1', title: 'Job 1' }, 'pending');
      });

      act(() => {
        result.current.handleDrop('in_progress');
      });

      act(() => {
        result.current.undo();
      });

      act(() => {
        result.current.redo();
      });

      const inProgressColumn = result.current.columns.find(c => c.id === 'in_progress');
      expect(inProgressColumn?.items.find(i => i.id === '1')).toBeDefined();
    });
  });
});
