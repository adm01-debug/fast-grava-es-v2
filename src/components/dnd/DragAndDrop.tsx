import * as React from 'react';
import { motion, Reorder, useDragControls, AnimatePresence } from 'framer-motion';
import { GripVertical, Trash2, Edit2, MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Reorderable list item
interface DraggableItem {
  id: string;
  [key: string]: any;
}

interface ReorderableListProps<T extends DraggableItem> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  onDelete?: (item: T) => void;
  onEdit?: (item: T) => void;
  className?: string;
  itemClassName?: string;
  dragHandleClassName?: string;
  showActions?: boolean;
}

export function ReorderableList<T extends DraggableItem>({
  items,
  onReorder,
  renderItem,
  onDelete,
  onEdit,
  className,
  itemClassName,
  dragHandleClassName,
  showActions = true,
}: ReorderableListProps<T>) {
  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={onReorder}
      className={cn("space-y-2", className)}
    >
      <AnimatePresence>
        {items.map((item, index) => (
          <ReorderableItem
            key={item.id}
            item={item}
            index={index}
            renderContent={renderItem}
            onDelete={onDelete}
            onEdit={onEdit}
            className={itemClassName}
            dragHandleClassName={dragHandleClassName}
            showActions={showActions}
          />
        ))}
      </AnimatePresence>
    </Reorder.Group>
  );
}

interface ReorderableItemProps<T extends DraggableItem> {
  item: T;
  index: number;
  renderContent: (item: T, index: number) => React.ReactNode;
  onDelete?: (item: T) => void;
  onEdit?: (item: T) => void;
  className?: string;
  dragHandleClassName?: string;
  showActions?: boolean;
}

function ReorderableItem<T extends DraggableItem>({
  item,
  index,
  renderContent,
  onDelete,
  onEdit,
  className,
  dragHandleClassName,
  showActions,
}: ReorderableItemProps<T>) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileDrag={{
        scale: 1.02,
        boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
        zIndex: 50,
      }}
      className={cn(
        "flex items-center gap-2 p-3 bg-card border rounded-lg cursor-default",
        className
      )}
    >
      <div
        className={cn(
          "cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted transition-colors",
          dragHandleClassName
        )}
        onPointerDown={(e) => controls.start(e)}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        {renderContent(item, index)}
      </div>

      {showActions && (onEdit || onDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(item)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Reorder.Item>
  );
}

// Kanban board
interface KanbanColumn {
  id: string;
  title: string;
  items: DraggableItem[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onMove: (itemId: string, fromColumn: string, toColumn: string) => void;
  renderCard: (item: DraggableItem) => React.ReactNode;
  onAddCard?: (columnId: string) => void;
  className?: string;
}

export function KanbanBoard({
  columns,
  onMove,
  renderCard,
  onAddCard,
  className,
}: KanbanBoardProps) {
  const [draggedItem, setDraggedItem] = React.useState<{
    item: DraggableItem;
    fromColumn: string;
  } | null>(null);

  const handleDragStart = (item: DraggableItem, columnId: string) => {
    setDraggedItem({ item, fromColumn: columnId });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = (columnId: string) => {
    if (draggedItem && draggedItem.fromColumn !== columnId) {
      onMove(draggedItem.item.id, draggedItem.fromColumn, columnId);
    }
    setDraggedItem(null);
  };

  return (
    <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-72 bg-muted/50 rounded-lg p-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(column.id)}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">{column.title}</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {column.items.length}
            </span>
          </div>

          <div className="space-y-2 min-h-[200px]">
            <AnimatePresence>
              {column.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  draggable
                  onDragStart={() => handleDragStart(item, column.id)}
                  onDragEnd={handleDragEnd}
                  className="cursor-grab active:cursor-grabbing"
                  whileDrag={{ scale: 1.05, rotate: 2 }}
                >
                  <Card className="p-3 hover:shadow-md transition-shadow">
                    {renderCard(item)}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {onAddCard && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-muted-foreground"
              onClick={() => onAddCard(column.id)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

// Sortable grid
interface SortableGridProps<T extends DraggableItem> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
  columns?: number;
  gap?: number;
  className?: string;
}

export function SortableGrid<T extends DraggableItem>({
  items,
  onReorder,
  renderItem,
  columns = 3,
  gap = 4,
  className,
}: SortableGridProps<T>) {
  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={onReorder}
      className={cn(
        `grid gap-${gap}`,
        columns === 2 && 'grid-cols-2',
        columns === 3 && 'grid-cols-3',
        columns === 4 && 'grid-cols-4',
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap * 4}px`,
      }}
    >
      {items.map((item) => (
        <Reorder.Item
          key={item.id}
          value={item}
          whileDrag={{ scale: 1.05, zIndex: 50 }}
          className="cursor-grab active:cursor-grabbing"
        >
          {renderItem(item)}
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
