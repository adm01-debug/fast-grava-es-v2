import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ArrowRight, Scale } from 'lucide-react';

interface MachineLoad {
  machine: { id: string; name: string };
  occupancyRate: number;
  jobCount: number;
  scheduledMinutes: number;
}

interface BalancingSuggestion {
  currentMachineName: string;
  suggestedMachineName: string;
  orderNumber: string;
}

interface BalancingTabProps {
  machineLoads: MachineLoad[];
  suggestions: BalancingSuggestion[];
}

export function BalancingTab({ machineLoads, suggestions }: BalancingTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="glass-card border-border/50 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Ocupação por Máquina</CardTitle>
          <CardDescription>Distribuição atual de carga de trabalho</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {machineLoads.slice(0, 10).map((machine) => (
            <div key={machine.machine.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{machine.machine.name}</span>
                <span className={
                  machine.occupancyRate > 80 ? 'text-destructive' :
                  machine.occupancyRate < 30 ? 'text-warning' : 'text-success'
                }>{Math.round(machine.occupancyRate)}%</span>
              </div>
              <Progress value={machine.occupancyRate} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{machine.jobCount} jobs</span>
                <span>{machine.scheduledMinutes}min agendados</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Sugestões</CardTitle>
          <CardDescription>Ações recomendadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.slice(0, 5).map((suggestion, index) => (
            <div key={index} className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
              <div className="flex items-start gap-2">
                <Scale className="h-4 w-4 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{suggestion.currentMachineName}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ArrowRight className="h-3 w-3" /><span>{suggestion.suggestedMachineName}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">{suggestion.orderNumber}</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full text-xs">Aplicar</Button>
            </div>
          ))}
          {suggestions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-8 w-8 text-success mb-2" />
              <p className="text-sm text-muted-foreground">Carga balanceada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
