import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";

interface VirtualizedTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: React.ReactNode;
    className?: string;
    cell: (item: T, index: number) => React.ReactNode;
  }[];
  rowHeight?: number;
  maxHeight?: number;
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: string | ((item: T, index: number) => string);
  emptyMessage?: string;
  headerClassName?: string;
  overscan?: number;
}

export function VirtualizedTable<T>({
  data,
  columns,
  rowHeight = 52,
  maxHeight = 600,
  onRowClick,
  rowClassName,
  emptyMessage = "Nenhum item encontrado",
  headerClassName,
  overscan = 5,
}: VirtualizedTableProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  if (data.length === 0) {
    return (
      <div className="w-full">
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className={cn("[&_tr]:border-b", headerClassName)}>
              <tr className="border-b transition-colors hover:bg-transparent border-border/30">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
                      col.className
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-4 text-center text-muted-foreground py-8"
                >
                  {emptyMessage}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        {/* Fixed Header */}
        <table className="w-full caption-bottom text-sm">
          <thead className={cn("[&_tr]:border-b", headerClassName)}>
            <tr className="border-b transition-colors hover:bg-transparent border-border/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>

        {/* Virtualized Body */}
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{ maxHeight }}
        >
          <div
            style={{
              height: `${totalSize}px`,
              width: "100%",
              position: "relative",
            }}
          >
            <table className="w-full caption-bottom text-sm">
              <tbody>
                {virtualItems.map((virtualRow) => {
                  const item = data[virtualRow.index];
                  const rowClass =
                    typeof rowClassName === "function"
                      ? rowClassName(item, virtualRow.index)
                      : rowClassName;

                  return (
                    <tr
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className={cn(
                        "border-b transition-colors border-border/20 hover:bg-muted/50",
                        onRowClick && "cursor-pointer",
                        rowClass
                      )}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${rowHeight}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      onClick={() => onRowClick?.(item, virtualRow.index)}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn("p-4 align-middle", col.className)}
                        >
                          {col.cell(item, virtualRow.index)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
