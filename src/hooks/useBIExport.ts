import { useState } from 'react';
import { toast } from 'sonner';
import { subDays, format } from 'date-fns';
import { exportProductionReport, exportLossesReport, exportDelaysReport } from '@/lib/pdfExport';

interface ExportData {
  periodJobsList?: unknown[];
  dailyTrend?: unknown[];
  statusDistribution?: unknown[];
}

export function useBIExport(biMetrics: ExportData) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (formatType: 'csv' | 'pdf', type: string, extraData?: unknown) => {
    setIsExporting(true);
    const dateRange = { start: subDays(new Date(), 30), end: new Date(), label: 'Últimos 30 dias' };
    
    try {
      if (formatType === 'csv') {
        toast.info(`Gerando CSV para ${type}...`);
        
        let dataToExport: unknown[] = [];
        let filename = `BI_Export_${type}_${format(new Date(), 'yyyyMMdd')}`;

        if (type.includes('Taxa_Perda') || type.includes('Perdas')) {
          dataToExport = extraData?.jobsWithLosses || (biMetrics.periodJobsList || []).filter((j: unknown) => (j.lost_pieces || 0) > 0);
        } else if (type.includes('Atrasos')) {
          dataToExport = extraData?.delayedJobsList || [];
        } else if (type.includes('Pedidos_A_Fazer')) {
          dataToExport = (biMetrics.periodJobsList || []).filter((j: unknown) => j.status === 'scheduled' || j.status === 'queue');
        } else if (type.includes('Producao_Atual')) {
          dataToExport = (biMetrics.periodJobsList || []).filter((j: unknown) => j.status === 'production');
        } else {
          dataToExport = biMetrics.periodJobsList || [];
        }

        if (dataToExport.length === 0) {
          toast.warning("Nenhum dado encontrado para exportar.");
          return;
        }

        // Clean data for CSV
        const cleanedData = dataToExport.map(item => {
          const cleaned: unknown = {};
          Object.entries(item).forEach(([key, val]) => {
            if (typeof val !== 'object' || val === null) {
              cleaned[key] = val;
            }
          });
          return cleaned;
        });

        const headers = Object.keys(cleanedData[0]).join(',');
        const rows = cleanedData.map(obj => 
          Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        const blob = new Blob([`\uFEFF${headers}\n${rows}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Exportação CSV de ${type} concluída.`);
      } else {
        toast.info(`Gerando PDF para ${type}...`);
        
        if (type.includes('Taxa_Perda') || type.includes('Perdas')) {
          const losses = extraData?.jobsWithLosses || (biMetrics.periodJobsList || []).filter((j: unknown) => (j.lost_pieces || 0) > 0);
          await exportLossesReport(losses, dateRange);
        } else if (type.includes('Atrasos')) {
          await exportDelaysReport(extraData?.delayedJobsList || [], dateRange);
        } else {
          const jobs = (biMetrics.periodJobsList || []).map((j: unknown) => ({
            order_number: j.order_number || `OS-${j.id?.slice(0, 5)}`,
            client: j.client_name || 'Cliente',
            product: j.product_name || 'Produto',
            status: j.status,
            quantity: j.quantity,
            produced_quantity: j.produced_quantity,
            lost_pieces: j.lost_pieces,
            scheduled_date: j.scheduled_date
          }));
          await exportProductionReport(jobs, dateRange, `Relatório: ${type.replace(/_/g, ' ')}`);
        }
        
        toast.success(`Relatório PDF de ${type} gerado com sucesso.`);
      }
    } catch (error) {
      
      toast.error("Falha ao gerar exportação.");
    } finally {
      setIsExporting(false);
    }
  };

  return { isExporting, handleExport };
}
