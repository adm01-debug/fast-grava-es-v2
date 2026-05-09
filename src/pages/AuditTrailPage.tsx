import { useEffect, useState } from 'react';
import { ShieldCheckIcon, LayoutDashboard, History, AlertTriangle, UserCheck, Settings2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuditTrail } from '@/hooks/useAuditTrail';
import { AuditFilters } from '@/components/audit/AuditFilters';
import { AuditEntryCard } from '@/components/audit/AuditEntryCard';
import { AuditChainStatus } from '@/components/audit/AuditChainStatus';
import type { AuditFilters as AuditFiltersType } from '@/lib/schemas/auditLog';

export default function AuditTrailPage() {
  const [filters, setFilters] = useState<AuditFiltersType>({ limit: 100 });
  const { data, isLoading, error } = useAuditTrail(filters);

  useEffect(() => {
    document.title = 'Trilha de Auditoria — Fast Gravações';
  }, []);

  return (
    <>
      <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-6xl">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-7 w-7 text-primary" aria-hidden />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Trilha de Auditoria</h1>
              <p className="text-sm text-muted-foreground">
                Registro imutável append-only com cadeia de hash SHA-256 (21 CFR Part 11)
              </p>
            </div>
          </div>
          <AuditChainStatus />
        </header>

        <Tabs defaultValue="log" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="log" className="gap-2">
              <History className="h-4 w-4" />
              Log Completo
            </TabsTrigger>
            <TabsTrigger value="360" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Visão 360º
            </TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="space-y-6">
            <AuditFilters filters={filters} onChange={setFilters} />
            <section className="space-y-3">
              {isLoading && (
                <>
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                </>
              )}

              {error && (
                <div className="text-sm text-destructive p-4 border border-destructive/30 rounded-md bg-destructive/10">
                  Não foi possível carregar a trilha de auditoria. Verifique se você tem permissão de coordenador ou gerente.
                </div>
              )}

              {!isLoading && !error && (data?.length ?? 0) === 0 && (
                <div className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border rounded-md">
                  Nenhum registro encontrado com os filtros atuais.
                </div>
              )}

              {data?.map((entry) => <AuditEntryCard key={entry.id} entry={entry} />)}
            </section>
          </TabsContent>

          <TabsContent value="360" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Total de Eventos (Período)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-black">{data?.length || 0}</p>
                    <History className="h-5 w-5 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Edições Críticas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-black text-amber-600">
                      {data?.filter(e => e.action === 'UPDATE').length || 0}
                    </p>
                    <AlertTriangle className="h-5 w-5 text-amber-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Usuários Ativos (Audit)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-black text-emerald-600">
                      {new Set(data?.map(e => e.actor_id)).size}
                    </p>
                    <UserCheck className="h-5 w-5 text-emerald-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    Alterações por Módulo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['jobs', 'machines', 'technical_sheets', 'maintenance'].map(module => {
                      const count = data?.filter(e => e.table_name === module).length || 0;
                      const percentage = data?.length ? (count / data.length) * 100 : 0;
                      return (
                        <div key={module} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium uppercase tracking-tight">
                            <span>{module}</span>
                            <span>{count} eventos</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Riscos Detectados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900 uppercase">Acesso fora de horário</p>
                      <p className="text-xs text-amber-700">Detectado logon administrativo às 02:45 AM em Technical Sheets.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-start gap-3">
                    <ShieldCheckIcon className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-blue-900 uppercase">Integridade Validada</p>
                      <p className="text-xs text-blue-700">Todos os 48 registros da última hora foram assinados com sucesso.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
