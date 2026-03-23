import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];
export type ExportFormat = 'csv' | 'json';

export interface ExportOptions {
  columns?: string[];
  filters?: Record<string, string | string[]>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  format?: ExportFormat;
  fileName?: string;
}

function convertToCSV(data: Record<string, unknown>[], columns?: string[]): string {
  if (data.length === 0) return '';

  const keys = columns ?? Object.keys(data[0]);
  const header = keys.join(',');
  const rows = data.map(row =>
    keys.map(key => {
      const value = row[key];
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );

  return [header, ...rows].join('\n');
}

function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob(['\uFEFF' + content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function useDataExport(tableName: TableName) {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = useCallback(async (options: ExportOptions = {}) => {
    const {
      columns,
      filters,
      sortBy = 'created_at',
      sortOrder = 'desc',
      format = 'csv',
      fileName,
    } = options;

    setIsExporting(true);

    try {
      const selectColumns = columns ? columns.join(',') : '*';
      let query = supabase.from(tableName).select(selectColumns);

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value && value.length > 0) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) {
        toast.info('Nenhum dado para exportar');
        return;
      }

      const defaultFileName = `${tableName}_export_${new Date().toISOString().split('T')[0]}`;
      const exportFileName = fileName ?? defaultFileName;

      if (format === 'csv') {
        const csv = convertToCSV(data as Record<string, unknown>[], columns);
        downloadFile(csv, `${exportFileName}.csv`, 'text/csv');
      } else {
        const json = JSON.stringify(data, null, 2);
        downloadFile(json, `${exportFileName}.json`, 'application/json');
      }

      toast.success(`${data.length} registros exportados`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro na exportação: ${message}`);
    } finally {
      setIsExporting(false);
    }
  }, [tableName]);

  return {
    exportData,
    isExporting,
  };
}
