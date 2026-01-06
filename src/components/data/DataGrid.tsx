import React, { useState, useMemo, useCallback, ReactNode, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Types
export interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
  hidden?: boolean;
  cell?: (value: unknown, row: T, index: number) => ReactNode;
}

export interface DataGridProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  
  // Features
  selectable?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  paginated?: boolean;
  virtualScroll?: boolean;
  
  // Pagination
  pageSize?: number;
  pageSizeOptions?: number[];
  
  // State
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  
  // Actions
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  
  // Row actions
  rowActions?: RowAction<T>[];
  
  // Styling
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  cellClassName?: string;
  
  // Accessibility
  ariaLabel?: string;
}

export interface RowAction<T> {
  id: string;
  label: string;
  icon?: React.ElementType;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean | ((row: T) => boolean);
  hidden?: boolean | ((row: T) => boolean);
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  column: string | null;
  direction: SortDirection;
}

export function DataGrid<T extends Record<string, unknown>>({
  data,
  columns,
  keyField,
  selectable = false,
  searchable = true,
  filterable = false,
  sortable = true,
  paginated = true,
  virtualScroll = false,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  loading = false,
  error,
  emptyMessage = 'Nenhum registro encontrado',
  onRowClick,
  onRowDoubleClick,
  onSelectionChange,
  onRefresh,
  onExport,
  rowActions,
  className,
  headerClassName,
  rowClassName,
  cellClassName,
  ariaLabel = 'Tabela de dados',
}: DataGridProps<T>) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortState, setSortState] = useState<SortState>({ column: null, direction: null });
  const [selectedRows, setSelectedRows] = useState<Set<unknown>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Visible columns
  const visibleColumns = useMemo(
    () => columns.filter((col) => !col.hidden),
    [columns]
  );

  // Filtered data
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter((row) =>
      visibleColumns.some((col) => {
        const value = col.accessorKey ? row[col.accessorKey] : col.accessorFn?.(row);
        return String(value ?? '').toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, visibleColumns]);

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.direction) return filteredData;

    const column = columns.find((col) => col.id === sortState.column);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = column.accessorKey ? a[column.accessorKey] : column.accessorFn?.(a);
      const bValue = column.accessorKey ? b[column.accessorKey] : column.accessorFn?.(b);

      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      const comparison = String(aValue).localeCompare(String(bValue), 'pt-BR', { numeric: true });
      return sortState.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortState, columns]);

  // Paginated data
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, paginated]);

  // Total pages
  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sort
  const handleSort = useCallback((columnId: string) => {
    setSortState((prev) => {
      if (prev.column !== columnId) return { column: columnId, direction: 'asc' };
      if (prev.direction === 'asc') return { column: columnId, direction: 'desc' };
      return { column: null, direction: null };
    });
  }, []);

  // Handle selection
  const handleSelectRow = useCallback((row: T) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      const key = row[keyField];
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, [keyField]);

  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((row) => row[keyField])));
    }
  }, [paginatedData, selectedRows.size, keyField]);

  // Effect for selection change callback
  useMemo(() => {
    if (onSelectionChange) {
      const selected = data.filter((row) => selectedRows.has(row[keyField]));
      onSelectionChange(selected);
    }
  }, [selectedRows, data, keyField, onSelectionChange]);

  // Get sort icon
  const getSortIcon = (columnId: string) => {
    if (sortState.column !== columnId) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    if (sortState.direction === 'asc') return <ArrowUp className="h-4 w-4 text-primary" />;
    return <ArrowDown className="h-4 w-4 text-primary" />;
  };

  // Get cell value
  const getCellValue = (row: T, column: Column<T>, index: number): ReactNode => {
    const value = column.accessorKey ? row[column.accessorKey] : column.accessorFn?.(row);
    if (column.cell) return column.cell(value, row, index);
    return String(value ?? '');
  };

  // Row class resolver
  const getRowClassName = (row: T, index: number) => {
    if (typeof rowClassName === 'function') return rowClassName(row, index);
    return rowClassName;
  };

  // Virtualizer for large datasets
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: virtualScroll ? paginatedData.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  // Render content
  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          )}
        </div>
      );
    }

    if (paginatedData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <p>{emptyMessage}</p>
        </div>
      );
    }

    if (virtualScroll) {
      return (
        <div ref={parentRef} className="h-[400px] overflow-auto">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = paginatedData[virtualRow.index];
              return (
                <div
                  key={String(row[keyField])}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {renderRow(row, virtualRow.index)}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <AnimatePresence mode="popLayout">
        {paginatedData.map((row, index) => (
          <motion.div
            key={String(row[keyField])}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, delay: index * 0.02 }}
          >
            {renderRow(row, index)}
          </motion.div>
        ))}
      </AnimatePresence>
    );
  };

  // Render row
  const renderRow = (row: T, index: number) => {
    const isSelected = selectedRows.has(row[keyField]);

    return (
      <div
        className={cn(
          "grid items-center gap-4 px-4 py-3 border-b border-border/50",
          "transition-colors duration-150",
          "hover:bg-muted/50",
          isSelected && "bg-primary/10",
          onRowClick && "cursor-pointer",
          getRowClassName(row, index)
        )}
        style={{
          gridTemplateColumns: `${selectable ? '40px ' : ''}${visibleColumns
            .map((col) => col.width || '1fr')
            .join(' ')}${rowActions ? ' 48px' : ''}`,
        }}
        onClick={() => onRowClick?.(row)}
        onDoubleClick={() => onRowDoubleClick?.(row)}
        role="row"
        aria-selected={isSelected}
      >
        {selectable && (
          <div className="flex justify-center" role="cell">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleSelectRow(row)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Selecionar linha ${index + 1}`}
            />
          </div>
        )}

        {visibleColumns.map((column) => (
          <div
            key={column.id}
            className={cn(
              "truncate text-sm",
              column.align === 'center' && 'text-center',
              column.align === 'right' && 'text-right',
              cellClassName
            )}
            role="cell"
          >
            {getCellValue(row, column, index)}
          </div>
        ))}

        {rowActions && rowActions.length > 0 && (
          <div className="flex justify-end" role="cell">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {rowActions.map((action, i) => {
                  const isHidden = typeof action.hidden === 'function' 
                    ? action.hidden(row) 
                    : action.hidden;
                  if (isHidden) return null;

                  const isDisabled = typeof action.disabled === 'function'
                    ? action.disabled(row)
                    : action.disabled;

                  const Icon = action.icon;

                  return (
                    <DropdownMenuItem
                      key={action.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick(row);
                      }}
                      disabled={isDisabled}
                      className={cn(
                        action.variant === 'destructive' && 'text-destructive focus:text-destructive'
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4 mr-2" />}
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "border border-border rounded-lg bg-card overflow-hidden",
        className
      )}
      role="grid"
      aria-label={ariaLabel}
    >
      {/* Toolbar */}
      {(searchable || onRefresh || onExport) && (
        <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
          <div className="flex items-center gap-2 flex-1">
            {searchable && (
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div
        className={cn(
          "grid items-center gap-4 px-4 py-3 bg-muted/30 border-b border-border font-medium text-sm",
          headerClassName
        )}
        style={{
          gridTemplateColumns: `${selectable ? '40px ' : ''}${visibleColumns
            .map((col) => col.width || '1fr')
            .join(' ')}${rowActions ? ' 48px' : ''}`,
        }}
        role="row"
      >
        {selectable && (
          <div className="flex justify-center" role="columnheader">
            <Checkbox
              checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
              onCheckedChange={handleSelectAll}
              aria-label="Selecionar todos"
            />
          </div>
        )}

        {visibleColumns.map((column) => (
          <div
            key={column.id}
            className={cn(
              "flex items-center gap-1",
              column.align === 'center' && 'justify-center',
              column.align === 'right' && 'justify-end',
              column.sortable !== false && sortable && 'cursor-pointer select-none'
            )}
            onClick={() => column.sortable !== false && sortable && handleSort(column.id)}
            role="columnheader"
            aria-sort={
              sortState.column === column.id
                ? sortState.direction === 'asc'
                  ? 'ascending'
                  : 'descending'
                : 'none'
            }
          >
            <span>{column.header}</span>
            {column.sortable !== false && sortable && getSortIcon(column.id)}
          </div>
        ))}

        {rowActions && <div role="columnheader" aria-label="Ações" />}
      </div>

      {/* Body */}
      <div className="min-h-[200px]">{renderContent()}</div>

      {/* Pagination */}
      {paginated && totalPages > 0 && (
        <div className="flex items-center justify-between gap-4 p-4 border-t border-border bg-muted/20">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Exibindo</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>de {sortedData.length} registros</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              aria-label="Primeira página"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="px-3 text-sm">
              Página {currentPage} de {totalPages}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Última página"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Preset column renderers
export const ColumnRenderers = {
  badge: (value: string, colorMap: Record<string, string> = {}) => (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        colorMap[value] || "bg-muted text-muted-foreground"
      )}
    >
      {value}
    </span>
  ),
  
  date: (value: string | Date, format: 'short' | 'long' = 'short') => {
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: format === 'short' ? '2-digit' : 'short',
      year: format === 'short' ? '2-digit' : 'numeric',
    });
  },
  
  currency: (value: number, currency = 'BRL') =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value),
  
  percentage: (value: number, decimals = 1) =>
    `${value.toFixed(decimals)}%`,
  
  boolean: (value: boolean, trueLabel = 'Sim', falseLabel = 'Não') => (
    <span className={cn(value ? 'text-success' : 'text-muted-foreground')}>
      {value ? trueLabel : falseLabel}
    </span>
  ),
};

// Quick row actions presets
export const QuickRowActions = {
  view: <T,>(onClick: (row: T) => void): RowAction<T> => ({
    id: 'view',
    label: 'Visualizar',
    icon: Eye,
    onClick,
  }),
  
  edit: <T,>(onClick: (row: T) => void): RowAction<T> => ({
    id: 'edit',
    label: 'Editar',
    icon: Pencil,
    onClick,
  }),
  
  delete: <T,>(onClick: (row: T) => void): RowAction<T> => ({
    id: 'delete',
    label: 'Excluir',
    icon: Trash2,
    onClick,
    variant: 'destructive',
  }),
};
