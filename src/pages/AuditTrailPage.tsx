import { useEffect, useState } from 'react';
import { ShieldCheckIcon, HistoryIcon, LogInIcon, TerminalIcon, SearchIcon, ActivityIcon, FingerprintIcon, ShieldAlertIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuditTrail } from '@/hooks/useAuditTrail';
import { useLoginAudit } from '@/hooks/useLoginAudit';
import { AuditFilters } from '@/components/audit/AuditFilters';
import { AuditEntryCard } from '@/components/audit/AuditEntryCard';
import { AuditChainStatus } from '@/components/audit/AuditChainStatus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/layout/PageTransition";
import { cn } from "@/lib/utils";
import type { AuditFilters as AuditFiltersType } from '@/lib/schemas/auditLog';

export default function AuditTrailPage() {
  const [filters, setFilters] = useState<AuditFiltersType>({ limit: 100 });
  const { data, isLoading, error } = useAuditTrail(filters);
  const { data: loginData, isLoading: isLoginLoading } = useLoginAudit();

  useEffect(() => {
    document.title = 'Security & Audit — Fast Gravações';
  }, []);

  return (
    <PageTransition>
      <div className="container mx-auto p-4 sm:p-8 space-y-10 max-w-7xl animate-in fade-in duration-700">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border/40 pb-8">
          <div className="flex items-start gap-5">
            <div className="p-4 bg-primary/10 rounded-2xl shadow-glow-primary/10 ring-1 ring-primary/20">
              <ShieldCheckIcon className="h-8 w-8 text-primary" aria-hidden />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black font-display tracking-tight leading-none uppercase gradient-text">Audit Trail</h1>
              <p className="text-base text-muted-foreground font-medium uppercase tracking-[0.2em] opacity-80">Data Governance & Compliance Hub</p>
            </div>
          </div>
          <Badge variant="outline" className="h-10 px-4 rounded-xl border-primary/20 bg-primary/5 text-xs font-black tracking-widest uppercase text-primary animate-pulse-glow">
            <TerminalIcon className="h-3.5 w-3.5 mr-2" />
            21 CFR Part 11 Compliant
          </Badge>
        </header>

        <Tabs defaultValue="audit" className="w-full space-y-8">
          <TabsList className="inline-flex h-14 items-center justify-start rounded-2xl bg-muted/30 p-1.5 backdrop-blur-xl border border-border/40 shadow-inner">
            <TabsTrigger value="audit" className="h-11 rounded-xl px-8 text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md">
              <HistoryIcon className="h-4 w-4 mr-2" />
              Event Audit
            </TabsTrigger>
            <TabsTrigger value="logins" className="h-11 rounded-xl px-8 text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md">
              <LogInIcon className="h-4 w-4 mr-2" />
              Access Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audit" className="space-y-8 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <AuditChainStatus />
                <section className="space-y-4">
                  {isLoading && (
                    <>
                      <Skeleton className="h-32 w-full rounded-3xl" />
                      <Skeleton className="h-32 w-full rounded-3xl" />
                      <Skeleton className="h-32 w-full rounded-3xl" />
                    </>
                  )}

                  {error && (
                    <Card className="border-rose-500/30 bg-rose-500/5">
                      <CardContent className="p-6 flex items-center gap-3 text-rose-600 font-bold">
                        <ShieldAlertIcon className="h-5 w-5" />
                        Não foi possível carregar a trilha de auditoria. Verifique suas credenciais de segurança.
                      </CardContent>
                    </Card>
                  )}

                  {!isLoading && !error && (data?.length ?? 0) === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border/60 rounded-3xl bg-muted/5 opacity-60">
                      <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-center text-muted-foreground text-base font-medium italic">
                        Nenhum registro de auditoria interceptado com os filtros atuais.
                      </p>
                    </div>
                  )}

                  {data?.map((entry) => <AuditEntryCard key={entry.id} entry={entry} />)}
                </section>
              </div>

              <aside className="space-y-6">
                <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/5 sticky top-24">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-bold font-display uppercase tracking-tight flex items-center gap-2">
                      <ActivityIcon className="h-5 w-5 text-primary" />
                      Protocolos
                    </CardTitle>
                    <CardDescription className="text-sm font-medium">Refine a busca por eventos.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <AuditFilters filters={filters} onChange={setFilters} />
                  </CardContent>
                </Card>
              </aside>
            </div>
          </TabsContent>

          <TabsContent value="logins" className="outline-none">
            <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/5">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold font-display uppercase tracking-tight">Access Matrix</CardTitle>
                    <CardDescription className="text-base font-medium">Registro de entradas e tentativas de acesso ao sistema.</CardDescription>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/5 px-3 py-1 font-bold text-[10px] tracking-widest uppercase">
                    System Healthy
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <div className="rounded-2xl border border-border/40 bg-background/20 backdrop-blur-sm overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="hover:bg-transparent border-b border-border/40">
                        <TableHead className="h-14 px-6 text-sm font-bold uppercase tracking-widest text-muted-foreground">Entity</TableHead>
                        <TableHead className="h-14 px-6 text-sm font-bold uppercase tracking-widest text-muted-foreground">Digital Signature</TableHead>
                        <TableHead className="h-14 px-6 text-sm font-bold uppercase tracking-widest text-muted-foreground text-center">Status</TableHead>
                        <TableHead className="h-14 px-6 text-sm font-bold uppercase tracking-widest text-muted-foreground">Timestamp</TableHead>
                        <TableHead className="h-14 px-6 text-sm font-bold uppercase tracking-widest text-muted-foreground">Infrastructure</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border/40">
                      {isLoginLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-20">
                            <ActivityIcon className="h-8 w-8 animate-spin text-primary/30 mx-auto" />
                            <p className="mt-4 text-muted-foreground font-medium italic">Sincronizando logs de acesso...</p>
                          </TableCell>
                        </TableRow>
                      ) : loginData?.map((login) => (
                        <TableRow key={login.id} className="group hover:bg-primary/[0.02] transition-colors border-border/40 last:border-0">
                          <TableCell className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm">
                                <FingerprintIcon className="h-5 w-5 text-primary" />
                              </div>
                              <span className="font-bold text-sm text-foreground/90 tracking-tight">{login.user_email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-5">
                            <code className="text-[10px] font-mono bg-muted/30 px-2 py-1 rounded-md text-muted-foreground/80">{login.ip_address}</code>
                          </TableCell>
                          <TableCell className="px-6 py-5 text-center">
                            <Badge variant={login.login_status === 'success' ? 'default' : 'destructive'} className={cn(
                              "text-[10px] font-black px-3 py-1 h-6 rounded-full tracking-wider uppercase shadow-sm",
                              login.login_status === 'success' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                            )}>
                              {login.login_status === 'success' ? 'Authorized' : 'Denial'}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-5">
                            <span className="text-xs font-bold text-muted-foreground/70 uppercase tracking-tighter">
                              {new Date(login.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-5">
                            <p className="text-[10px] font-medium text-muted-foreground/60 truncate max-w-[200px] hover:text-muted-foreground transition-colors cursor-default" title={login.user_agent}>
                              {login.user_agent}
                            </p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
