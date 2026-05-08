import { useEffect, useState } from 'react';
import { ShieldCheckIcon } from 'lucide-react';
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
        <header className="flex items-center gap-3">
          <ShieldCheckIcon className="h-7 w-7 text-primary" aria-hidden />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Trilha de Auditoria</h1>
            <p className="text-sm text-muted-foreground">
              Registro imutável append-only com cadeia de hash SHA-256 (21 CFR Part 11)
            </p>
          </div>
        </header>

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
      </div>
    </>
  );
}
