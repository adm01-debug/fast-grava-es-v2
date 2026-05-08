import { memo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ShieldCheckIcon,
  PlusCircleIcon,
  PencilIcon,
  Trash2Icon,
  UserIcon,
  HashIcon,
  DatabaseIcon,
  ClockIcon,
  LockIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AuditLogEntry } from '@/lib/schemas/auditLog';

interface AuditEntryCardProps {
  entry: AuditLogEntry;
}

const actionConfig = {
  INSERT: { icon: PlusCircleIcon, label: 'Creation', variant: 'default' as const, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  UPDATE: { icon: PencilIcon, label: 'Mutation', variant: 'secondary' as const, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  DELETE: { icon: Trash2Icon, label: 'Deletion', variant: 'destructive' as const, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
};

function shortHash(hash: string | null | undefined): string {
  if (!hash) return '—';
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

export const AuditEntryCard = memo(function AuditEntryCard({ entry }: AuditEntryCardProps) {
  const cfg = actionConfig[entry.action];
  const ActionIcon = cfg.icon;
  const date = new Date(entry.created_at);

  return (
    <Card className="group relative overflow-hidden p-6 border-border/40 bg-card/40 backdrop-blur-md hover:bg-card/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 rounded-3xl ring-1 ring-white/5">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <LockIcon className="h-20 w-20 text-primary rotate-12" />
      </div>

      <div className="flex flex-col sm:flex-row items-start justify-between gap-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className={cn("mt-1 p-3 rounded-2xl border shadow-sm transition-transform group-hover:scale-110 duration-500", cfg.bg, cfg.border)}>
            <ActionIcon className={cn("h-6 w-6", cfg.color)} aria-hidden />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={cn("font-black tracking-widest uppercase text-[10px] px-3 py-1 rounded-full border shadow-sm", cfg.bg, cfg.color, cfg.border)}>
                {cfg.label}
              </Badge>
              <div className="flex items-center gap-2 bg-muted/40 px-3 py-1 rounded-full border border-border/40">
                <DatabaseIcon className="h-3 w-3 text-muted-foreground/60" />
                <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/80">{entry.entity_type}</span>
              </div>
              <code className="text-[10px] font-mono font-bold bg-primary/5 text-primary/70 px-2 py-0.5 rounded-md border border-primary/10">
                ID: {entry.entity_id.slice(0, 12)}...
              </code>
            </div>

            <div className="flex items-center gap-4 flex-wrap text-xs">
              <div className="flex items-center gap-1.5 text-foreground/70 font-bold bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                <UserIcon className="h-3.5 w-3.5 text-primary/60" aria-hidden />
                <span>{entry.actor_email ?? entry.actor_id ?? 'System Override'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground font-medium italic">
                <ClockIcon className="h-3.5 w-3.5" aria-hidden />
                <span>{format(date, "dd MMM yyyy 'at' HH:mm:ss", { locale: ptBR })}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <ShieldCheckIcon className="h-5 w-5 text-primary animate-pulse-glow" aria-hidden />
          <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground/40 border-muted-foreground/10 uppercase tracking-widest">
            Verified Hash
          </Badge>
        </div>
      </div>

      {entry.changed_fields && entry.changed_fields.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-border/40">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mr-2 flex items-center">
            Affected Keys:
          </span>
          {entry.changed_fields.map((field) => (
            <Badge key={field} variant="outline" className="text-[10px] font-mono font-bold bg-muted/20 border-border/60 hover:border-primary/40 transition-colors">
              {field}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-muted/10 border border-border/20 backdrop-blur-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <HashIcon className="h-3.5 w-3.5 text-primary" aria-hidden />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">Current Node Hash</span>
            <span className="text-[10px] font-mono text-foreground/80 break-all leading-none" title={entry.hash}>
              {entry.hash}
            </span>
          </div>
        </div>

        {entry.previous_hash && (
          <>
            <div className="hidden sm:block text-primary/30 font-black text-xl leading-none">←</div>
            <div className="flex items-center gap-3 w-full sm:w-auto opacity-50 hover:opacity-100 transition-opacity">
              <div className="p-1.5 bg-muted/20 rounded-lg">
                <HashIcon className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none mb-1">Ancestry Chain</span>
                <span className="text-[10px] font-mono text-muted-foreground/60 break-all leading-none" title={entry.previous_hash}>
                  {entry.previous_hash.slice(0, 32)}...
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
});
