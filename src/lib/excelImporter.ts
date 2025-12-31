import * as XLSX from 'xlsx';
import { z } from 'zod';
import { ImportResult, ImportError } from './csvImporter';

export interface ExcelImportOptions {
  sheetName?: string;
  sheetIndex?: number;
  headerRow?: number;
  trimValues?: boolean;
}

export async function importExcel<T>(
  file: File,
  schema: z.ZodSchema<T>,
  options: ExcelImportOptions = {}
): Promise<ImportResult<T>> {
  const {
    sheetName,
    sheetIndex = 0,
    headerRow = 1,
    trimValues = true,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Selecionar planilha
        const sheet = sheetName 
          ? workbook.Sheets[sheetName]
          : workbook.Sheets[workbook.SheetNames[sheetIndex]];
        
        if (!sheet) {
          throw new Error('Planilha não encontrada');
        }

        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet, {
          header: headerRow,
          defval: '',
        }) as Record<string, unknown>[];

        const success: T[] = [];
        const errors: ImportError[] = [];
        let skipped = 0;

        jsonData.forEach((row, index) => {
          // Normalizar keys (lowercase, underscore)
          const normalizedRow: Record<string, unknown> = {};
          Object.entries(row).forEach(([key, value]) => {
            const normalizedKey = String(key).trim().toLowerCase().replace(/\s+/g, '_');
            normalizedRow[normalizedKey] = trimValues && typeof value === 'string' 
              ? value.trim() 
              : value;
          });

          // Pular linhas vazias
          if (Object.values(normalizedRow).every(v => !v)) {
            skipped++;
            return;
          }

          try {
            const validated = schema.parse(normalizedRow);
            success.push(validated);
          } catch (error) {
            if (error instanceof z.ZodError) {
              error.errors.forEach((err) => {
                errors.push({
                  row: index + headerRow + 1,
                  field: err.path.join('.'),
                  value: normalizedRow[err.path[0] as string],
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
    reader.readAsArrayBuffer(file);
  });
}

// Função para listar planilhas de um arquivo Excel
export async function getExcelSheets(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(workbook.SheetNames);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
}

// Função para gerar template Excel
export function generateExcelTemplate(
  columns: { name: string; example?: string; required?: boolean }[],
  sheetName: string = 'Template'
): Blob {
  const ws = XLSX.utils.aoa_to_sheet([
    columns.map(col => col.name),
    columns.map(col => col.example ?? ''),
  ]);

  // Definir largura das colunas
  ws['!cols'] = columns.map(() => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// Função para download de template Excel
export function downloadExcelTemplate(
  columns: { name: string; example?: string; required?: boolean }[],
  filename: string
): void {
  const blob = generateExcelTemplate(columns);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.xlsx`;
  link.click();
  URL.revokeObjectURL(link.href);
}
