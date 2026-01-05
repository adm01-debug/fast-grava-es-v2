import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Trash2,
  Archive,
  RotateCcw,
  Copy,
  Download,
  MoreHorizontal,
  X,
  Loader2,
  CheckSquare,
} from 'lucide-react';
// BulkActionType definition
export type BulkActionType = 'delete' | 'archive' | 'restore' | 'duplicate' | 'export';

interface BulkActionsBarProps {
  selectedCount: number;
  isProcessing: boolean;
  onAction: (action: BulkActionType) => void;
  onClearSelection: () => void;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  onDuplicate?: () => void;
  showArchive?: boolean;
  showRestore?: boolean;
  showDelete?: boolean;
  showDuplicate?: boolean;
  showExport?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  isProcessing,
  onAction,
  onClearSelection,
  onExport,
  onDuplicate,
  showArchive = true,
  showRestore = false,
  showDelete = true,
  showDuplicate = true,
  showExport = true,
}: BulkActionsBarProps) {
  const [confirmAction, setConfirmAction] = useState<BulkActionType | null>(null);

  if (selectedCount === 0) return null;

  const handleAction = (action: BulkActionType) => {
    if (action === 'delete' || action === 'archive') {
      setConfirmAction(action);
    } else {
      onAction(action);
    }
  };

  const confirmAndExecute = () => {
    if (confirmAction) {
      onAction(confirmAction);
      setConfirmAction(null);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
        <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          <CheckSquare className="h-4 w-4" />
          <span className="font-medium">{selectedCount} selecionado{selectedCount > 1 ? 's' : ''}</span>
          
          <div className="flex items-center gap-1 ml-4">
            {showDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('delete')}
                disabled={isProcessing}
                className="hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            )}
            
            {showArchive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('archive')}
                disabled={isProcessing}
              >
                <Archive className="h-4 w-4 mr-1" />
                Arquivar
              </Button>
            )}
            
            {showRestore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAction('restore')}
                disabled={isProcessing}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Restaurar
              </Button>
            )}

            {(showDuplicate || showExport) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={isProcessing}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {showDuplicate && onDuplicate && (
                    <DropdownMenuItem onClick={onDuplicate}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                  )}
                  
                  {showExport && onExport && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onExport('csv')}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport('excel')}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport('pdf')}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar PDF
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSelection}
            className="ml-2"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'delete' ? 'Excluir registros?' : 'Arquivar registros?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'delete'
                ? `Tem certeza que deseja excluir ${selectedCount} registro${selectedCount > 1 ? 's' : ''}? Esta ação não pode ser desfeita.`
                : `Tem certeza que deseja arquivar ${selectedCount} registro${selectedCount > 1 ? 's' : ''}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAndExecute}
              className={confirmAction === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {confirmAction === 'delete' ? 'Excluir' : 'Arquivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
