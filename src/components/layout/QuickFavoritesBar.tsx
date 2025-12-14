import { memo, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Calendar, CalendarDays, LayoutGrid, List, Zap, BarChart3, 
  AlertTriangle, BookOpen, UserCircle, QrCode, Bot, Printer, Users, 
  Plus, Star, Settings2, X, RotateCcw, RefreshCw
} from 'lucide-react';
import { arrayMove } from '@dnd-kit/sortable';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useQuickFavorites, QuickFavorite } from '@/hooks/useQuickFavorites';
import { useAlertCount } from '@/hooks/useAlertCount';

const iconMap: Record<string, React.ElementType> = {
  Home, Calendar, CalendarDays, LayoutGrid, List, Zap, BarChart3,
  AlertTriangle, BookOpen, UserCircle, QrCode, Bot, Printer, Users, Plus, Star
};

interface SortableFavoriteProps {
  fav: QuickFavorite;
  isActive: boolean;
  showBadge: boolean;
  alertCount: number;
}

const SortableFavorite = memo(function SortableFavorite({ 
  fav, 
  isActive, 
  showBadge, 
  alertCount 
}: SortableFavoriteProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fav.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = iconMap[fav.icon] || Star;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center',
        isDragging && 'z-50 opacity-80'
      )}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={fav.href}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 relative transition-all cursor-grab active:cursor-grabbing',
                isActive && 'bg-primary/20 text-primary',
                !isActive && 'hover:bg-muted'
              )}
              {...attributes}
              {...listeners}
            >
              <Icon className="h-4 w-4" />
              {showBadge && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-medium">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {fav.label}
        </TooltipContent>
      </Tooltip>
    </div>
  );
});

export const QuickFavoritesBar = memo(function QuickFavoritesBar() {
  const location = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const { 
    favorites, 
    availableShortcuts, 
    addFavorite, 
    removeFavorite, 
    resetToDefault,
    isFavorite,
    reorderFavorites,
    maxFavorites,
    isSyncing
  } = useQuickFavorites();
  const alertCount = useAlertCount();

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

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = favorites.findIndex(f => f.id === active.id);
      const newIndex = favorites.findIndex(f => f.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(favorites, oldIndex, newIndex);
        reorderFavorites(newOrder);
      }
    }
  }, [favorites, reorderFavorites]);

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/30 border border-border/50">
      {isSyncing && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center h-8 w-8">
              <RefreshCw className="h-3.5 w-3.5 text-primary animate-spin" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Sincronizando...
          </TooltipContent>
        </Tooltip>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={favorites.map(f => f.id)}
          strategy={horizontalListSortingStrategy}
        >
          {favorites.map((fav) => (
            <SortableFavorite
              key={fav.id}
              fav={fav}
              isActive={isActive(fav.href)}
              showBadge={fav.id === 'alerts' && alertCount > 0}
              alertCount={alertCount}
            />
          ))}
        </SortableContext>
      </DndContext>
      
      <div className="w-px h-5 bg-border/50 mx-1" />
      
      <Popover open={isEditing} onOpenChange={setIsEditing}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-3 bg-popover border-border">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Editar Favoritos</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetToDefault}
                className="h-7 text-xs text-muted-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Resetar
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Seus favoritos ({favorites.length}/{maxFavorites})
            </div>
            
            {favorites.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {favorites.map((fav) => {
                  const Icon = iconMap[fav.icon] || Star;
                  return (
                    <Badge
                      key={fav.id}
                      variant="secondary"
                      className="gap-1 pr-1 cursor-pointer hover:bg-destructive/20"
                      onClick={() => removeFavorite(fav.id)}
                    >
                      <Icon className="h-3 w-3" />
                      {fav.label}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  );
                })}
              </div>
            )}
            
            <div className="border-t border-border pt-3">
              <div className="text-xs text-muted-foreground mb-2">
                Adicionar atalho
              </div>
              <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                {availableShortcuts
                  .filter(s => !isFavorite(s.id))
                  .map((shortcut) => {
                    const Icon = iconMap[shortcut.icon] || Star;
                    const disabled = favorites.length >= maxFavorites;
                    
                    return (
                      <Button
                        key={shortcut.id}
                        variant="ghost"
                        size="sm"
                        disabled={disabled}
                        onClick={() => addFavorite(shortcut)}
                        className="justify-start h-8 text-xs px-2"
                      >
                        <Icon className="h-3 w-3 mr-1.5" />
                        <span className="truncate">{shortcut.label}</span>
                      </Button>
                    );
                  })}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});
