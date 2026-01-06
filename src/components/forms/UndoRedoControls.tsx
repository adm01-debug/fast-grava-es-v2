import { Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface UndoRedoControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historyLength?: number;
  futureLength?: number;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function UndoRedoControls({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  historyLength,
  futureLength,
  size = 'sm',
  className,
}: UndoRedoControlsProps) {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const undoShortcut = isMac ? '⌘Z' : 'Ctrl+Z';
  const redoShortcut = isMac ? '⇧⌘Z' : 'Ctrl+Y';

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size={size === 'sm' ? 'icon' : 'default'}
              onClick={onUndo}
              disabled={!canUndo}
              className={cn(
                "transition-all",
                size === 'sm' && "h-8 w-8"
              )}
            >
              <Undo2 className={cn(
                size === 'sm' ? "h-4 w-4" : "h-5 w-5"
              )} />
              {size !== 'sm' && <span className="ml-2">Desfazer</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Desfazer ({undoShortcut})</p>
            {historyLength !== undefined && (
              <p className="text-xs text-muted-foreground">
                {historyLength} ação(ões) para desfazer
              </p>
            )}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size={size === 'sm' ? 'icon' : 'default'}
              onClick={onRedo}
              disabled={!canRedo}
              className={cn(
                "transition-all",
                size === 'sm' && "h-8 w-8"
              )}
            >
              <Redo2 className={cn(
                size === 'sm' ? "h-4 w-4" : "h-5 w-5"
              )} />
              {size !== 'sm' && <span className="ml-2">Refazer</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Refazer ({redoShortcut})</p>
            {futureLength !== undefined && (
              <p className="text-xs text-muted-foreground">
                {futureLength} ação(ões) para refazer
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
