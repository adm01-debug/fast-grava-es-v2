import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { AuditFilters as AuditFiltersType } from '@/lib/schemas/auditLog';

interface AuditFiltersProps {
  filters: AuditFiltersType;
  onChange: (next: AuditFiltersType) => void;
}

const ENTITY_OPTIONS = ['jobs', 'lot_components', 'lot_quality_inspections'];

export function AuditFilters({ filters, onChange }: AuditFiltersProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="entity-filter" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          Target Entity
        </Label>
        <Select
          value={filters.entityType ?? 'all'}
          onValueChange={(v) => onChange({ ...filters, entityType: v === 'all' ? undefined : v })}
        >
          <SelectTrigger id="entity-filter" className="h-12 rounded-xl bg-background/40 border-border/40 focus:ring-primary/20 hover:bg-background/60 transition-colors">
            <SelectValue placeholder="All Entities" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/40 bg-popover/95 backdrop-blur-xl">
            <SelectItem value="all" className="rounded-lg">All Entities</SelectItem>
            {ENTITY_OPTIONS.map((e) => (
              <SelectItem key={e} value={e} className="rounded-lg uppercase text-[10px] font-bold tracking-wider">{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="action-filter" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          Operation Type
        </Label>
        <Select
          value={filters.action ?? 'all'}
          onValueChange={(v) =>
            onChange({ ...filters, action: v === 'all' ? undefined : (v as AuditFiltersType['action']) })
          }
        >
          <SelectTrigger id="action-filter" className="h-12 rounded-xl bg-background/40 border-border/40 focus:ring-primary/20 hover:bg-background/60 transition-colors">
            <SelectValue placeholder="All Operations" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/40 bg-popover/95 backdrop-blur-xl">
            <SelectItem value="all" className="rounded-lg">All Operations</SelectItem>
            <SelectItem value="INSERT" className="rounded-lg font-bold text-emerald-500">CREATION</SelectItem>
            <SelectItem value="UPDATE" className="rounded-lg font-bold text-amber-500">MUTATION</SelectItem>
            <SelectItem value="DELETE" className="rounded-lg font-bold text-rose-500">DELETION</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="from-date" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          Temporal Horizon (Start)
        </Label>
        <Input
          id="from-date"
          type="datetime-local"
          value={filters.fromDate ?? ''}
          className="h-12 rounded-xl bg-background/40 border-border/40 focus:ring-primary/20 hover:bg-background/60 transition-colors text-xs font-mono"
          onChange={(e) => onChange({ ...filters, fromDate: e.target.value || undefined })}
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="to-date" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          Temporal Horizon (End)
        </Label>
        <Input
          id="to-date"
          type="datetime-local"
          value={filters.toDate ?? ''}
          className="h-12 rounded-xl bg-background/40 border-border/40 focus:ring-primary/20 hover:bg-background/60 transition-colors text-xs font-mono"
          onChange={(e) => onChange({ ...filters, toDate: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}
