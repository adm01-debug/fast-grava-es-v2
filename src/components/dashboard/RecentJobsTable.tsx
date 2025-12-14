import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { useJobs, useTechniques, useMachines, DbJob, DbTechnique, DbMachine } from '@/hooks/useJobs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { JobStatus } from '@/types/scheduling';

export function RecentJobsTable() {
  const { data: jobs = [], isLoading: isLoadingJobs } = useJobs();
  const { data: techniques = [] } = useTechniques();
  const { data: machines = [] } = useMachines();

  const getTechniqueById = (id: string): DbTechnique | undefined => {
    return techniques.find(t => t.id === id);
  };

  const getMachineById = (id: string | null): DbMachine | undefined => {
    if (!id) return undefined;
    return machines.find(m => m.id === id);
  };

  const recentJobs = jobs.slice(0, 6);

  if (isLoadingJobs) {
    return (
      <Card className="col-span-3 glass-card card-interactive animate-fade-in-up">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-3 glass-card card-interactive animate-fade-in-up opacity-0 [animation-fill-mode:forwards] [animation-delay:0.15s]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-display gradient-text">Jobs Recentes</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[700px]">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="w-[100px] text-muted-foreground">OS</TableHead>
                <TableHead className="text-muted-foreground">Cliente</TableHead>
                <TableHead className="text-muted-foreground hidden sm:table-cell">Produto</TableHead>
                <TableHead className="text-center text-muted-foreground">Qtd</TableHead>
                <TableHead className="text-muted-foreground">Técnica</TableHead>
                <TableHead className="text-muted-foreground hidden lg:table-cell">Máquina</TableHead>
                <TableHead className="text-muted-foreground hidden md:table-cell">Horário</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Nenhum job encontrado
                  </TableCell>
                </TableRow>
              ) : (
                recentJobs.map((job) => {
                  const technique = getTechniqueById(job.technique_id);
                  const machine = getMachineById(job.machine_id);

                  return (
                    <TableRow 
                      key={job.id} 
                      className="border-border/20 hover:bg-secondary/50 transition-all hover:-translate-x-0.5 cursor-pointer"
                    >
                      <TableCell className="font-mono text-sm font-medium text-primary">
                        {job.order_number}
                      </TableCell>
                      <TableCell className="font-medium max-w-[150px] truncate">
                        {job.client}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-muted-foreground hidden sm:table-cell">
                        {job.product}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono bg-secondary/80">
                          {job.quantity.toLocaleString('pt-BR')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{technique?.short_name}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className="font-mono text-xs border-border/50">
                          {machine?.code || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {job.start_time && job.end_time ? `${job.start_time} - ${job.end_time}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={job.status as JobStatus} size="sm" />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}