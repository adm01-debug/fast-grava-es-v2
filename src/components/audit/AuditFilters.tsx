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
    <Card className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-card border-border">
      <div className="space-y-1.5">
        <Label htmlFor="entity-filter" className="text-xs">Entidade</Label>
        <Select
          value={filters.entityType ?? 'all'}
          onValueChange={(v) => onChange({ ...filters, entityType: v === 'all' ? undefined : v })}
        >
          <SelectTrigger id="entity-filter">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {ENTITY_OPTIONS.map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="action-filter" className="text-xs">Ação</Label>
        <Select
          value={filters.action ?? 'all'}
          onValueChange={(v) =>
            onChange({ ...filters, action: v === 'all' ? undefined : (v as AuditFiltersType['action']) })
          }
        >
          <SelectTrigger id="action-filter">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="INSERT">Criação</SelectItem>
            <SelectItem value="UPDATE">Atualização</SelectItem>
            <SelectItem value="DELETE">Exclusão</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="from-date" className="text-xs">De</Label>
        <Input
          id="from-date"
          type="datetime-local"
          value={filters.fromDate ?? ''}
          onChange={(e) => onChange({ ...filters, fromDate: e.target.value || undefined })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="to-date" className="text-xs">Até</Label>
        <Input
          id="to-date"
          type="datetime-local"
          value={filters.toDate ?? ''}
          onChange={(e) => onChange({ ...filters, toDate: e.target.value || undefined })}
        />
      </div>
    </Card>
  );
}
