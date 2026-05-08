import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTPM } from '@/hooks/useTPM';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CheckCircle2, Clock, Wrench, Package, 
  Camera, User, ArrowRight, AlertTriangle 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface MachineTimelineProps {
  machineId: string;
}

export function MachineTPMTimeline({ machineId }: MachineTimelineProps) {
  const { records } = useTPM();

  const machineRecords = useMemo(() => {
    return records
      .filter(r => r.machine_id === machineId)
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  }, [records, machineId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'completed':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'in_progress':
        return <Wrench className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:via-border before:to-transparent">
      {machineRecords.length > 0 ? (
        machineRecords.map((record, index) => (
          <div key={record.id} className="relative flex items-start gap-6 stagger-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
            {/* Dot/Icon */}
            <div className="absolute left-0 flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 border-border shadow-sm z-10">
              {getStatusIcon(record.status)}
            </div>

            <Card className="flex-1 ml-12 hover:shadow-md transition-shadow border-primary/5">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {record.maintenance_type_id}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(record.started_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  {record.status === 'approved' && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-[10px]">
                      APROVADO
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-sm font-semibold mt-1">
                  Intervenção por {record.performed_by_name || 'Técnico'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-2 italic">
                  {record.notes || 'Sem observações registradas.'}
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Package className="h-3 w-3" />
                    {record.total_cost > 0 ? `R$ ${record.total_cost.toFixed(2)} em peças` : 'Sem troca de peças'}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {record.downtime_minutes} min de parada
                  </div>
                </div>

                {record.signature_url && (
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-secondary/30">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-[10px] font-serif italic text-primary">
                        {record.signature_url}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))
      ) : (
        <div className="text-center py-12 text-muted-foreground ml-12">
          Nenhuma execução registrada para esta máquina.
        </div>
      )}
    </div>
  );
}
