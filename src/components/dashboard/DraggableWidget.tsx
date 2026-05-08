import { ReactNode, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DraggableWidgetProps {
  id: string;
  children: ReactNode;
  isEditMode: boolean;
  onToggleVisibility?: () => void;
  className?: string;
}

export const DraggableWidget = memo(function DraggableWidget({
  id,
  children,
  isEditMode,
  onToggleVisibility,
  className,
}: DraggableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'z-50 opacity-90',
        isEditMode && 'ring-2 ring-primary/20 ring-dashed rounded-lg',
        className
      )}
    >
      {isEditMode && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-background border border-border rounded-full px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          {onToggleVisibility && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onToggleVisibility}
            >
              <EyeOff className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      {children}
    </div>
  );
});
