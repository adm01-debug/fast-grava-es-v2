import Papa from 'papaparse';
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
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      transform: (value) => trimValues ? value.trim() : value,
      complete: (results) => {
        const success: T[] = [];
        const errors: ImportError[] = [];
        let skipped = 0;

        results.data.forEach((row: unknown, index: number) => {
          // Pular linhas vazias
          if (!row || Object.values(row as object).every(v => !v)) {
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
                  row: index + 2, // +2 para compensar header e índice 0
                  field: err.path.join('.'),
                  value: (row as Record<string, unknown>)[err.path[0] as string],
                  error: err.message,
                });
              });
            }
          }
        });

        resolve({
          success,
          errors,
          total: results.data.length,
          skipped,
        });
      },
      error: (error) => {
        reject(new Error(`Erro ao processar CSV: ${error.message}`));
      },
    });
  });
}

// Função para gerar template CSV
export function generateCSVTemplate(
  columns: { name: string; example?: string; required?: boolean }[]
): string {
  const headers = columns.map(col => col.name).join(',');
  const examples = columns.map(col => col.example ?? '').join(',');
  return `${headers}\n${examples}`;
}

// Função para download de template
export function downloadCSVTemplate(
  columns: { name: string; example?: string; required?: boolean }[],
  filename: string
): void {
  const content = generateCSVTemplate(columns);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
