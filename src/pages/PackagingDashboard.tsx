import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePackagingQueue } from '@/features/packaging/hooks/usePackagingQueue';
import { PackagingQueueList } from '@/features/packaging/components/PackagingQueueList';
import { PackagingStatsCards } from '@/features/packaging/components/PackagingStatsCards';
import { PackagingTaskDetail } from '@/features/packaging/components/PackagingTaskDetail';
import { Package as PackageIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function PackagingDashboard() {
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const { data: allTasks, isLoading } = usePackagingQueue();

  const grouped = useMemo(() => {
    const list = allTasks ?? [];
    const today = new Date().toISOString().slice(0, 10);
    return {
      pending: list.filter(t => t.status === 'pending'),
      inProgress: list.filter(t => t.status === 'in_triage' || t.status === 'packaging' || t.status === 'on_hold'),
      triage: list.filter(t => t.status === 'in_triage'),
      completedToday: list.filter(t => t.status === 'ready_to_ship' && (t.completed_at ?? '').startsWith(today)),
    };
  }, [allTasks]);

  return (
    <>
      <Helmet>
        <title>Manuseio e Embalagem — Fast Gravações</title>
        <meta name="description" content="Fila do setor de manuseio e embalagem: triagem de defeitos, registro de embalagem e liberação para expedição." />
      </Helmet>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <PackageIcon className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Manuseio e Embalagem</h1>
            <p className="text-sm text-muted-foreground">
              Triagem final, embalagem e liberação para expedição.
            </p>
          </div>
        </div>

        <PackagingStatsCards tasks={allTasks ?? []} />

        <Tabs defaultValue="pending">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
            <TabsTrigger value="pending">Fila ({grouped.pending.length})</TabsTrigger>
            <TabsTrigger value="in-progress">Em andamento ({grouped.inProgress.length})</TabsTrigger>
            <TabsTrigger value="triage">Triagem ({grouped.triage.length})</TabsTrigger>
            <TabsTrigger value="done">Concluídos hoje ({grouped.completedToday.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            <PackagingQueueList
              tasks={grouped.pending}
              isLoading={isLoading}
              emptyLabel="Nenhuma tarefa pendente."
              onOpen={setOpenTaskId}
            />
          </TabsContent>
          <TabsContent value="in-progress" className="mt-4">
            <PackagingQueueList
              tasks={grouped.inProgress}
              isLoading={isLoading}
              emptyLabel="Nenhuma tarefa em andamento."
              onOpen={setOpenTaskId}
            />
          </TabsContent>
          <TabsContent value="triage" className="mt-4">
            <PackagingQueueList
              tasks={grouped.triage}
              isLoading={isLoading}
              emptyLabel="Nenhuma triagem em andamento."
              onOpen={setOpenTaskId}
            />
          </TabsContent>
          <TabsContent value="done" className="mt-4">
            <PackagingQueueList
              tasks={grouped.completedToday}
              isLoading={isLoading}
              emptyLabel="Nenhuma tarefa concluída hoje."
              onOpen={setOpenTaskId}
            />
          </TabsContent>
        </Tabs>

        <PackagingTaskDetail
          taskId={openTaskId}
          onOpenChange={(open) => { if (!open) setOpenTaskId(null); }}
        />
      </div>
    </>
  );
}
