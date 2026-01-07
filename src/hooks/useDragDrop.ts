import { useState, useCallback, useRef } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent, 
  DragOverEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

// Types
export interface DraggableItem {
  id: string;
  [key: string]: unknown;
}

interface UseDragDropOptions<T extends DraggableItem> {
  items: T[];
  onReorder: (items: T[]) => void;
  onDragStart?: (item: T) => void;
  onDragEnd?: (item: T, newIndex: number) => void;
}

// Hook for drag and drop
export function useDragDrop<T extends DraggableItem>({
  items,
  onReorder,
  onDragStart,
  onDragEnd,
}: UseDragDropOptions<T>) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
    const item = items.find((i) => i.id === event.active.id);
    if (item) {
      onDragStart?.(item);
    }
  }, [items, onDragStart]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);

      const item = items.find((i) => i.id === active.id);
      if (item) {
        onDragEnd?.(item, newIndex);
      }
    }

    setActiveId(null);
  }, [items, onReorder, onDragEnd]);

  const activeItem = items.find((i) => i.id === activeId);

  return {
    sensors,
    activeId,
    activeItem,
    handleDragStart,
    handleDragEnd,
  };
}

// Sortable item hook wrapper
export function useSortableItem(id: string) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return {
    ref: setNodeRef,
    style,
    isDragging,
    dragProps: { ...attributes, ...listeners },
  };
}

// Kanban specific hook
interface KanbanColumn<T extends DraggableItem> {
  id: string;
  title: string;
  items: T[];
}

interface UseKanbanOptions<T extends DraggableItem> {
  columns: KanbanColumn<T>[];
  onMoveItem: (itemId: string, fromColumn: string, toColumn: string, newIndex: number) => void;
  onReorderInColumn: (columnId: string, items: T[]) => void;
}

export function useKanban<T extends DraggableItem>({
  columns,
  onMoveItem,
  onReorderInColumn,
}: UseKanbanOptions<T>) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumn = useCallback((id: UniqueIdentifier) => {
    for (const column of columns) {
      if (column.items.some((item) => item.id === id)) {
        return column.id;
      }
    }
    return null;
  }, [columns]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
    setActiveColumn(findColumn(event.active.id));
  }, [findColumn]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeColumnId = findColumn(active.id);
    const overColumnId = findColumn(over.id) || over.id.toString();

    if (activeColumnId && overColumnId && activeColumnId !== overColumnId) {
      // Moving between columns
      const overColumn = columns.find((c) => c.id === overColumnId);
      if (overColumn) {
        const overIndex = over.id === overColumnId 
          ? overColumn.items.length 
          : overColumn.items.findIndex((i) => i.id === over.id);
        
        onMoveItem(active.id.toString(), activeColumnId, overColumnId, overIndex);
      }
    }
  }, [columns, findColumn, onMoveItem]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const columnId = findColumn(active.id);
      if (columnId) {
        const column = columns.find((c) => c.id === columnId);
        if (column) {
          const oldIndex = column.items.findIndex((i) => i.id === active.id);
          const newIndex = column.items.findIndex((i) => i.id === over.id);
          
          if (oldIndex !== -1 && newIndex !== -1) {
            onReorderInColumn(columnId, arrayMove(column.items, oldIndex, newIndex));
          }
        }
      }
    }

    setActiveId(null);
    setActiveColumn(null);
  }, [columns, findColumn, onReorderInColumn]);

  const getActiveItem = useCallback(() => {
    if (!activeId) return null;
    for (const column of columns) {
      const item = column.items.find((i) => i.id === activeId);
      if (item) return item;
    }
    return null;
  }, [activeId, columns]);

  return {
    sensors,
    activeId,
    activeColumn,
    activeItem: getActiveItem(),
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}

// Re-export dnd-kit components for convenience
export {
  DndContext,
  DragOverlay,
  SortableContext,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  closestCenter,
};
