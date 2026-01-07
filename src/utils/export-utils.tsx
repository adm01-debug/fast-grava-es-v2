import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================
// CSV EXPORT
// ============================================

interface CsvExportOptions {
  filename?: string;
  headers?: Record<string, string>; // Map of key -> display header
  dateFormat?: string;
  delimiter?: string;
}

export function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  options: CsvExportOptions = {}
) {
  const {
    filename = 'export',
    headers = {},
    dateFormat = 'dd/MM/yyyy HH:mm',
    delimiter = ','
  } = options;

  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get all unique keys from data
  const allKeys = Array.from(
    new Set(data.flatMap(item => Object.keys(item)))
  );

  // Create header row
  const headerRow = allKeys
    .map(key => headers[key] || key)
    .map(escapeCSV)
    .join(delimiter);

  // Create data rows
  const dataRows = data.map(item => {
    return allKeys
      .map(key => {
        const value = item[key];
        return formatCsvValue(value, dateFormat);
      })
      .map(escapeCSV)
      .join(delimiter);
  });

  // Combine and create blob
  const csvContent = [headerRow, ...dataRows].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  downloadBlob(blob, `${filename}_${getTimestamp()}.csv`);
}

function formatCsvValue(value: unknown, dateFormat: string): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) {
    return format(value, dateFormat, { locale: ptBR });
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ============================================
// JSON EXPORT
// ============================================

interface JsonExportOptions {
  filename?: string;
  pretty?: boolean;
  indent?: number;
}

export function exportToJson<T>(
  data: T,
  options: JsonExportOptions = {}
) {
  const {
    filename = 'export',
    pretty = true,
    indent = 2
  } = options;

  const jsonContent = pretty 
    ? JSON.stringify(data, null, indent)
    : JSON.stringify(data);

  const blob = new Blob([jsonContent], { type: 'application/json' });
  downloadBlob(blob, `${filename}_${getTimestamp()}.json`);
}

// ============================================
// EXCEL EXPORT (simples, usando CSV)
// ============================================

interface ExcelExportOptions extends CsvExportOptions {
  sheetName?: string;
}

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  options: ExcelExportOptions = {}
) {
  // Para Excel real, usaríamos uma lib como xlsx
  // Por simplicidade, usamos CSV com extensão .xls
  const { filename = 'export', ...csvOptions } = options;
  
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const allKeys = Array.from(
    new Set(data.flatMap(item => Object.keys(item)))
  );

  const headers = csvOptions.headers || {};
  const headerRow = allKeys
    .map(key => headers[key] || key)
    .join('\t');

  const dataRows = data.map(item => {
    return allKeys
      .map(key => formatCsvValue(item[key], csvOptions.dateFormat || 'dd/MM/yyyy'))
      .join('\t');
  });

  const content = [headerRow, ...dataRows].join('\n');
  const blob = new Blob(['\ufeff' + content], { 
    type: 'application/vnd.ms-excel;charset=utf-8;' 
  });
  
  downloadBlob(blob, `${filename}_${getTimestamp()}.xls`);
}

// ============================================
// PDF EXPORT (usando jsPDF)
// ============================================

interface PdfExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
  headers?: Record<string, string>;
  columnWidths?: Record<string, number>;
}

export async function exportToPdf<T extends Record<string, unknown>>(
  data: T[],
  options: PdfExportOptions = {}
) {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const {
    filename = 'export',
    title,
    subtitle,
    orientation = 'portrait',
    headers = {}
  } = options;

  const doc = new jsPDF({ orientation });
  
  let yPos = 20;

  // Add title
  if (title) {
    doc.setFontSize(18);
    doc.text(title, 14, yPos);
    yPos += 10;
  }

  // Add subtitle
  if (subtitle) {
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(subtitle, 14, yPos);
    yPos += 10;
  }

  // Get columns
  const allKeys = Array.from(
    new Set(data.flatMap(item => Object.keys(item)))
  );

  const columns = allKeys.map(key => ({
    header: headers[key] || key,
    dataKey: key
  }));

  // Format data
  const tableData = data.map(item => {
    const row: Record<string, string> = {};
    allKeys.forEach(key => {
      row[key] = formatCsvValue(item[key], 'dd/MM/yyyy');
    });
    return row;
  });

  // Add table
  autoTable(doc, {
    startY: yPos + 5,
    columns,
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount} - Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(`${filename}_${getTimestamp()}.pdf`);
}

// ============================================
// PRINT UTILITY
// ============================================

interface PrintOptions {
  title?: string;
  styles?: string;
}

export function printContent(
  content: string | HTMLElement,
  options: PrintOptions = {}
) {
  const { title = document.title, styles = '' } = options;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const htmlContent = typeof content === 'string' 
    ? content 
    : content.outerHTML;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          @media print {
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          }
          ${styles}
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

// ============================================
// CLIPBOARD EXPORT
// ============================================

export async function copyTableToClipboard<T extends Record<string, unknown>>(
  data: T[],
  headers?: Record<string, string>
): Promise<boolean> {
  try {
    if (data.length === 0) return false;

    const allKeys = Array.from(
      new Set(data.flatMap(item => Object.keys(item)))
    );

    const headerRow = allKeys
      .map(key => headers?.[key] || key)
      .join('\t');

    const dataRows = data.map(item => {
      return allKeys
        .map(key => formatCsvValue(item[key], 'dd/MM/yyyy'))
        .join('\t');
    });

    const content = [headerRow, ...dataRows].join('\n');
    await navigator.clipboard.writeText(content);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getTimestamp(): string {
  return format(new Date(), 'yyyyMMdd_HHmmss');
}

// ============================================
// EXPORT BUTTON COMPONENT
// ============================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileJson, FileText, Printer, Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[];
  filename?: string;
  headers?: Record<string, string>;
  title?: string;
  formats?: ('csv' | 'excel' | 'json' | 'pdf' | 'print' | 'copy')[];
  disabled?: boolean;
}

export function ExportButton<T extends Record<string, unknown>>({
  data,
  filename = 'export',
  headers,
  title,
  formats = ['csv', 'excel', 'json', 'pdf'],
  disabled = false
}: ExportButtonProps<T>) {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = async (format: string) => {
    if (data.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    setIsExporting(true);
    
    try {
      switch (format) {
        case 'csv':
          exportToCsv(data, { filename, headers });
          toast.success('CSV exportado com sucesso!');
          break;
        case 'excel':
          exportToExcel(data, { filename, headers });
          toast.success('Excel exportado com sucesso!');
          break;
        case 'json':
          exportToJson(data, { filename });
          toast.success('JSON exportado com sucesso!');
          break;
        case 'pdf':
          await exportToPdf(data, { filename, headers, title });
          toast.success('PDF exportado com sucesso!');
          break;
        case 'copy':
          const success = await copyTableToClipboard(data, headers);
          if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Copiado para a área de transferência!');
          } else {
            toast.error('Erro ao copiar');
          }
          break;
      }
    } catch (error) {
      toast.error('Erro ao exportar dados');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatIcons = {
    csv: FileSpreadsheet,
    excel: FileSpreadsheet,
    json: FileJson,
    pdf: FileText,
    print: Printer,
    copy: copied ? Check : Copy
  };

  const formatLabels = {
    csv: 'Exportar CSV',
    excel: 'Exportar Excel',
    json: 'Exportar JSON',
    pdf: 'Exportar PDF',
    print: 'Imprimir',
    copy: copied ? 'Copiado!' : 'Copiar dados'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || isExporting}>
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {formats.map((format, index) => {
          const Icon = formatIcons[format];
          return (
            <React.Fragment key={format}>
              {format === 'copy' && index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={() => handleExport(format)}>
                <Icon className="w-4 h-4 mr-2" />
                {formatLabels[format]}
              </DropdownMenuItem>
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
