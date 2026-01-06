// Advanced Data Table with Virtualization, Sorting, Filtering, Export
import React, { useState, useMemo, useCallback, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp, ChevronDown, ChevronsUpDown, Search, Filter, Download,
  Settings, Eye, EyeOff, MoreHorizontal, ArrowUpDown, Columns, X,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw,
  Copy, Trash2, Edit, Check, Loader2, FileText, FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';

// Types
type SortDirection = 'asc' | 'desc' | null;
type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'between';

interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => any;
  cell?: (props: { row: T; value: any }) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'number' | 'select' | 'date' | 'boolean';
  filterOptions?: { label: string; value: any }[];
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  hidden?: boolean;
  sticky?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
}

interface FilterValue {
  columnId: string;
  operator: FilterOperator;
  value: any;
  value2?: any; // For 'between' operator
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  enableRowSelection?: boolean;
  enableMultiSort?: boolean;
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  enableVirtualization?: boolean;
  rowHeight?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onRowClick?: (row: T) => void;
  onRowSelect?: (selectedRows: T[]) => void;
  onRowAction?: (action: string, row: T) => void;
  emptyMessage?: string;
  className?: string;
  getRowId?: (row: T, index: number) => string;
}

// Helper functions
function getValue<T>(row: T, column: ColumnDef<T>): any {
  if (column.accessorFn) return column.accessorFn(row);
  if (column.accessorKey) return row[column.accessorKey];
  return undefined;
}

function compareValues(a: any, b: any, direction: SortDirection): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  
  const comparison = a < b ? -1 : 1;
  return direction === 'desc' ? -comparison : comparison;
}

function matchesFilter<T>(row: T, column: ColumnDef<T>, filter: FilterValue): boolean {
  const value = getValue(row, column);
  const filterValue = filter.value;

  switch (filter.operator) {
    case 'equals':
      return value === filterValue;
    case 'contains':
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    case 'startsWith':
      return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
    case 'endsWith':
      return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
    case 'gt':
      return value > filterValue;
    case 'lt':
      return value < filterValue;
    case 'between':
      return value >= filterValue && value <= filter.value2;
    default:
      return true;
  }
}

// Main Component
export function DataTableAdvanced<T extends object>({
  data,
  columns,
  isLoading = false,
  enableRowSelection = false,
  enableMultiSort = false,
  enableColumnVisibility = true,
  enableExport = true,
  enableVirtualization = true,
  rowHeight = 48,
  pageSize: initialPageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  onRowClick,
  onRowSelect,
  onRowAction,
  emptyMessage = 'Nenhum dado encontrado',
  className,
  getRowId = (row: T, index?: number) => String(index)
}: DataTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<FilterValue[]>([]);
  const [sorting, setSorting] = useState<{ id: string; direction: SortDirection }[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() =>
    columns.reduce((acc, col) => ({ ...acc, [col.id]: !col.hidden }), {})
  );
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const parentRef = useRef<HTMLDivElement>(null);

  // Filter data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply global filter
    if (globalFilter) {
      const lowerFilter = globalFilter.toLowerCase();
      result = result.filter(row =>
        columns.some(col => {
          const value = getValue(row, col);
          return String(value).toLowerCase().includes(lowerFilter);
        })
      );
    }

    // Apply column filters
    columnFilters.forEach(filter => {
      const column = columns.find(c => c.id === filter.columnId);
      if (column) {
        result = result.filter(row => matchesFilter(row, column, filter));
      }
    });

    return result;
  }, [data, globalFilter, columnFilters, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (sorting.length === 0) return filteredData;

    return [...filteredData].sort((a, b) => {
      for (const sort of sorting) {
        const column = columns.find(c => c.id === sort.id);
        if (!column || !sort.direction) continue;

        const aVal = getValue(a, column);
        const bVal = getValue(b, column);
        const result = compareValues(aVal, bVal, sort.direction);
        if (result !== 0) return result;
      }
      return 0;
    });
  }, [filteredData, sorting, columns]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (enableVirtualization) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, enableVirtualization]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Visible columns
  const visibleColumns = useMemo(() =>
    columns.filter(col => columnVisibility[col.id]),
    [columns, columnVisibility]
  );

  // Virtualization
  const rowVirtualizer = useVirtualizer({
    count: enableVirtualization ? sortedData.length : paginatedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5
  });

  // Toggle sort
  const toggleSort = useCallback((columnId: string) => {
    setSorting(prev => {
      const existing = prev.find(s => s.id === columnId);
      
      if (!existing) {
        return enableMultiSort 
          ? [...prev, { id: columnId, direction: 'asc' as SortDirection }]
          : [{ id: columnId, direction: 'asc' as SortDirection }];
      }

      if (existing.direction === 'asc') {
        return prev.map(s => s.id === columnId ? { ...s, direction: 'desc' as SortDirection } : s);
      }

      return prev.filter(s => s.id !== columnId);
    });
  }, [enableMultiSort]);

  // Toggle row selection
  const toggleRowSelection = useCallback((rowId: string) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }, []);

  // Toggle all selection
  const toggleAllSelection = useCallback(() => {
    const displayData = enableVirtualization ? sortedData : paginatedData;
    if (selectedRows.size === displayData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(displayData.map((row, i) => getRowId(row, i))));
    }
  }, [sortedData, paginatedData, selectedRows, enableVirtualization, getRowId]);

  // Export functions
  const exportToCSV = useCallback(() => {
    const headers = visibleColumns.map(col => col.header).join(',');
    const rows = sortedData.map(row =>
      visibleColumns.map(col => {
        const value = getValue(row, col);
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : String(value ?? '');
      }).join(',')
    ).join('\n');

    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedData, visibleColumns]);

  // Effect for row selection callback
  useEffect(() => {
    if (onRowSelect) {
      const selected = (enableVirtualization ? sortedData : paginatedData)
        .filter((row, i) => selectedRows.has(getRowId(row, i)));
      onRowSelect(selected);
    }
  }, [selectedRows, sortedData, paginatedData, onRowSelect, enableVirtualization, getRowId]);

  const displayData = enableVirtualization ? sortedData : paginatedData;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar em todos os campos..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>

          {columnFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setColumnFilters([])}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar filtros
              <Badge variant="secondary" className="ml-1">
                {columnFilters.length}
              </Badge>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns className="h-4 w-4 mr-2" />
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {columns.map(col => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={columnVisibility[col.id]}
                    onCheckedChange={(checked) =>
                      setColumnVisibility(prev => ({ ...prev, [col.id]: checked }))
                    }
                  >
                    {col.header}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {enableExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log('Export JSON')}>
                  <FileText className="h-4 w-4 mr-2" />
                  JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {selectedRows.size > 0 && (
            <Badge variant="secondary">
              {selectedRows.size} selecionado(s)
            </Badge>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{ maxHeight: enableVirtualization ? '600px' : 'auto' }}
        >
          <table className="w-full border-collapse">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr>
                {enableRowSelection && (
                  <th className="w-12 p-3 text-left">
                    <Checkbox
                      checked={selectedRows.size === displayData.length && displayData.length > 0}
                      onCheckedChange={toggleAllSelection}
                    />
                  </th>
                )}
                {visibleColumns.map(column => (
                  <th
                    key={column.id}
                    className={cn(
                      'p-3 text-left font-medium text-sm',
                      column.sortable && 'cursor-pointer select-none hover:bg-muted/80'
                    )}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth || 100,
                      maxWidth: column.maxWidth,
                      textAlign: column.align || 'left'
                    }}
                    onClick={() => column.sortable && toggleSort(column.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {column.sortable && (
                        <SortIndicator
                          direction={sorting.find(s => s.id === column.id)?.direction || null}
                        />
                      )}
                      {column.filterable && (
                        <ColumnFilter
                          column={column}
                          filters={columnFilters}
                          onFilterChange={setColumnFilters}
                        />
                      )}
                    </div>
                  </th>
                ))}
                {onRowAction && <th className="w-12 p-3" />}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {enableRowSelection && (
                      <td className="p-3"><Skeleton className="h-4 w-4" /></td>
                    )}
                    {visibleColumns.map(col => (
                      <td key={col.id} className="p-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : displayData.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + (enableRowSelection ? 1 : 0) + (onRowAction ? 1 : 0)}
                    className="p-8 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : enableVirtualization ? (
                <>
                  <tr style={{ height: `${rowVirtualizer.getVirtualItems()[0]?.start || 0}px` }} />
                  {rowVirtualizer.getVirtualItems().map(virtualRow => {
                    const row = sortedData[virtualRow.index];
                    const rowId = getRowId(row, virtualRow.index);
                    return (
                      <TableRow
                        key={rowId}
                        row={row}
                        rowId={rowId}
                        columns={visibleColumns}
                        isSelected={selectedRows.has(rowId)}
                        enableRowSelection={enableRowSelection}
                        onToggleSelection={toggleRowSelection}
                        onClick={onRowClick}
                        onAction={onRowAction}
                        style={{ height: rowHeight }}
                      />
                    );
                  })}
                  <tr style={{ height: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems().at(-1)?.end || 0)}px` }} />
                </>
              ) : (
                paginatedData.map((row, index) => {
                  const rowId = getRowId(row, index);
                  return (
                    <TableRow
                      key={rowId}
                      row={row}
                      rowId={rowId}
                      columns={visibleColumns}
                      isSelected={selectedRows.has(rowId)}
                      enableRowSelection={enableRowSelection}
                      onToggleSelection={toggleRowSelection}
                      onClick={onRowClick}
                      onAction={onRowAction}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!enableVirtualization && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Mostrando</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
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
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-4 text-sm">
              Página {currentPage} de {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Table Row Component
interface TableRowProps<T> {
  row: T;
  rowId: string;
  columns: ColumnDef<T>[];
  isSelected: boolean;
  enableRowSelection: boolean;
  onToggleSelection: (id: string) => void;
  onClick?: (row: T) => void;
  onAction?: (action: string, row: T) => void;
  style?: React.CSSProperties;
}

function TableRow<T>({
  row, rowId, columns, isSelected, enableRowSelection,
  onToggleSelection, onClick, onAction, style
}: TableRowProps<T>) {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'border-b transition-colors',
        isSelected && 'bg-muted/50',
        onClick && 'cursor-pointer hover:bg-muted/30'
      )}
      style={style}
      onClick={() => onClick?.(row)}
    >
      {enableRowSelection && (
        <td className="p-3" onClick={e => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(rowId)}
          />
        </td>
      )}
      {columns.map(column => (
        <td
          key={column.id}
          className="p-3"
          style={{ textAlign: column.align || 'left' }}
        >
          {column.cell
            ? column.cell({ row, value: getValue(row, column) })
            : String(getValue(row, column) ?? '-')
          }
        </td>
      ))}
      {onAction && (
        <td className="p-3" onClick={e => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAction('edit', row)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction('copy', row)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onAction('delete', row)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      )}
    </motion.tr>
  );
}

// Sort Indicator
function SortIndicator({ direction }: { direction: SortDirection }) {
  if (!direction) {
    return <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />;
  }
  return direction === 'asc' 
    ? <ChevronUp className="h-4 w-4" />
    : <ChevronDown className="h-4 w-4" />;
}

// Column Filter Popover
interface ColumnFilterProps<T> {
  column: ColumnDef<T>;
  filters: FilterValue[];
  onFilterChange: (filters: FilterValue[]) => void;
}

function ColumnFilter<T>({ column, filters, onFilterChange }: ColumnFilterProps<T>) {
  const currentFilter = filters.find(f => f.columnId === column.id);
  const [localValue, setLocalValue] = useState(currentFilter?.value || '');

  const applyFilter = () => {
    if (!localValue) {
      onFilterChange(filters.filter(f => f.columnId !== column.id));
    } else {
      const newFilter: FilterValue = {
        columnId: column.id,
        operator: 'contains',
        value: localValue
      };
      onFilterChange([
        ...filters.filter(f => f.columnId !== column.id),
        newFilter
      ]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild onClick={e => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-6 w-6', currentFilter && 'text-primary')}
        >
          <Filter className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" onClick={e => e.stopPropagation()}>
        <div className="space-y-3">
          <p className="text-sm font-medium">Filtrar {column.header}</p>
          <Input
            placeholder="Digite para filtrar..."
            value={localValue}
            onChange={e => setLocalValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyFilter()}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLocalValue('');
                onFilterChange(filters.filter(f => f.columnId !== column.id));
              }}
            >
              Limpar
            </Button>
            <Button size="sm" onClick={applyFilter}>
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
