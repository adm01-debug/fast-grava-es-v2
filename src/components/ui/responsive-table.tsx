import { ReactNode } from 'react';
import { useDevice } from '@/hooks/use-device';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  /** Hide this column on mobile table view (used when mobileCard is not provided) */
  hideMobile?: boolean;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  /** Custom mobile card renderer - when provided, renders cards instead of table on mobile */
  mobileCard?: (item: T, index: number) => ReactNode;
  /** Key extractor for list items */
  keyExtractor: (item: T) => string;
  className?: string;
  emptyMessage?: string;
}

/**
 * ResponsiveTable - Renders a table on desktop and cards on mobile.
 * 
 * Usage:
 * ```tsx
 * <ResponsiveTable
 *   data={jobs}
 *   columns={[
 *     { key: 'order', header: 'Pedido', render: (j) => j.order_number },
 *     { key: 'client', header: 'Cliente', render: (j) => j.client, hideMobile: true },
 *   ]}
 *   mobileCard={(job) => (
 *     <div className="flex justify-between">
 *       <span>{job.order_number}</span>
 *       <Badge>{job.status}</Badge>
 *     </div>
 *   )}
 *   keyExtractor={(j) => j.id}
 * />
 * ```
 */
export function ResponsiveTable<T>({
  data,
  columns,
  mobileCard,
  keyExtractor,
  className,
  emptyMessage = 'Nenhum item encontrado',
}: ResponsiveTableProps<T>) {
  const { isMobile } = useDevice();

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    );
  }

  // Mobile card view
  if (isMobile && mobileCard) {
    return (
      <div className={cn('space-y-3', className)}>
        {data.map((item, index) => (
          <Card key={keyExtractor(item)} className="overflow-hidden">
            <CardContent className="p-4">
              {mobileCard(item, index)}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Filter columns for mobile when no card renderer
  const visibleColumns = isMobile
    ? columns.filter((col) => !col.hideMobile)
    : columns;

  return (
    <div className={cn('relative w-full overflow-auto', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.map((col) => (
              <TableHead key={col.key}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={keyExtractor(item)}>
              {visibleColumns.map((col) => (
                <TableCell key={col.key}>{col.render(item)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export type { Column, ResponsiveTableProps };
