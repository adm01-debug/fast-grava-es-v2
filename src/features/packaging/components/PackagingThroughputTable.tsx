import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy as TrophyIcon, Users as UsersIcon } from 'lucide-react';
import { usePackagingThroughput } from '../hooks/usePackagingThroughput';

interface Props {
  days?: number;
}

export function PackagingThroughputTable({ days = 30 }: Props) {
  const { data, isLoading } = usePackagingThroughput(days);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UsersIcon className="h-4 w-4 text-primary" />
          Throughput por Operador · Últimos {days} dias
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Nenhuma tarefa concluída no período.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead className="text-right">Tarefas</TableHead>
                <TableHead className="text-right">Aprovadas</TableHead>
                <TableHead className="text-right">Rejeitadas</TableHead>
                <TableHead className="text-right">Ciclo Médio</TableHead>
                <TableHead className="text-right">% Rejeição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((op, idx) => (
                <TableRow key={op.operatorId}>
                  <TableCell>
                    {idx === 0 ? (
                      <TrophyIcon className="h-4 w-4 text-amber-500" aria-label="Top performer" />
                    ) : (
                      <span className="text-muted-foreground">{idx + 1}</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{op.operatorName}</TableCell>
                  <TableCell className="text-right">{op.tasksCompleted}</TableCell>
                  <TableCell className="text-right text-emerald-600 dark:text-emerald-400">
                    {op.piecesApproved.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    {op.piecesRejected.toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {op.avgCycleMinutes !== null ? `${op.avgCycleMinutes.toFixed(0)} min` : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={op.rejectionRate > 0.05 ? 'destructive' : 'secondary'}
                      className="tabular-nums"
                    >
                      {(op.rejectionRate * 100).toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
