import { z } from 'zod';
import { ImportResult, ImportError } from './csvImporter';

export interface ExcelImportOptions {
  sheetName?: string;
  sheetIndex?: number;
  headerRow?: number;
  trimValues?: boolean;
}

// Parse TSV/CSV content for Excel-like import
function parseDelimitedContent(text: string, trimValues: boolean): Record<string, unknown>[] {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Detect delimiter (tab for Excel exports, comma for CSV)
  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  
  // Parse header
  const headers = lines[0].split(delimiter).map(h => 
    h.trim().toLowerCase().replace(/\s+/g, '_').replace(/"/g, '')
  );

  // Parse data rows
  const data: Record<string, unknown>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter);
    const row: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      let value = values[index] || '';
      // Remove quotes
      value = value.replace(/^"(.*)"$/, '$1');
      row[header] = trimValues ? value.trim() : value;
    });
    data.push(row);
  }

  return data;
}

export async function importExcel<T>(
  file: File,
  schema: z.ZodSchema<T>,
  options: ExcelImportOptions = {}
): Promise<ImportResult<T>> {
  const {
    headerRow = 1,
    trimValues = true,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const jsonData = parseDelimitedContent(text, trimValues);

        const success: T[] = [];
        const errors: ImportError[] = [];
        let skipped = 0;

        jsonData.forEach((row, index) => {
          // Skip empty rows
          if (Object.values(row).every(v => !v)) {
            skipped++;
            return;
          }

          try {
            const validated = schema.parse(row);
            success.push(validated);
          } catch (error) {
            if (error instanceof z.ZodError) {
              error.errors.forEach((err) => {
                errors.push({
                  row: index + headerRow + 1,
                  field: err.path.join('.'),
                  value: row[err.path[0] as string],
                  error: err.message,
                });
              });
            }
          }
        });

        resolve({
          success,
          errors,
          total: jsonData.length,
          skipped,
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
}

// Get sheet names (simplified - returns default)
export async function getExcelSheets(_file: File): Promise<string[]> {
  return ['Sheet1'];
}

// Generate Excel template (as TSV)
export function generateExcelTemplate(
  columns: { name: string; example?: string; required?: boolean }[],
  _sheetName: string = 'Template'
): Blob {
  const header = columns.map(col => col.name).join('\t');
  const example = columns.map(col => col.example ?? '').join('\t');
  const content = `${header}\n${example}`;
  
  return new Blob(['\ufeff' + content], { type: 'application/vnd.ms-excel;charset=utf-8;' });
}

// Download Excel template
export function downloadExcelTemplate(
  columns: { name: string; example?: string; required?: boolean }[],
  filename: string
): void {
  const blob = generateExcelTemplate(columns);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.xls`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Interface for export columns
interface ExportColumn {
  key: string;
  label: string;
}

// Export data to CSV format
export function exportToCSV(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string
): void {
  const headers = columns.map((c) => c.label).join(',');
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        if (value === null || value === undefined) return '';
        const strValue = String(value);
        if (strValue.includes(',') || strValue.includes('"')) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      })
      .join(',')
  );

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Export data to Excel format (as TSV)
export function exportToExcel(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
  _sheetName: string = 'Dados'
): void {
  const headers = columns.map(c => c.label).join('\t');
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.key];
      if (value === null || value === undefined) return '';
      return String(value).replace(/\t/g, ' ').replace(/\n/g, ' ');
    }).join('\t')
  );
  
  const content = [headers, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + content], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}
