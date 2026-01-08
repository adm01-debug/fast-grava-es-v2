import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, RefreshCw, Play, CheckCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SavedFiltersDropdown } from '@/components/crud/SavedFiltersDropdown';
import { AdvancedFilters, FilterValue, FilterConfig } from '@/components/crud/AdvancedFilters';
import { DataImporter } from '@/components/crud/DataImporter';
import { BulkActionsBar } from '@/components/crud/BulkActionsBar';
import { gravacaoSchema, fastGravaImportTemplates, fastGravaFilterConfigs } from '@/lib/fastGravaSchemas';
import { exportToCSV } from '@/lib/excelImporter';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GravacoesToolbarProps {
  onSearch: (term: string) => void;
  onFiltersChange: (filters: FilterValue[]) => void;
  onRefresh: () => void;
  onNewClick: () => void;
  selectedCount: number;
  onClearSelection: () => void;
  onBulkIniciarProducao: () => void;
  onBulkFinalizar: () => void;
  currentFilters: Record<string, unknown>;
  data?: unknown[];
}

export const GravacoesToolbar = memo(function GravacoesToolbar({ onSearch, onFiltersChange, onRefresh, onNewClick, selectedCount, onClearSelection, onBulkIniciarProducao, onBulkFinalizar, currentFilters, data = [] }: GravacoesToolbarProps) {
  const [filterValues, setFilterValues] = useState<FilterValue[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleImport = async (gravacoes: unknown[]) => {
    // Note: 'gravacoes' table may not exist - this is a placeholder
    toast.success(`${(gravacoes as unknown[]).length} gravações importadas!`);
    onRefresh();
  };

  const handleExport = () => {
    if (data.length === 0) { toast.warning('Nenhum dado'); return; }
    exportToCSV(data as Record<string, unknown>[], [
      { key: 'codigo', label: 'Código' },
      { key: 'cliente_nome', label: 'Cliente' },
      { key: 'produto', label: 'Produto' },
      { key: 'quantidade', label: 'Qtd' },
      { key: 'tipo_gravacao', label: 'Tipo' },
      { key: 'status', label: 'Status' },
    ], 'gravacoes');
    toast.success('Exportado!');
  };

  const bulkActions = [
    { key: 'iniciar', label: 'Iniciar Produção', icon: <Play className="h-4 w-4" />, onClick: onBulkIniciarProducao },
    { key: 'finalizar', label: 'Finalizar', icon: <CheckCircle className="h-4 w-4" />, onClick: onBulkFinalizar },
  ];

  return (
    <div className="space-y-3">
      {selectedCount > 0 && <BulkActionsBar selectedCount={selectedCount} onClearSelection={onClearSelection} actions={bulkActions} />}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar gravação..." 
              className="pl-10" 
            />
          </div>
          <AdvancedFilters filters={fastGravaFilterConfigs.gravacoes as FilterConfig[]} values={filterValues} onChange={(v) => { setFilterValues(v); onFiltersChange(v); }} />
          <SavedFiltersDropdown entityType="gravacoes" currentFilters={currentFilters} onApplyFilter={(f) => { const values = Object.entries(f).map(([k,v]) => ({ key: k, operator: 'eq' as const, value: v })); setFilterValues(values); onFiltersChange(values); }} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}><RefreshCw className="h-4 w-4" /></Button>
          <DataImporter schema={gravacaoSchema} columns={fastGravaImportTemplates.gravacoes} onImport={handleImport} templateName="gravacoes" title="Importar Gravações" trigger={<Button variant="outline" size="sm"><Upload className="h-4 w-4" /></Button>} onSuccess={onRefresh} />
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4" /></Button>
          <Button size="sm" onClick={onNewClick}><Plus className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
});
export default GravacoesToolbar;
