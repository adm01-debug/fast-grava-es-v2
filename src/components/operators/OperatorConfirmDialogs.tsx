import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { OperatorWithProfile } from '@/hooks/useOperators';

interface OperatorConfirmDialogsProps {
  operatorToRemove: OperatorWithProfile | null;
  operatorToToggle: OperatorWithProfile | null;
  isRemoving: boolean;
  isToggling: boolean;
  onRemoveClose: () => void;
  onToggleClose: () => void;
  onRemoveConfirm: () => void;
  onToggleConfirm: () => void;
}

export function OperatorConfirmDialogs({
  operatorToRemove, operatorToToggle, isRemoving, isToggling,
  onRemoveClose, onToggleClose, onRemoveConfirm, onToggleConfirm,
}: OperatorConfirmDialogsProps) {
  return (
    <>
      <AlertDialog open={!!operatorToRemove} onOpenChange={(open) => !open && onRemoveClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover operador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{operatorToRemove?.full_name || 'este operador'}</strong> do sistema?
              <br /><br />Esta ação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Remover todas as atribuições de máquinas</li>
                <li>Remover o papel de operador do usuário</li>
              </ul>
              <br />O usuário ainda poderá acessar o sistema se tiver outras funções atribuídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onRemoveConfirm} disabled={isRemoving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isRemoving ? 'Removendo...' : 'Remover operador'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!operatorToToggle} onOpenChange={(open) => !open && onToggleClose()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{operatorToToggle?.is_active ? 'Desativar operador' : 'Reativar operador'}</AlertDialogTitle>
            <AlertDialogDescription>
              {operatorToToggle?.is_active ? (
                <>Tem certeza que deseja desativar <strong>{operatorToToggle?.full_name || 'este operador'}</strong>?<br /><br />O operador não poderá acessar as funcionalidades de operador enquanto estiver inativo. As atribuições de máquinas serão mantidas.</>
              ) : (
                <>Deseja reativar <strong>{operatorToToggle?.full_name || 'este operador'}</strong>?<br /><br />O operador poderá acessar novamente as funcionalidades e suas máquinas atribuídas.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isToggling}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onToggleConfirm} disabled={isToggling} className={operatorToToggle?.is_active ? 'bg-warning text-warning-foreground hover:bg-warning/90' : 'bg-success text-success-foreground hover:bg-success/90'}>
              {isToggling ? 'Processando...' : operatorToToggle?.is_active ? 'Desativar' : 'Reativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
