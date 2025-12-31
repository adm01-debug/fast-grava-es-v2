import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, Star, Trash2, Save, Loader2 } from 'lucide-react';
import { useSavedFilters, SavedFilter } from '@/hooks/useSavedFilters';

interface SavedFiltersDropdownProps {
  entityType: string;
  currentFilters: Record<string, unknown>;
  onApplyFilter: (filters: Record<string, unknown>) => void;
  hasActiveFilters?: boolean;
}

export function SavedFiltersDropdown({
  entityType,
  currentFilters,
  onApplyFilter,
  hasActiveFilters = false,
}: SavedFiltersDropdownProps) {
  const {
    filters,
    isLoading,
    saveFilter,
    deleteFilter,
    setAsDefault,
    removeDefault,
    isSaving,
  } = useSavedFilters(entityType);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [setAsDefaultOnSave, setSetAsDefaultOnSave] = useState(false);

  const handleSaveFilter = () => {
    if (!filterName.trim()) return;

    saveFilter({
      name: filterName.trim(),
      filters: currentFilters,
      is_default: setAsDefaultOnSave,
    });

    setShowSaveDialog(false);
    setFilterName('');
    setSetAsDefaultOnSave(false);
  };

  const handleApplyFilter = (filter: SavedFilter) => {
    onApplyFilter(filter.filters);
  };

  const handleToggleDefault = (filter: SavedFilter) => {
    if (filter.is_default) {
      removeDefault(filter.id);
    } else {
      setAsDefault(filter.id);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros Salvos</span>
            {filters.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                {filters.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          {hasActiveFilters && (
            <>
              <DropdownMenuItem onClick={() => setShowSaveDialog(true)}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Filtro Atual
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : filters.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Nenhum filtro salvo
            </div>
          ) : (
            filters.map((filter) => (
              <DropdownMenuItem
                key={filter.id}
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleApplyFilter(filter)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {filter.is_default && (
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 flex-shrink-0" />
                  )}
                  <span className="truncate">{filter.name}</span>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleDefault(filter);
                    }}
                  >
                    <Star className={`h-3 w-3 ${filter.is_default ? 'fill-yellow-500' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFilter(filter.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Filtro</DialogTitle>
            <DialogDescription>
              Salve os filtros atuais para uso futuro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Nome do Filtro</Label>
              <Input
                id="filter-name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Ex: Filtro de vendas Q4"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="set-default"
                checked={setAsDefaultOnSave}
                onCheckedChange={(checked) => setSetAsDefaultOnSave(checked as boolean)}
              />
              <Label htmlFor="set-default" className="text-sm">
                Definir como filtro padrão
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFilter} disabled={!filterName.trim() || isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
