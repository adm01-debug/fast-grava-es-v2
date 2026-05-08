import { useEffect, useState } from 'react';
import { ShieldCheckIcon, HistoryIcon, LogInIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuditTrail } from '@/hooks/useAuditTrail';
import { useLoginAudit } from '@/hooks/useLoginAudit';
import { AuditFilters } from '@/components/audit/AuditFilters';
import { AuditEntryCard } from '@/components/audit/AuditEntryCard';
import { AuditChainStatus } from '@/components/audit/AuditChainStatus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AuditFilters as AuditFiltersType } from '@/lib/schemas/auditLog';

export default function AuditTrailPage() {
  const [filters, setFilters] = useState<AuditFiltersType>({ limit: 100 });
  const { data, isLoading, error } = useAuditTrail(filters);
  const { data: loginData, isLoading: isLoginLoading } = useLoginAudit();

  useEffect(() => {
    document.title = 'Trilha de Auditoria — Fast Gravações';
  }, []);

  return (
    <>
      <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-6xl">
        <header className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ShieldCheckIcon className="h-7 w-7 text-primary" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Logs do Sistema</h1>
            <p className="text-sm text-muted-foreground">
              Rastreabilidade total e auditoria imutável (21 CFR Part 11)
            </p>
          </div>
        </header>

        <Tabs defaultValue="audit" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="audit" className="gap-2">
              <HistoryIcon className="h-4 w-4" />
              Auditoria de Ações
            </TabsTrigger>
            <TabsTrigger value="logins" className="gap-2">
              <LogInIcon className="h-4 w-4" />
              Logs de Acesso
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audit" className="space-y-6">
            <AuditChainStatus />
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
                  Não foi possível carregar a trilha de auditoria. Verifique suas permissões.
                </div>
              )}

              {!isLoading && !error && (data?.length ?? 0) === 0 && (
                <div className="text-sm text-muted-foreground text-center py-16 border border-dashed border-border rounded-md">
                  Nenhum registro encontrado.
                </div>
              )}

              {data?.map((entry) => <AuditEntryCard key={entry.id} entry={entry} />)}
            </section>
          </TabsContent>

          <TabsContent value="logins">
            <div className="rounded-md border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoginLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">Carregando logs...</TableCell>
                    </TableRow>
                  ) : loginData?.map((login) => (
                    <TableRow key={login.id}>
                      <TableCell className="font-medium text-xs">{login.user_email}</TableCell>
                      <TableCell className="text-xs font-mono">{login.ip_address}</TableCell>
                      <TableCell>
                        <Badge variant={login.login_status === 'success' ? 'default' : 'destructive'} className="text-[10px] px-1.5 h-5">
                          {login.login_status === 'success' ? 'Sucesso' : 'Falha'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(login.created_at).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-xs truncate max-w-[150px]">{login.user_agent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
