import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Clock, Zap, AlertCircle, RotateCcw, Activity, Scale, Timer, Database } from 'lucide-react';

interface AlertSummaryStatsProps {
  delayed: number;
  overdue: number;
  urgent: number;
  atRisk: number;
  rework: number;
  bottlenecks: number;
  loadBalancing: number;
  stuckJobs: number;
  stuckCritical: number;
  dataIssues: number;
}

export function AlertSummaryStats({ delayed, overdue, urgent, atRisk, rework, bottlenecks, loadBalancing, stuckJobs, stuckCritical, dataIssues }: AlertSummaryStatsProps) {
  const stats = [
    { value: delayed, label: 'Atrasados', icon: AlertTriangle, color: 'red' },
    { value: overdue, label: 'Vencidos', icon: Clock, color: 'orange' },
    { value: urgent, label: 'Urgentes', icon: Zap, color: 'yellow' },
    { value: atRisk, label: 'Em Risco', icon: AlertCircle, color: 'cyan' },
    { value: rework, label: 'Retrabalho', icon: RotateCcw, color: 'purple' },
    { value: bottlenecks, label: 'Gargalos', icon: Activity, color: 'pink' },
    { value: loadBalancing, label: 'Desbalanc.', icon: Scale, color: 'teal' },
    { value: stuckJobs, label: 'Travados', icon: Timer, color: stuckCritical > 0 ? 'red' : 'indigo' },
    { value: dataIssues, label: 'Integridade', icon: Database, color: dataIssues > 0 ? 'amber' : 'slate' },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 sm:gap-4">
      {stats.map(({ value, label, icon: Icon, color }) => (
        <Card key={label} className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <div className={`p-2 sm:p-3 rounded-xl bg-${color}-500/20`}>
              <Icon className={`h-4 w-4 sm:h-5 sm:w-5 text-${color}-400`} />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
