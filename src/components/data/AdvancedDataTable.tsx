import React, { useState, useMemo, useCallback } from 'react';
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  MoreHorizontal,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================

export interface ColumnDef<T> {
  id: string;
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => unknown;
  cell?: (info: { row: T; value: unknown }) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
  sticky?: 'left' | 'right';
}

export interface RowAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive';
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  rowActions?: RowAction<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  enableSearch?: boolean;
  enableSelection?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  getRowId?: (row: T) => string;
  className?: string;
  stickyHeader?: boolean;
  striped?: boolean;
  compact?: boolean;
}

// ============================================
// DATA TABLE COMPONENT
// ============================================

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  rowActions,
  isLoading = false,
  emptyMessage = 'Nenhum dado encontrado',
  searchPlaceholder = 'Buscar...',
  enableSearch = true,
  enableSelection = false,
  enablePagination = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  onRowClick,
  onSelectionChange,
  getRowId = (row) => String(row.id || Math.random()),
  className,
  stickyHeader = false,
  striped = false,
  compact = false
}: DataTableProps<T>) {
  // State
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.filter(c => !c.hidden).map(c => c.id))
  );

  // Get cell value
  const getCellValue = useCallback((row: T, column: ColumnDef<T>): unknown => {
    if (column.accessorFn) {
      return column.accessorFn(row);
    }
    if (column.accessorKey) {
      return row[column.accessorKey];
    }
    return null;
  }, []);

  // Filtered data
  const filteredData = useMemo(() => {
    if (!search) return data;
    
    const searchLower = search.toLowerCase();
    return data.filter(row => {
      return columns.some(column => {
        if (!column.filterable) return false;
        const value = getCellValue(row, column);
        return String(value || '').toLowerCase().includes(searchLower);
      });
    });
  }, [data, search, columns, getCellValue]);

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    
    const column = columns.find(c => c.id === sortColumn);
    if (!column) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = getCellValue(a, column);
      const bVal = getCellValue(b, column);
      
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, columns, getCellValue]);

  // Paginated data
  const paginatedData = useMemo(() => {
    if (!enablePagination) return sortedData;
    
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, enablePagination]);

  // Pagination info
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, sortedData.length);

  // Visible columns
  const displayColumns = columns.filter(c => visibleColumns.has(c.id));

  // Handlers
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(paginatedData.map(row => getRowId(row)));
      setSelectedIds(newSelected);
      onSelectionChange?.(paginatedData);
    } else {
      setSelectedIds(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (row: T, checked: boolean) => {
    const id = getRowId(row);
    const newSelected = new Set(selectedIds);
    
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    
    setSelectedIds(newSelected);
    onSelectionChange?.(data.filter(r => newSelected.has(getRowId(r))));
  };

  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  const isAllSelected = paginatedData.length > 0 && 
    paginatedData.every(row => selectedIds.has(getRowId(row)));
  const isSomeSelected = paginatedData.some(row => selectedIds.has(getRowId(row)));

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {enableSearch && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-9"
            />
            {search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearch('')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Badge variant="secondary">
              {selectedIds.size} selecionado(s)
            </Badge>
          )}

          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="w-4 h-4 mr-2" />
                Colunas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {columns.map(column => (
                <DropdownMenuItem
                  key={column.id}
                  onClick={() => toggleColumnVisibility(column.id)}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    checked={visibleColumns.has(column.id)}
                    className="pointer-events-none"
                  />
                  <span>{typeof column.header === 'string' ? column.header : column.id}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className={cn(
        'rounded-lg border overflow-hidden',
        stickyHeader && 'max-h-[600px] overflow-auto'
      )}>
        <Table>
          <TableHeader className={cn(stickyHeader && 'sticky top-0 bg-background z-10')}>
            <TableRow>
              {enableSelection && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) {
                        (el as unknown as HTMLInputElement).indeterminate = !isAllSelected && isSomeSelected;
                      }
                    }}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {displayColumns.map(column => (
                <TableHead
                  key={column.id}
                  style={{ width: column.width }}
                  className={cn(
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.sortable && 'cursor-pointer select-none hover:bg-muted/50'
                  )}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className={cn(
                    'flex items-center gap-2',
                    column.align === 'center' && 'justify-center',
                    column.align === 'right' && 'justify-end'
                  )}>
                    {column.header}
                    {column.sortable && (
                      <span className="text-muted-foreground">
                        {sortColumn === column.id ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-4 h-4" />
                          ) : (
                            <ArrowDown className="w-4 h-4" />
                          )
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              {rowActions && rowActions.length > 0 && (
                <TableHead className="w-12" />
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={displayColumns.length + (enableSelection ? 1 : 0) + (rowActions ? 1 : 0)}
                    className="h-32"
                  >
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Carregando...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={displayColumns.length + (enableSelection ? 1 : 0) + (rowActions ? 1 : 0)}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => {
                  const rowId = getRowId(row);
                  const isSelected = selectedIds.has(rowId);
                  
                  return (
                    <motion.tr
                      key={rowId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, delay: index * 0.02 }}
                      className={cn(
                        'border-b transition-colors',
                        striped && index % 2 === 1 && 'bg-muted/30',
                        isSelected && 'bg-primary/5',
                        onRowClick && 'cursor-pointer hover:bg-muted/50'
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {enableSelection && (
                        <TableCell className={cn(compact && 'py-2')}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectRow(row, !!checked)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                      )}
                      {displayColumns.map(column => {
                        const value = getCellValue(row, column);
                        const cellContent = column.cell 
                          ? column.cell({ row, value })
                          : String(value ?? '');
                        
                        return (
                          <TableCell
                            key={column.id}
                            className={cn(
                              column.align === 'center' && 'text-center',
                              column.align === 'right' && 'text-right',
                              compact && 'py-2'
                            )}
                          >
                            {cellContent}
                          </TableCell>
                        );
                      })}
                      {rowActions && rowActions.length > 0 && (
                        <TableCell className={cn(compact && 'py-2')}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {rowActions.map((action, actionIndex) => {
                                if (action.hidden?.(row)) return null;
                                
                                return (
                                  <DropdownMenuItem
                                    key={actionIndex}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.onClick(row);
                                    }}
                                    disabled={action.disabled?.(row)}
                                    className={cn(
                                      action.variant === 'destructive' && 'text-destructive focus:text-destructive'
                                    )}
                                  >
                                    {action.icon}
                                    <span className="ml-2">{action.label}</span>
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && sortedData.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Mostrando {startItem}-{endItem} de {sortedData.length}</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 rounded-md border bg-background px-2 text-sm"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size} por página</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="px-3 text-sm">
              Página {currentPage} de {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
