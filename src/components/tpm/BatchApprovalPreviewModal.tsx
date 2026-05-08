import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { MaintenanceRecord } from '@/hooks/tpm/types';
import { useMemo } from 'react';
import { useTPM } from '@/hooks/useTPM';

interface BatchApprovalPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordIds: string[];
  onConfirm: () => void;
  isProcessing: boolean;
}

export function BatchApprovalPreviewModal({
  isOpen,
  onClose,
  recordIds,
  onConfirm,
  isProcessing
}: BatchApprovalPreviewModalProps) {
  const { records } = useTPM();
  
  const selectedRecords = useMemo(() => {
    return records.filter(r => recordIds.includes(r.id));
  }, [records, recordIds]);

  const validationResults = useMemo(() => {
    return selectedRecords.map(record => {
      const issues = [];
      if (!record.signature_url) issues.push('Assinatura ausente');
      
      // Check if any item that required photo doesn't have it
      // Note: We'd need the full record details including responses for this
      // For the preview, we'll check what's already in the record if available
      
      return {
        ...record,
        isValid: issues.length === 0,
        issues
      };
    });
  }, [selectedRecords]);

  const allValid = validationResults.every(v => v.isValid);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Pré-validação de Aprovação em Lote
          </DialogTitle>
          <DialogDescription>
            Revise as manutenções selecionadas antes de confirmar a aprovação em massa.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Máquina</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status Validação</TableHead>
                <TableHead>Problemas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validationResults.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">
                    {v.machine?.name}
                    <div className="text-[10px] text-muted-foreground">{v.machine?.code}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {v.completed_at ? new Date(v.completed_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {v.isValid ? (
                      <Badge className="bg-emerald-500 gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Pronto
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" /> Incompleto
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-destructive">
                    {v.issues.join(', ') || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={!allValid || isProcessing || recordIds.length === 0}
            className="gap-2"
          >
            {isProcessing ? <Clock className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Confirmar Aprovação ({recordIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
