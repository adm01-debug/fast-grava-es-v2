import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { mockJobs, getTechniqueById, getMachineById, getOperatorById } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

export function RecentJobsTable() {
  const recentJobs = mockJobs.slice(0, 6);

  return (
    <Card className="col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display">Jobs Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">OS</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="text-center">Qtd</TableHead>
              <TableHead>Técnica</TableHead>
              <TableHead>Máquina</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentJobs.map((job) => {
              const technique = getTechniqueById(job.techniqueId);
              const machine = getMachineById(job.machineId);

              return (
                <TableRow key={job.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-mono text-sm font-medium">
                    {job.orderNumber}
                  </TableCell>
                  <TableCell className="font-medium max-w-[150px] truncate">
                    {job.client}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-muted-foreground">
                    {job.product}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-mono">
                      {job.quantity.toLocaleString('pt-BR')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{technique?.shortName}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {machine?.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {job.startTime} - {job.endTime}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={job.status} size="sm" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
