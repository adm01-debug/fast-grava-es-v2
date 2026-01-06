import * as React from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  GripVertical,
  Eye,
  EyeOff,
  Filter,
  Download,
  Trash2,
  Edit,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  minWidth?: number;
  hidden?: boolean;
}

interface EnhancedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  onBulkAction?: (action: string, selectedRows: T[]) => void;
  selectable?: boolean;
  reorderable?: boolean;
  resizable?: boolean;
  stickyHeader?: boolean;
  rowActions?: {
    label: string;
    icon?: React.ReactNode;
    action: (row: T) => void;
    variant?: "default" | "destructive";
  }[];
  emptyState?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export function EnhancedTable<T extends { id: string | number }>({
  data,
  columns: initialColumns,
  onRowClick,
  onBulkAction,
  selectable = false,
  reorderable = false,
  resizable = false,
  stickyHeader = false,
  rowActions,
  emptyState,
  loading,
  className,
}: EnhancedTableProps<T>) {
  const [columns, setColumns] = React.useState(initialColumns);
  const [selectedRows, setSelectedRows] = React.useState<Set<string | number>>(new Set());
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T | null;
    direction: "asc" | "desc" | null;
  }>({ key: null, direction: null });
  const [columnFilters, setColumnFilters] = React.useState<Record<string, string>>({});
  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({});

  // Filter visible columns
  const visibleColumns = columns.filter((col) => !col.hidden);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Filter data
  const filteredData = React.useMemo(() => {
    return sortedData.filter((row) => {
      return Object.entries(columnFilters).every(([key, value]) => {
        if (!value) return true;
        const column = columns.find((c) => c.id === key);
        if (!column?.accessorKey) return true;
        const cellValue = String(row[column.accessorKey] || "").toLowerCase();
        return cellValue.includes(value.toLowerCase());
      });
    });
  }, [sortedData, columnFilters, columns]);

  // Selection handlers
  const isAllSelected = selectedRows.size === filteredData.length && filteredData.length > 0;
  const isSomeSelected = selectedRows.size > 0 && selectedRows.size < filteredData.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData.map((row) => row.id)));
    }
  };

  const handleSelectRow = (id: string | number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  // Sort handler
  const handleSort = (columnId: string) => {
    const column = columns.find((c) => c.id === columnId);
    if (!column?.sortable || !column.accessorKey) return;

    setSortConfig((prev) => {
      if (prev.key === column.accessorKey) {
        if (prev.direction === "asc") return { key: column.accessorKey, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: null };
      }
      return { key: column.accessorKey, direction: "asc" };
    });
  };

  // Column visibility toggle
  const toggleColumnVisibility = (columnId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, hidden: !col.hidden } : col
      )
    );
  };

  // Bulk actions
  const getSelectedRows = () => filteredData.filter((row) => selectedRows.has(row.id));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Bulk actions bar */}
      {selectable && selectedRows.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20"
        >
          <span className="text-sm font-medium">
            {selectedRows.size} item(s) selecionado(s)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBulkAction?.("delete", getSelectedRows())}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onBulkAction?.("export", getSelectedRows())}
            >
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedRows(new Set())}>
              Limpar seleção
            </Button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className={cn("rounded-lg border overflow-auto", stickyHeader && "max-h-[600px]")}>
        <Table>
          <TableHeader className={cn(stickyHeader && "sticky top-0 bg-card z-10")}>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Selecionar todos"
                    className={isSomeSelected ? "data-[state=checked]:bg-primary/50" : ""}
                  />
                </TableHead>
              )}

              {visibleColumns.map((column) => (
                <TableHead
                  key={column.id}
                  style={{
                    width: columnWidths[column.id] || column.width,
                    minWidth: column.minWidth,
                  }}
                  className={cn(column.sortable && "cursor-pointer select-none")}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    {reorderable && (
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    )}
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span className="text-muted-foreground">
                        {sortConfig.key === column.accessorKey ? (
                          sortConfig.direction === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </span>
                    )}
                  </div>

                  {column.filterable && (
                    <Input
                      placeholder="Filtrar..."
                      value={columnFilters[column.id] || ""}
                      onChange={(e) =>
                        setColumnFilters((prev) => ({
                          ...prev,
                          [column.id]: e.target.value,
                        }))
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 h-7 text-xs"
                    />
                  )}
                </TableHead>
              ))}

              {rowActions && rowActions.length > 0 && (
                <TableHead className="w-12">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        Colunas visíveis
                      </div>
                      <DropdownMenuSeparator />
                      {columns.map((col) => (
                        <DropdownMenuItem
                          key={col.id}
                          onClick={() => toggleColumnVisibility(col.id)}
                        >
                          {col.hidden ? (
                            <EyeOff className="h-4 w-4 mr-2" />
                          ) : (
                            <Eye className="h-4 w-4 mr-2" />
                          )}
                          {col.header}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {selectable && (
                    <TableCell>
                      <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                  )}
                  {visibleColumns.map((col) => (
                    <TableCell key={col.id}>
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                  ))}
                  {rowActions && (
                    <TableCell>
                      <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={cn(
                    "border-b transition-colors",
                    selectedRows.has(row.id) && "bg-primary/5",
                    onRowClick && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.has(row.id)}
                        onCheckedChange={() => handleSelectRow(row.id)}
                      />
                    </TableCell>
                  )}

                  {visibleColumns.map((column) => (
                    <TableCell key={column.id}>
                      {column.cell
                        ? column.cell(row)
                        : column.accessorKey
                        ? String(row[column.accessorKey] ?? "")
                        : null}
                    </TableCell>
                  ))}

                  {rowActions && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {rowActions.map((action, i) => (
                            <DropdownMenuItem
                              key={i}
                              onClick={() => action.action(row)}
                              className={
                                action.variant === "destructive"
                                  ? "text-destructive"
                                  : ""
                              }
                            >
                              {action.icon}
                              <span className="ml-2">{action.label}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </motion.tr>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={
                    visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)
                  }
                  className="h-32 text-center"
                >
                  {emptyState || (
                    <p className="text-muted-foreground">Nenhum dado encontrado.</p>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
