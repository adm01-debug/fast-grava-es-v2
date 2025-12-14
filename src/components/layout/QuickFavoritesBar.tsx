import { memo, useState, useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Calendar, CalendarDays, LayoutGrid, List, Zap, BarChart3, 
  AlertTriangle, BookOpen, UserCircle, QrCode, Bot, Printer, Users, 
  Plus, Star, Settings2, X, RotateCcw, RefreshCw, GripVertical
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
  DragStartEvent,
  DragOverlay,
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
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  index: number;
  isTriggered: boolean;
}

const SortableFavorite = memo(function SortableFavorite({ 
  fav, 
  isActive, 
  showBadge, 
  alertCount,
  index,
  isTriggered
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
      style={{
        ...style,
        animationDelay: `${index * 50}ms`,
      }}
      className={cn(
        'flex items-center animate-scale-in relative',
        isDragging && 'z-50 opacity-30 scale-95'
      )}
    >
      {/* Pulse ring animation when triggered */}
      {isTriggered && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute h-10 w-10 rounded-lg bg-primary/30 animate-ping" />
          <div className="absolute h-8 w-8 rounded-md ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse" />
        </div>
      )}
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
        <TooltipContent side="bottom" className="text-xs flex items-center gap-2">
          <span>{fav.label}</span>
          {index < 6 && (
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border">
              Alt+{index + 1}
            </kbd>
          )}
        </TooltipContent>
      </Tooltip>
    </div>
  );
});

// Drag overlay component for visual feedback
interface DragOverlayItemProps {
  fav: QuickFavorite;
}

const DragOverlayItem = memo(function DragOverlayItem({ fav }: DragOverlayItemProps) {
  const Icon = iconMap[fav.icon] || Star;
  
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20 backdrop-blur-sm animate-scale-in">
      <GripVertical className="h-3 w-3 text-primary/60" />
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium text-primary">{fav.label}</span>
    </div>
  );
});

export const QuickFavoritesBar = memo(function QuickFavoritesBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [triggeredFavId, setTriggeredFavId] = useState<string | null>(null);
  const { 
    favorites, 
    availableShortcuts, 
    addFavorite, 
    removeFavorite, 
    resetToDefault,
    isFavorite,
    reorderFavorites,
    maxFavorites,
    isSyncing,
    isLoading
  } = useQuickFavorites();
  const alertCount = useAlertCount();

  // Keyboard shortcuts: Alt+1 to Alt+6 navigate to favorites
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger with Alt key held
      if (!e.altKey) return;
      
      // Check if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      
      const keyNum = parseInt(e.key);
      if (keyNum >= 1 && keyNum <= 6) {
        const favIndex = keyNum - 1;
        if (favorites[favIndex]) {
          e.preventDefault();
          // Trigger visual feedback
          setTriggeredFavId(favorites[favIndex].id);
          // Navigate after brief delay for visual effect
          setTimeout(() => {
            navigate(favorites[favIndex].href);
          }, 150);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [favorites, navigate]);

  // Clear triggered state after animation
  useEffect(() => {
    if (triggeredFavId) {
      const timer = setTimeout(() => setTriggeredFavId(null), 500);
      return () => clearTimeout(timer);
    }
  }, [triggeredFavId]);

  // Hooks must be called before any conditional returns
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

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/30 border border-border/50">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-md" />
        ))}
        <div className="w-px h-5 bg-border/50 mx-1" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    );
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    
    if (over && active.id !== over.id) {
      const oldIndex = favorites.findIndex(f => f.id === active.id);
      const newIndex = favorites.findIndex(f => f.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(favorites, oldIndex, newIndex);
        reorderFavorites(newOrder);
      }
    }
  };

  const activeDragFav = activeDragId ? favorites.find(f => f.id === activeDragId) : null;

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
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={favorites.map(f => f.id)}
          strategy={horizontalListSortingStrategy}
        >
          {favorites.map((fav, index) => (
            <SortableFavorite
              key={fav.id}
              fav={fav}
              isActive={isActive(fav.href)}
              showBadge={fav.id === 'alerts' && alertCount > 0}
              alertCount={alertCount}
              index={index}
              isTriggered={triggeredFavId === fav.id}
            />
          ))}
        </SortableContext>
        <DragOverlay dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeDragFav ? <DragOverlayItem fav={activeDragFav} /> : null}
        </DragOverlay>
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Resetar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Resetar favoritos?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Isso irá restaurar seus atalhos rápidos para a configuração padrão. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={resetToDefault}>
                      Resetar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
