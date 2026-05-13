import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic table name requires runtime cast
      let query = (supabase.from(tableName) as any).select(selectColumns);

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

  const exportAuditTrail = useCallback(async (filters: unknown, fileName?: string, formatType: 'csv' | 'pdf' = 'csv') => {
    setIsExporting(true);
    try {
      let query = supabase.from('audit_log').select('*').order('created_at', { ascending: false });

      if (filters.entityType) query = query.eq('entity_type', filters.entityType);
      if (filters.entityId) query = query.eq('entity_id', filters.entityId);
      if (filters.fromDate) query = query.gte('created_at', filters.fromDate);
      if (filters.toDate) query = query.lte('created_at', filters.toDate);

      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) {
        toast.info('Nenhum dado para exportar');
        return;
      }

      const formattedFileName = fileName ?? `audit_export_${format(new Date(), 'yyyy-MM-dd')}`;

      if (formatType === 'pdf') {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`Relatório de Auditoria - ${filters.entityType || 'Geral'}`, 14, 15);
        doc.setFontSize(10);
        doc.text(`Data: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 22);

        const tableHeaders = ['Data', 'Ação', 'Usuário', 'Entidade', 'Campos Alterados'];
        const tableBody = data.map((entry: unknown) => [
          format(new Date(entry.created_at), 'dd/MM/yy HH:mm'),
          entry.action,
          entry.actor_email || entry.actor_id || 'Sistema',
          `${entry.entity_type} (#${entry.entity_id.slice(0, 8)})`,
          entry.changed_fields?.join(', ') || '-'
        ]);

        autoTable(doc, {
          startY: 28,
          head: [tableHeaders],
          body: tableBody,
          theme: 'striped',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [59, 130, 246] }
        });

        doc.save(`${formattedFileName}.pdf`);
      } else {
        const csv = convertToCSV(data as Record<string, unknown>[]);
        downloadFile(csv, `${formattedFileName}.csv`, 'text/csv');
      }

      toast.success(`${data.length} registros de auditoria exportados`);
    } catch (error) {
      toast.error('Erro na exportação de auditoria');
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    exportData,
    exportAuditTrail,
    isExporting,
  };
}
