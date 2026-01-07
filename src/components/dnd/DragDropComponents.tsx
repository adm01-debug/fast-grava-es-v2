import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
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
import { GripVertical, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// SORTABLE ITEM
// ============================================

interface SortableItemProps {
  id: UniqueIdentifier;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  handle?: boolean;
}

export function SortableItem({
  id,
  children,
  disabled = false,
  className,
  handle = true
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        isDragging && "opacity-50 z-50",
        className
      )}
      {...(!handle ? { ...attributes, ...listeners } : {})}
    >
      {handle && (
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      {children}
    </div>
  );
}

// ============================================
// SORTABLE LIST
// ============================================

interface SortableListProps<T extends { id: UniqueIdentifier }> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  direction?: 'vertical' | 'horizontal';
  handle?: boolean;
  disabled?: boolean;
  className?: string;
  itemClassName?: string;
  overlay?: (item: T) => React.ReactNode;
}

export function SortableList<T extends { id: UniqueIdentifier }>({
  items,
  onReorder,
  renderItem,
  direction = 'vertical',
  handle = true,
  disabled = false,
  className,
  itemClassName,
  overlay
}: SortableListProps<T>) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }

    setActiveId(null);
  };

  const activeItem = activeId ? items.find(item => item.id === activeId) : null;

  const strategy = direction === 'vertical'
    ? verticalListSortingStrategy
    : horizontalListSortingStrategy;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(i => i.id)} strategy={strategy}>
        <div className={cn(
          direction === 'horizontal' ? "flex gap-2" : "flex flex-col gap-2",
          className
        )}>
          {items.map((item, index) => (
            <SortableItem
              key={item.id}
              id={item.id}
              handle={handle}
              disabled={disabled}
              className={itemClassName}
            >
              {renderItem(item, index)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem && overlay ? (
          overlay(activeItem)
        ) : activeItem ? (
          <div className="opacity-80 shadow-lg">
            {renderItem(activeItem, items.indexOf(activeItem))}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// ============================================
// KANBAN BOARD
// ============================================

interface KanbanColumn<T> {
  id: string;
  title: string;
  items: T[];
}

interface KanbanBoardProps<T extends { id: UniqueIdentifier }> {
  columns: KanbanColumn<T>[];
  onReorder: (columns: KanbanColumn<T>[]) => void;
  onMoveItem?: (itemId: UniqueIdentifier, fromColumn: string, toColumn: string) => void;
  renderItem: (item: T) => React.ReactNode;
  renderColumnHeader?: (column: KanbanColumn<T>) => React.ReactNode;
  className?: string;
  columnClassName?: string;
}

export function KanbanBoard<T extends { id: UniqueIdentifier }>({
  columns,
  onReorder,
  onMoveItem,
  renderItem,
  renderColumnHeader,
  className,
  columnClassName
}: KanbanBoardProps<T>) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findColumn = (id: UniqueIdentifier) => {
    for (const column of columns) {
      if (column.items.some(item => item.id === id)) {
        return column;
      }
    }
    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeColumn = findColumn(active.id);
    const overColumn = findColumn(over.id) || columns.find(c => c.id === over.id);

    if (!activeColumn || !overColumn) {
      setActiveId(null);
      return;
    }

    if (activeColumn.id === overColumn.id) {
      // Reorder within same column
      const oldIndex = activeColumn.items.findIndex(i => i.id === active.id);
      const newIndex = activeColumn.items.findIndex(i => i.id === over.id);
      
      if (oldIndex !== newIndex) {
        const newColumns = columns.map(col => {
          if (col.id === activeColumn.id) {
            return {
              ...col,
              items: arrayMove(col.items, oldIndex, newIndex)
            };
          }
          return col;
        });
        onReorder(newColumns);
      }
    } else {
      // Move to different column
      onMoveItem?.(active.id, activeColumn.id, overColumn.id);
    }

    setActiveId(null);
  };

  const activeItem = activeId
    ? columns.flatMap(c => c.items).find(i => i.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => setActiveId(e.active.id)}
      onDragEnd={handleDragEnd}
    >
      <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
        {columns.map(column => (
          <div
            key={column.id}
            className={cn(
              "flex-shrink-0 w-72 bg-muted/50 rounded-lg p-3",
              columnClassName
            )}
          >
            {renderColumnHeader ? (
              renderColumnHeader(column)
            ) : (
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{column.title}</h3>
                <span className="text-sm text-muted-foreground">
                  {column.items.length}
                </span>
              </div>
            )}

            <SortableContext
              items={column.items.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 min-h-[100px]">
                {column.items.map(item => (
                  <SortableItem key={item.id} id={item.id} handle={false}>
                    {renderItem(item)}
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeItem && (
          <div className="opacity-90 shadow-xl">
            {renderItem(activeItem)}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// ============================================
// TAG INPUT WITH DND
// ============================================

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  allowDuplicates?: boolean;
  className?: string;
}

export function TagInput({
  tags,
  onChange,
  placeholder = "Adicionar tag...",
  maxTags,
  allowDuplicates = false,
  className
}: TagInputProps) {
  const [input, setInput] = useState('');

  const tagItems = tags.map((tag, i) => ({ id: `${tag}-${i}`, value: tag }));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (maxTags && tags.length >= maxTags) return;
      if (!allowDuplicates && tags.includes(input.trim())) return;
      onChange([...tags, input.trim()]);
      setInput('');
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleReorder = (newItems: { id: string; value: string }[]) => {
    onChange(newItems.map(item => item.value));
  };

  return (
    <div className={cn(
      "flex flex-wrap gap-2 p-2 border rounded-lg bg-background min-h-[42px]",
      className
    )}>
      <SortableList
        items={tagItems}
        onReorder={handleReorder}
        direction="horizontal"
        handle={false}
        renderItem={(item, index) => (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm cursor-move">
            {item.value}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              className="hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
        className="flex-wrap"
      />
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-sm"
        disabled={maxTags !== undefined && tags.length >= maxTags}
      />
    </div>
  );
}

// ============================================
// HOOK: useDragAndDrop
// ============================================

export function useDragAndDrop<T extends { id: UniqueIdentifier }>(
  initialItems: T[]
) {
  const [items, setItems] = useState(initialItems);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const handleReorder = useCallback((newItems: T[]) => {
    setItems(newItems);
  }, []);

  const moveItem = useCallback((fromIndex: number, toIndex: number) => {
    setItems(prev => arrayMove(prev, fromIndex, toIndex));
  }, []);

  const addItem = useCallback((item: T, index?: number) => {
    setItems(prev => {
      if (index !== undefined) {
        const newItems = [...prev];
        newItems.splice(index, 0, item);
        return newItems;
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: UniqueIdentifier) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateItem = useCallback((id: UniqueIdentifier, updates: Partial<T>) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const activeItem = activeId ? items.find(item => item.id === activeId) : null;

  return {
    items,
    setItems,
    activeId,
    setActiveId,
    activeItem,
    handleReorder,
    moveItem,
    addItem,
    removeItem,
    updateItem
  };
}
