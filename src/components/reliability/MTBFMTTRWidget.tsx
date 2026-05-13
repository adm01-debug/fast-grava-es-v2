import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMTBFMTTR, MachineReliabilityMetrics } from '@/hooks/useMTBFMTTR';
import { Activity, Clock, AlertTriangle, TrendingUp, Wrench, Timer } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const reliabilityColors: Record<MachineReliabilityMetrics['reliabilityScore'], string> = {
  excellent: 'bg-indicator-success/20 text-indicator-success border-indicator-success/30',
  good: 'bg-indicator-success/20 text-indicator-success border-indicator-success/30',
  moderate: 'bg-indicator-warning/20 text-indicator-warning border-indicator-warning/30',
  poor: 'bg-priority-high/20 text-priority-high border-priority-high/30',
  critical: 'bg-indicator-danger/20 text-indicator-danger border-indicator-danger/30',
};

const reliabilityLabels: Record<MachineReliabilityMetrics['reliabilityScore'], string> = {
  excellent: 'Excelente',
  good: 'Bom',
  moderate: 'Moderado',
  poor: 'Baixo',
  critical: 'Crítico',
};

function formatHours(hours: number | null): string {
  if (hours === null) return '-';
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days}d ${remainingHours}h`;
  }
  return `${Math.round(hours)}h`;
}

function formatMinutes(minutes: number | null): string {
  if (minutes === null) return '-';
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}min`;
  }
  return `${Math.round(minutes)}min`;
}

export function MTBFMTTRWidget() {
  const { metrics, summary, isLoading } = useMTBFMTTR(90);

  if (isLoading) {
    return (
      <Card className="card-glass">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Confiabilidade (MTBF/MTTR)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const machinesWithIssues = metrics.filter(m =>
    m.reliabilityScore === 'critical' || m.reliabilityScore === 'poor'
  );

  return (
    <Card className="card-glass">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5 text-primary" />
            Confiabilidade (MTBF/MTTR)
          </div>
          <Badge variant="outline" className="text-xs">
            Últimos 90 dias
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    MTBF Médio
                  </div>
                  <div className="text-xl font-bold text-primary">
                    {formatHours(summary.averageMTBF)}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tempo Médio Entre Falhas</p>
                <p className="text-xs text-muted-foreground">Maior = Melhor</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-3 rounded-lg bg-indicator-warning/10 border border-indicator-warning/20">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Wrench className="h-3.5 w-3.5" />
                    MTTR Médio
                  </div>
                  <div className="text-xl font-bold text-indicator-warning">
                    {formatMinutes(summary.averageMTTR)}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tempo Médio de Reparo</p>
                <p className="text-xs text-muted-foreground">Menor = Melhor</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-3 rounded-lg bg-indicator-success/10 border border-indicator-success/20">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Disponibilidade
                  </div>
                  <div className="text-xl font-bold text-indicator-success">
                    {summary.averageAvailability.toFixed(1)}%
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Disponibilidade média das máquinas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Total Falhas
                  </div>
                  <div className="text-xl font-bold text-primary">
                    {summary.totalFailures}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manutenções corretivas no período</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Machines with issues */}
        {machinesWithIssues.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-indicator-warning" />
              Máquinas com Baixa Confiabilidade
            </h4>
            <div className="space-y-2">
              {machinesWithIssues.slice(0, 5).map(machine => (
                <div
                  key={machine.machineId}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={reliabilityColors[machine.reliabilityScore]}>
                      {reliabilityLabels[machine.reliabilityScore]}
                    </Badge>
                    <div>
                      <span className="font-medium text-sm">{machine.machineCode}</span>
                      <span className="text-xs text-muted-foreground ml-2">{machine.machineName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <div className="text-muted-foreground">MTBF</div>
                      <div className="font-medium">{formatHours(machine.mtbf)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground">MTTR</div>
                      <div className="font-medium">{formatMinutes(machine.mttr)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground">Falhas</div>
                      <div className="font-medium text-primary">{machine.totalFailures}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All machines table (compact) */}
        {metrics.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Todas as Máquinas com Histórico
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {metrics
                .sort((a, b) => (a.mtbf || Infinity) - (b.mtbf || Infinity))
                .map(machine => (
                  <div
                    key={machine.machineId}
                    className="flex items-center justify-between p-2 rounded bg-muted/30 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          machine.reliabilityScore === 'excellent' ? 'bg-indicator-success' :
                          machine.reliabilityScore === 'good' ? 'bg-indicator-success' :
                          machine.reliabilityScore === 'moderate' ? 'bg-indicator-warning' :
                          machine.reliabilityScore === 'poor' ? 'bg-priority-high' :
                          'bg-indicator-danger'
                        }`}
                      />
                      <span className="font-mono text-xs">{machine.machineCode}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>MTBF: <span className="text-foreground">{formatHours(machine.mtbf)}</span></span>
                      <span>MTTR: <span className="text-foreground">{formatMinutes(machine.mttr)}</span></span>
                      <span>Disp: <span className="text-foreground">{machine.availability.toFixed(1)}%</span></span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {metrics.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Sem dados de manutenção no período</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
