/**
 * Saved Filters Dropdown Component
 * 
 * @module components/SavedFiltersDropdown
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bookmark, ChevronDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, unknown>;
}

interface SavedFiltersDropdownProps {
  entityType: string;
  currentFilters: Record<string, unknown>;
  onApplyFilter: (filters: Record<string, unknown>) => void;
}

const STORAGE_KEY_PREFIX = 'saved_filters_';

export function SavedFiltersDropdown({
  entityType,
  currentFilters,
  onApplyFilter,
}: SavedFiltersDropdownProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const storageKey = `${STORAGE_KEY_PREFIX}${entityType}`;

  // Load saved filters from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setSavedFilters(JSON.parse(stored));
      }
    } catch {
      console.warn('Failed to load saved filters');
    }
  }, [storageKey]);

  const saveCurrentFilter = () => {
    const name = prompt('Nome do filtro:');
    if (!name) return;

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      filters: currentFilters,
    };

    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    toast.success('Filtro salvo!');
  };

  const deleteFilter = (id: string) => {
    const updated = savedFilters.filter((f) => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    toast.success('Filtro removido');
  };

  const hasFilters = Object.keys(currentFilters).length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bookmark className="h-4 w-4" />
          Filtros Salvos
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {savedFilters.length === 0 ? (
          <DropdownMenuItem disabled>
            Nenhum filtro salvo
          </DropdownMenuItem>
        ) : (
          savedFilters.map((filter) => (
            <DropdownMenuItem
              key={filter.id}
              className="flex items-center justify-between"
            >
              <span
                className="flex-1 cursor-pointer"
                onClick={() => onApplyFilter(filter.filters)}
              >
                {filter.name}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 ml-2"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFilter(filter.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </DropdownMenuItem>
          ))
        )}
        
        {hasFilters && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={saveCurrentFilter}>
              <Bookmark className="h-4 w-4 mr-2" />
              Salvar filtro atual
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SavedFiltersDropdown;
