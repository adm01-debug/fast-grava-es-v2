import { z } from 'zod';

export interface ImportResult<T> {
  success: T[];
  errors: ImportError[];
  total: number;
  skipped: number;
}

export interface ImportError {
  row: number;
  field: string;
  value: unknown;
  error: string;
}

export interface CSVImportOptions {
  skipFirstRow?: boolean;
  delimiter?: string;
  encoding?: string;
  trimValues?: boolean;
}

// Built-in CSV parser (no external dependency)
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

function parseCSVString(csvString: string, delimiter: string, trimValues: boolean): Record<string, string>[] {
  const lines = csvString.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0], delimiter).map(h => 
    h.trim().toLowerCase().replace(/\s+/g, '_')
  );

  // Parse data rows
  const data: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      const value = values[index] || '';
      row[header] = trimValues ? value.trim() : value;
    });
    data.push(row);
  }

  return data;
}

export async function importCSV<T>(
  file: File,
  schema: z.ZodSchema<T>,
  options: CSVImportOptions = {}
): Promise<ImportResult<T>> {
  const {
    delimiter = ',',
    trimValues = true,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSVString(text, delimiter, trimValues);
        
        const success: T[] = [];
        const errors: ImportError[] = [];
        let skipped = 0;

        data.forEach((row, index) => {
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
                  row: index + 2, // +2 for header and 0-index
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
          total: data.length,
          skipped,
        });
      } catch (error) {
        reject(new Error(`Erro ao processar CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
}

// Generate CSV template
export function generateCSVTemplate(
  columns: { name: string; example?: string; required?: boolean }[]
): string {
  const headers = columns.map(col => col.name).join(',');
  const examples = columns.map(col => col.example ?? '').join(',');
  return `${headers}\n${examples}`;
}

// Download CSV template
export function downloadCSVTemplate(
  columns: { name: string; example?: string; required?: boolean }[],
  filename: string
): void {
  const content = generateCSVTemplate(columns);
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
