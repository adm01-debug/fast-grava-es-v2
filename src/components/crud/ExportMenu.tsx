import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, ExportColumn, ExportOptions } from '@/lib/dataExporter';

interface ExportMenuProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ExportColumn<T>[];
  filename: string;
  title?: string;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ExportMenu<T extends Record<string, unknown>>({
  data,
  columns,
  filename,
  title,
  disabled = false,
  variant = 'outline',
  size = 'sm',
}: ExportMenuProps<T>) {
  const options: ExportOptions = {
    filename,
    title,
    includeTimestamp: true,
  };

  const handleExportCSV = () => {
    exportToCSV(data, columns, options);
  };

  const handleExportExcel = () => {
    exportToExcel(data, columns, options);
  };

  const handleExportPDF = () => {
    exportToPDF(data, columns, options);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled || data.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
          {data.length > 0 && (
            <span className="ml-1 text-xs opacity-70">({data.length})</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar Excel
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportPDF}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimir / PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
