import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, Redo2, History, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useUndoRedoStore, useGlobalUndoRedoShortcuts } from '@/hooks/useGlobalUndoRedo';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const categoryIcons = {
  navigation: '🧭',
  form: '📝',
  data: '💾',
  ui: '🎨',
  settings: '⚙️',
};

const categoryColors = {
  navigation: 'bg-blue-500/20 text-blue-400',
  form: 'bg-green-500/20 text-green-400',
  data: 'bg-purple-500/20 text-purple-400',
  ui: 'bg-orange-500/20 text-orange-400',
  settings: 'bg-gray-500/20 text-gray-400',
};

interface GlobalUndoRedoIndicatorProps {
  className?: string;
  showHistory?: boolean;
  compact?: boolean;
}

export function GlobalUndoRedoIndicator({
  className,
  showHistory = true,
  compact = false,
}: GlobalUndoRedoIndicatorProps) {
  const {
    past,
    future,
    undo,
    redo,
    canUndo,
    canRedo,
    isProcessing,
    clearHistory,
    getLastAction,
    getNextAction,
  } = useUndoRedoStore();

  // Enable keyboard shortcuts
  useGlobalUndoRedoShortcuts();

  const lastAction = getLastAction();
  const nextAction = getNextAction();
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => undo()}
                disabled={!canUndo() || isProcessing}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Desfazer {lastAction?.description}</p>
              <p className="text-xs text-muted-foreground">{isMac ? '⌘Z' : 'Ctrl+Z'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => redo()}
                disabled={!canRedo() || isProcessing}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Refazer {nextAction?.description}</p>
              <p className="text-xs text-muted-foreground">{isMac ? '⌘⇧Z' : 'Ctrl+Y'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <TooltipProvider>
        {/* Undo Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => undo()}
              disabled={!canUndo() || isProcessing}
            >
              <Undo2 className="h-4 w-4" />
              {past.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {past.length}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            {lastAction ? (
              <>
                <p className="font-medium">Desfazer: {lastAction.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {categoryIcons[lastAction.category]} {lastAction.category} • {isMac ? '⌘Z' : 'Ctrl+Z'}
                </p>
              </>
            ) : (
              <p>Nada para desfazer</p>
            )}
          </TooltipContent>
        </Tooltip>

        {/* Redo Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => redo()}
              disabled={!canRedo() || isProcessing}
            >
              <Redo2 className="h-4 w-4" />
              {future.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {future.length}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            {nextAction ? (
              <>
                <p className="font-medium">Refazer: {nextAction.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {categoryIcons[nextAction.category]} {nextAction.category} • {isMac ? '⌘⇧Z' : 'Ctrl+Y'}
                </p>
              </>
            ) : (
              <p>Nada para refazer</p>
            )}
          </TooltipContent>
        </Tooltip>

        {/* History Popover */}
        {showHistory && (past.length > 0 || future.length > 0) && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <History className="h-4 w-4" />
                <span className="text-xs text-muted-foreground">
                  {past.length + future.length}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-3 border-b">
                <h4 className="font-semibold text-sm">Histórico de Ações</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={clearHistory}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              </div>
              
              <ScrollArea className="h-[300px]">
                <div className="p-2 space-y-1">
                  {/* Future actions (can be redone) */}
                  <AnimatePresence>
                    {future.map((action, index) => (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 0.5, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-2 p-2 rounded-md bg-muted/30"
                      >
                        <span className="text-lg">{categoryIcons[action.category]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate line-through opacity-60">
                            {action.description}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(action.timestamp, { 
                              addSuffix: true,
                              locale: ptBR 
                            })}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", categoryColors[action.category])}
                        >
                          Refazer
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {future.length > 0 && past.length > 0 && (
                    <div className="flex items-center gap-2 py-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">Atual</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}

                  {/* Past actions (can be undone) */}
                  <AnimatePresence>
                    {[...past].reverse().map((action, index) => (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-md",
                          index === 0 ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                        )}
                      >
                        <span className="text-lg">{categoryIcons[action.category]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{action.description}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(action.timestamp, { 
                              addSuffix: true,
                              locale: ptBR 
                            })}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", categoryColors[action.category])}
                        >
                          {action.category}
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {past.length === 0 && future.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <History className="h-8 w-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nenhuma ação no histórico
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        )}
      </TooltipProvider>

      {/* Processing indicator */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 px-2 py-1 bg-primary/10 rounded-full"
          >
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary">Processando...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Floating indicator for bottom of screen
export function FloatingUndoRedoIndicator() {
  const { past, future, canUndo, canRedo } = useUndoRedoStore();
  
  useGlobalUndoRedoShortcuts();

  if (past.length === 0 && future.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <GlobalUndoRedoIndicator showHistory compact={false} />
    </motion.div>
  );
}
