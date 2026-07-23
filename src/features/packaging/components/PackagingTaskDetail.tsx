import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePackagingTask } from '../hooks/usePackagingTask';
import { DefectTriageForm } from './DefectTriageForm';
import { PackagingRegisterForm } from './PackagingRegisterForm';
import { DEFECT_TYPE_LABELS, DECISION_LABELS, SEVERITY_LABELS, TASK_STATUS_LABELS } from '../types/packaging.schema';
import { format } from 'date-fns';

interface Props {
  taskId: string | null;
  onOpenChange: (open: boolean) => void;
}

export function PackagingTaskDetail({ taskId, onOpenChange }: Props) {
  const { task, defects, isLoading, assign, changeStatus, registerPackaging, recordDefect } = usePackagingTask(taskId);

  return (
    <Sheet open={!!taskId} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Tarefa de Embalagem</SheetTitle>
        </SheetHeader>

        {isLoading || !task ? (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{task.jobs?.order_number ?? '—'}</h3>
                <Badge variant="outline">{TASK_STATUS_LABELS[task.status]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {task.jobs?.client ?? '—'} · {task.jobs?.product ?? '—'}
              </p>
              <div className="text-xs text-muted-foreground mt-1">
                Recebido: <strong>{task.received_quantity}</strong> · Aprovado: <strong>{task.approved_quantity}</strong> · Rejeitado: <strong>{task.rejected_quantity}</strong>
              </div>
            </div>

            {!task.assigned_to && (
              <Button className="w-full" onClick={() => assign.mutate()} disabled={assign.isPending}>
                Assumir tarefa
              </Button>
            )}

            <Tabs defaultValue="triage">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="triage">Triagem</TabsTrigger>
                <TabsTrigger value="packaging">Embalagem</TabsTrigger>
                <TabsTrigger value="defects">Defeitos ({defects.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="triage" className="pt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Registre peças com defeito encontradas durante a inspeção pós-personalização.
                </p>
                <DefectTriageForm
                  taskId={task.id}
                  submitting={recordDefect.isPending}
                  onSubmit={async (values) => { await recordDefect.mutateAsync(values); }}
                />
              </TabsContent>

              <TabsContent value="packaging" className="pt-4">
                <PackagingRegisterForm
                  received={task.received_quantity}
                  submitting={registerPackaging.isPending}
                  onSubmit={async (values) => { await registerPackaging.mutateAsync(values); }}
                />
                {task.status === 'packaging' && (
                  <Button
                    className="w-full mt-4"
                    variant="secondary"
                    onClick={() => changeStatus.mutate('ready_to_ship')}
                    disabled={changeStatus.isPending}
                  >
                    Marcar como pronto para envio
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="defects" className="pt-4 space-y-3">
                {defects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum defeito registrado.</p>
                ) : (
                  defects.map(d => (
                    <div key={d.id} className="border rounded-md p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {DEFECT_TYPE_LABELS[d.defect_type as keyof typeof DEFECT_TYPE_LABELS] ?? d.defect_type}
                        </span>
                        <Badge variant="outline">{SEVERITY_LABELS[d.severity as keyof typeof SEVERITY_LABELS] ?? d.severity}</Badge>
                      </div>
                      <p className="text-muted-foreground text-xs mt-1">
                        {d.quantity} peça(s) · Decisão: {DECISION_LABELS[d.decision as keyof typeof DECISION_LABELS] ?? d.decision} · {format(new Date(d.created_at), 'dd/MM HH:mm')}
                      </p>
                      {d.notes && <p className="text-xs mt-1">{d.notes}</p>}
                      {d.photo_url && (
                        <a href={d.photo_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline mt-1 inline-block">
                          Ver foto
                        </a>
                      )}
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
