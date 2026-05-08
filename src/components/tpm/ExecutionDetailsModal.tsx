import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Wrench, CheckCircle2, AlertTriangle, Clock, 
  User, Calendar, Package, FileText, Camera, PenTool,
  CheckCircle, Download, FileSpreadsheet, File
} from 'lucide-react';
import { MaintenanceRecord } from '@/hooks/tpm/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTPM } from '@/hooks/useTPM';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ExecutionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string | null;
}

export function ExecutionDetailsModal({ isOpen, onClose, recordId }: ExecutionDetailsModalProps) {
  const { fetchRecordDetails, approveMaintenance } = useTPM();
  const { user } = useAuth();
  const [record, setRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && recordId) {
      loadDetails();
    }
  }, [isOpen, recordId]);

  const loadDetails = async () => {
    if (!recordId) return;
    try {
      setIsLoading(true);
      const data = await fetchRecordDetails(recordId);
      setRecord(data);
    } catch (error) {
      toast.error('Erro ao carregar detalhes da execução');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!recordId || !user) return;
    try {
      await approveMaintenance.mutateAsync({
        record_id: recordId,
        approver_id: user.id
      });
      loadDetails(); // Refresh
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleExportCSV = () => {
    if (!record) return;
    
    const rows = [
      ['Campo', 'Valor'],
      ['ID', record.id],
      ['Máquina', `${record.machine?.name} (${record.machine?.code})`],
      ['Tipo', record.maintenance_type?.name],
      ['Técnico', record.performed_by_name || 'N/A'],
      ['Início', record.started_at ? format(new Date(record.started_at), 'dd/MM/yyyy HH:mm') : 'N/A'],
      ['Conclusão', record.completed_at ? format(new Date(record.completed_at), 'dd/MM/yyyy HH:mm') : 'N/A'],
      ['Status', record.status],
      ['Downtime (min)', record.downtime_minutes],
      ['Custo Total', record.total_cost],
      ['Observações', record.notes || ''],
      ['', ''],
      ['CHECKLIST', 'Conforme', 'Observação', 'Foto'],
      ...(record.responses || []).map((r: any) => [
        r.item?.description || 'Item',
        r.is_checked ? 'Sim' : 'Não',
        r.notes || '',
        r.photo_url || ''
      ]),
      ['', ''],
      ['PEÇAS', 'Código', 'Quantidade', 'Custo'],
      ...(record.parts || []).map((p: any) => [
        p.part_name,
        p.part_code || '',
        p.quantity,
        p.cost || ''
      ])
    ];

    const csvContent = rows.map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `execucao_${record.id}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500 gap-1"><CheckCircle className="h-3 w-3" /> Aprovado</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 gap-1"><Clock className="h-3 w-3" /> Pendente Aprovação</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="text-blue-500 border-blue-200 gap-1"><Clock className="h-3 w-3" /> Em Andamento</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-2xl font-display">
                <Wrench className="h-6 w-6 text-primary" />
                Detalhes da Execução
              </DialogTitle>
              <DialogDescription>
                Registro de manutenção preventiva e corretiva
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              {record && getStatusBadge(record.status)}
              {record && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" /> CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
                    <Download className="h-4 w-4" /> PDF
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <Separator className="mt-4" />

        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : record ? (
            <div className="space-y-8 print:space-y-4">
              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Datas
                  </Label>
                  <p className="text-sm font-medium">Início: {record.started_at ? format(new Date(record.started_at), "dd/MM 'às' HH:mm", { locale: ptBR }) : '-'}</p>
                  <p className="text-sm font-medium">Fim: {record.completed_at ? format(new Date(record.completed_at), "dd/MM 'às' HH:mm", { locale: ptBR }) : '-'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                    <User className="h-3 w-3" /> Responsáveis
                  </Label>
                  <p className="text-sm font-medium">Técnico: {record.performed_by_name || 'N/A'}</p>
                  {record.approver_id && (
                    <p className="text-sm text-emerald-600 font-medium">Aprovado por: {record.approver_id.substring(0, 8)}...</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                    <Wrench className="h-3 w-3" /> Ativo
                  </Label>
                  <p className="text-sm font-medium">{record.machine?.name}</p>
                  <p className="text-xs text-muted-foreground">{record.machine?.code}</p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-secondary/20 rounded-xl border border-border/50">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">Downtime</p>
                  <p className="text-lg font-bold">{record.downtime_minutes} min</p>
                </div>
                <div className="text-center border-l border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase">Custo Peças</p>
                  <p className="text-lg font-bold">R$ {record.total_cost.toFixed(2)}</p>
                </div>
                <div className="text-center border-l border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase">Itens Checklist</p>
                  <p className="text-lg font-bold">{record.responses?.length || 0}</p>
                </div>
                <div className="text-center border-l border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase">Status</p>
                  <p className="text-sm font-semibold text-primary">{record.status.toUpperCase()}</p>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Resultados do Checklist
                </h3>
                <div className="border border-border/50 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border/50">
                        <th className="px-4 py-2 text-left font-medium">Item</th>
                        <th className="px-4 py-2 text-center font-medium">Conforme</th>
                        <th className="px-4 py-2 text-left font-medium">Observação / Medição</th>
                        <th className="px-4 py-2 text-center font-medium">Foto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {record.responses?.map((r: any) => (
                        <tr key={r.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3">{r.item?.description || 'Item de Manutenção'}</td>
                          <td className="px-4 py-3 text-center">
                            {r.is_checked ? (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">SIM</Badge>
                            ) : (
                              <Badge variant="destructive" className="bg-rose-500/10 text-rose-600 border-rose-200">NÃO</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {r.measurement_value !== null && (
                              <span className="font-mono text-primary font-bold mr-2">
                                [{r.measurement_value} {r.item?.measurement_unit}]
                              </span>
                            )}
                            {r.notes || <span className="text-muted-foreground italic text-xs">Sem observações</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {r.photo_url ? (
                              <a href={r.photo_url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center justify-center gap-1">
                                <Camera className="h-4 w-4" /> Ver
                              </a>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Parts */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-500" />
                  Peças e Componentes Substituídos
                </h3>
                {record.parts?.length > 0 ? (
                  <div className="border border-border/50 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border/50">
                          <th className="px-4 py-2 text-left font-medium">Peça</th>
                          <th className="px-4 py-2 text-left font-medium">Código</th>
                          <th className="px-4 py-2 text-center font-medium">Qtd</th>
                          <th className="px-4 py-2 text-right font-medium">Custo Unit.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {record.parts.map((p: any) => (
                          <tr key={p.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-medium">{p.part_name}</td>
                            <td className="px-4 py-3 text-muted-foreground font-mono">{p.part_code || '-'}</td>
                            <td className="px-4 py-3 text-center">{p.quantity}</td>
                            <td className="px-4 py-3 text-right">R$ {(p.cost || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-secondary/10 border border-dashed border-border/50 text-center text-sm text-muted-foreground">
                    Nenhuma peça registrada nesta intervenção.
                  </div>
                )}
              </div>

              {/* Notes */}
              {record.notes && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Observações do Técnico
                  </h3>
                  <div className="p-4 rounded-lg bg-secondary/10 border border-border/50 text-sm italic">
                    {record.notes}
                  </div>
                </div>
              )}

              {/* Signature */}
              <div className="space-y-4 border-t border-border/50 pt-6">
                <div className="flex flex-col md:flex-row justify-between gap-8">
                  <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase">Responsável pela Execução</h3>
                    <div className="py-4 px-8 border-b border-border w-fit mx-auto md:mx-0">
                      <p className="font-serif italic text-xl text-primary">{record.signature_url || record.performed_by_name}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Assinado em: {record.completed_at ? format(new Date(record.completed_at), "dd/MM/yyyy 'às' HH:mm") : '-'}</p>
                  </div>

                  {record.status === 'approved' ? (
                    <div className="space-y-2 text-center md:text-right">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase">Aprovação / Auditoria</h3>
                      <div className="py-4 px-8 border-b border-emerald-200 w-fit mx-auto md:ml-auto">
                        <p className="text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" /> APROVADO
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Em: {record.approved_at ? format(new Date(record.approved_at), "dd/MM/yyyy 'às' HH:mm") : '-'}</p>
                    </div>
                  ) : record.status === 'completed' ? (
                    <div className="flex items-center justify-center md:justify-end">
                      <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                        <CheckCircle className="h-4 w-4" /> Aprovar Execução
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              Nenhum dado encontrado para este registro.
            </div>
          )}
        </ScrollArea>
        
        <Separator />
        
        <DialogFooter className="p-4 bg-muted/30">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <label className={`block font-medium ${className}`}>{children}</label>
);
