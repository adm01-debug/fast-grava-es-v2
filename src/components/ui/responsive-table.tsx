import * as React from "react";
import { useDevice } from "@/hooks/use-device";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  cell?: (row: T, index: number) => React.ReactNode;
  mobileHidden?: boolean; // Hide this column on mobile
  mobilePriority?: number; // Lower = shown first in card view
  className?: string;
  headerClassName?: string;
}

export interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  mobileCardRender?: (row: T, index: number) => React.ReactNode;
  onRowClick?: (row: T, index: number) => void;
  emptyMessage?: string;
  className?: string;
  tableClassName?: string;
  cardClassName?: string;
  loading?: boolean;
  keyExtractor?: (row: T, index: number) => string;
}

export function ResponsiveTable<T extends Record<string, unknown>>({
  data,
  columns,
  mobileCardRender,
  onRowClick,
  emptyMessage = "Nenhum dado encontrado",
  className,
  tableClassName,
  cardClassName,
  loading = false,
  keyExtractor,
}: ResponsiveTableProps<T>) {
  const { isMobile } = useDevice();

  // Get cell value helper
  const getCellValue = (row: T, column: Column<T>, index: number): React.ReactNode => {
    if (column.cell) {
      return column.cell(row, index);
    }
    const value = row[column.key as keyof T];
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Sim" : "Não";
    return String(value);
  };

  // Get key for row
  const getRowKey = (row: T, index: number): string => {
    if (keyExtractor) return keyExtractor(row, index);
    if ("id" in row) return String(row.id);
    return String(index);
  };

  // Empty state
  if (data.length === 0 && !loading) {
    return (
      <div className={cn("flex items-center justify-center p-8 text-muted-foreground", className)}>
        {emptyMessage}
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 rounded-lg bg-muted/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    // Sort columns by mobile priority
    const sortedColumns = [...columns]
      .filter((col) => !col.mobileHidden)
      .sort((a, b) => (a.mobilePriority ?? 99) - (b.mobilePriority ?? 99));

    return (
      <div className={cn("space-y-3", className)}>
        {data.map((row, index) => (
          <Card
            key={getRowKey(row, index)}
            className={cn(
              "transition-all duration-200",
              onRowClick && "cursor-pointer hover:shadow-md active:scale-[0.99]",
              cardClassName
            )}
            onClick={() => onRowClick?.(row, index)}
          >
            <CardContent className="p-4">
              {mobileCardRender ? (
                mobileCardRender(row, index)
              ) : (
                <div className="space-y-2">
                  {sortedColumns.map((column, colIndex) => (
                    <div
                      key={String(column.key)}
                      className={cn(
                        "flex items-start justify-between gap-2",
                        colIndex === 0 && "text-base font-medium"
                      )}
                    >
                      {colIndex !== 0 && (
                        <span className="text-muted-foreground text-sm shrink-0">
                          {column.header}:
                        </span>
                      )}
                      <span
                        className={cn(
                          colIndex === 0
                            ? "text-foreground"
                            : "text-sm text-right",
                          column.className
                        )}
                      >
                        {getCellValue(row, column, index)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className={cn("overflow-x-auto", className)}>
      <Table className={tableClassName}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={String(column.key)}
                className={column.headerClassName}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow
              key={getRowKey(row, rowIndex)}
              className={cn(
                onRowClick && "cursor-pointer hover:bg-muted/80"
              )}
              onClick={() => onRowClick?.(row, rowIndex)}
            >
              {columns.map((column) => (
                <TableCell
                  key={String(column.key)}
                  className={column.className}
                >
                  {getCellValue(row, column, rowIndex)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
