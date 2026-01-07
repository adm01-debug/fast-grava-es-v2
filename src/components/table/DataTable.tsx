import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Settings2,
  Download,
  Filter,
  X,
  Search,
  MoreHorizontal
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  id: string;
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => unknown;
  cell?: (value: unknown, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  hidden?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  showColumnToggle?: boolean;
  showExport?: boolean;
  onExport?: (data: T[], format: 'csv' | 'json') => void;
  pagination?: {
    pageSize: number;
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  loading?: boolean;
  emptyMessage?: string;
  rowActions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
  stickyHeader?: boolean;
}

// ============================================
// DATA TABLE
// ============================================

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns: initialColumns,
  keyField,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  searchable = true,
  searchPlaceholder = "Buscar...",
  showColumnToggle = true,
  showExport = false,
  onExport,
  pagination,
  loading = false,
  emptyMessage = "Nenhum dado encontrado",
  rowActions,
  onRowClick,
  className,
  stickyHeader = false
}: DataTableProps<T>) {
  const [columns, setColumns] = useState(initialColumns);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const visibleColumns = useMemo(() => 
    columns.filter(col => !col.hidden), 
    [columns]
  );

  const getValue = useCallback((row: T, column: Column<T>): unknown => {
    if (column.accessorFn) return column.accessorFn(row);
    if (column.accessorKey) return row[column.accessorKey];
    return null;
  }, []);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Global search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(row =>
        visibleColumns.some(col => {
          const value = getValue(row, col);
          return String(value).toLowerCase().includes(query);
        })
      );
    }

    // Column filters
    Object.entries(columnFilters).forEach(([columnId, filterValue]) => {
      if (!filterValue) return;
      const column = columns.find(c => c.id === columnId);
      if (!column) return;
      
      result = result.filter(row => {
        const value = getValue(row, column);
        return String(value).toLowerCase().includes(filterValue.toLowerCase());
      });
    });

    return result;
  }, [data, searchQuery, columnFilters, columns, visibleColumns, getValue]);

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    const column = columns.find(c => c.id === sortColumn);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getValue(a, column);
      const bValue = getValue(b, column);

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, columns, getValue]);

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const toggleColumnVisibility = (columnId: string) => {
    setColumns(prev => prev.map(col =>
      col.id === columnId ? { ...col, hidden: !col.hidden } : col
    ));
  };

  const isAllSelected = selectedRows.length === sortedData.length && sortedData.length > 0;
  const isSomeSelected = selectedRows.length > 0 && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(sortedData);
    }
  };

  const handleSelectRow = (row: T) => {
    const isSelected = selectedRows.some(r => r[keyField] === row[keyField]);
    if (isSelected) {
      onSelectionChange?.(selectedRows.filter(r => r[keyField] !== row[keyField]));
    } else {
      onSelectionChange?.([...selectedRows, row]);
    }
  };

  const SortIcon = ({ columnId }: { columnId: string }) => {
    if (sortColumn !== columnId) return <ChevronsUpDown className="h-4 w-4 opacity-50" />;
    if (sortDirection === 'asc') return <ChevronUp className="h-4 w-4" />;
    return <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          {searchable && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {Object.keys(columnFilters).length > 0 && (
            <div className="flex items-center gap-1">
              {Object.entries(columnFilters).map(([columnId, value]) => {
                if (!value) return null;
                const column = columns.find(c => c.id === columnId);
                return (
                  <Badge key={columnId} variant="secondary" className="gap-1">
                    {typeof column?.header === 'string' ? column.header : columnId}: {value}
                    <button
                      onClick={() => setColumnFilters(prev => ({ ...prev, [columnId]: '' }))}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setColumnFilters({})}
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showColumnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Colunas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {columns.map(column => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={!column.hidden}
                    onCheckedChange={() => toggleColumnVisibility(column.id)}
                  >
                    {typeof column.header === 'string' ? column.header : column.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {showExport && onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExport(sortedData, 'csv')}>
                  Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport(sortedData, 'json')}>
                  Exportar JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Selection info */}
      {selectable && selectedRows.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          <span className="text-sm">
            {selectedRows.length} item(ns) selecionado(s)
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectionChange?.([])}
          >
            Limpar seleção
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader className={cn(stickyHeader && "sticky top-0 bg-background z-10")}>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Selecionar todos"
                    {...(isSomeSelected ? { 'data-state': 'indeterminate' } : {})}
                  />
                </TableHead>
              )}
              {visibleColumns.map(column => (
                <TableHead
                  key={column.id}
                  style={{ width: column.width }}
                  className={cn(
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sticky && 'sticky left-0 bg-background'
                  )}
                >
                  <div className="flex items-center gap-2">
                    {column.sortable !== false ? (
                      <button
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                        onClick={() => handleSort(column.id)}
                      >
                        {column.header}
                        <SortIcon columnId={column.id} />
                      </button>
                    ) : (
                      column.header
                    )}

                    {column.filterable && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Filter className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <div className="p-2">
                            <Input
                              placeholder="Filtrar..."
                              value={columnFilters[column.id] || ''}
                              onChange={(e) => setColumnFilters(prev => ({
                                ...prev,
                                [column.id]: e.target.value
                              }))}
                              className="h-8"
                            />
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableHead>
              ))}
              {rowActions && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                  className="h-32 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                  className="h-32 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map(row => {
                const isSelected = selectedRows.some(r => r[keyField] === row[keyField]);
                return (
                  <TableRow
                    key={String(row[keyField])}
                    className={cn(
                      isSelected && "bg-muted/50",
                      onRowClick && "cursor-pointer hover:bg-muted/50"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleSelectRow(row)}
                          aria-label="Selecionar linha"
                        />
                      </TableCell>
                    )}
                    {visibleColumns.map(column => {
                      const value = getValue(row, column);
                      return (
                        <TableCell
                          key={column.id}
                          className={cn(
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            column.sticky && 'sticky left-0 bg-background'
                          )}
                        >
                          {column.cell ? column.cell(value, row) : String(value ?? '')}
                        </TableCell>
                      );
                    })}
                    {rowActions && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {rowActions(row)}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((pagination.currentPage - 1) * pagination.pageSize) + 1} a{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} de{' '}
            {pagination.totalItems} resultados
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage * pagination.pageSize >= pagination.totalItems}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// HOOK: useDataTable
// ============================================

interface UseDataTableOptions<T> {
  data: T[];
  pageSize?: number;
  initialSort?: { column: string; direction: SortDirection };
}

export function useDataTable<T>({
  data,
  pageSize = 10,
  initialSort
}: UseDataTableOptions<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(initialSort?.column ?? null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSort?.direction ?? null);

  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const resetSelection = useCallback(() => {
    setSelectedRows([]);
  }, []);

  return {
    currentPage,
    totalPages,
    pageSize,
    paginatedData,
    selectedRows,
    setSelectedRows,
    sortColumn,
    setSortColumn,
    sortDirection,
    setSortDirection,
    goToPage,
    resetSelection,
    pagination: {
      pageSize,
      currentPage,
      totalItems: data.length,
      onPageChange: goToPage
    }
  };
}
