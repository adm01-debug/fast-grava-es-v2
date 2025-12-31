import * as XLSX from 'xlsx';

export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  width?: number;
  formatter?: (value: unknown, row: T) => string;
}

export interface ExportOptions {
  filename: string;
  sheetName?: string;
  title?: string;
  includeTimestamp?: boolean;
}

// Export CSV
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  options: ExportOptions
): void {
  const headers = columns.map(col => col.header);
  const rows = data.map(row =>
    columns.map(col => {
      const value = getNestedValue(row, col.key as string);
      return col.formatter ? col.formatter(value, row) : String(value ?? '');
    })
  );

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const filename = options.includeTimestamp
    ? `${options.filename}_${formatTimestamp()}.csv`
    : `${options.filename}.csv`;

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

// Export Excel
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  options: ExportOptions
): void {
  const headers = columns.map(col => col.header);
  const rows = data.map(row =>
    columns.map(col => {
      const value = getNestedValue(row, col.key as string);
      return col.formatter ? col.formatter(value, row) : value ?? '';
    })
  );

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = columns.map(col => ({ wch: col.width ?? 15 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, options.sheetName ?? 'Data');

  const filename = options.includeTimestamp
    ? `${options.filename}_${formatTimestamp()}.xlsx`
    : `${options.filename}.xlsx`;

  XLSX.writeFile(wb, filename);
}

// Export PDF (HTML-based for simplicity)
export function exportToPDF<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn<T>[],
  options: ExportOptions
): void {
  const headers = columns.map(col => col.header);
  const rows = data.map(row =>
    columns.map(col => {
      const value = getNestedValue(row, col.key as string);
      return col.formatter ? col.formatter(value, row) : String(value ?? '');
    })
  );

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${options.title ?? options.filename}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      ${options.title ? `<h1>${options.title}</h1>` : ''}
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <div class="footer">
        Gerado em: ${new Date().toLocaleString('pt-BR')}
        | Total de registros: ${data.length}
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
}

// Helpers
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj as unknown);
}

function formatTimestamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
