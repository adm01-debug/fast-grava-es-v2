import { format } from 'date-fns';
import { downloadWorkbook } from '@/lib/excel';
import { ExecutiveKPIs, DateRange } from '@/features/analytics/hooks/useExecutiveDashboard';

export interface ExportData {
  title: string;
  dateRange: DateRange;
  kpis: ExecutiveKPIs;
}

export const exportExecutiveDashboardExcel = async (data: ExportData) => {
  const { title, dateRange, kpis } = data;

  // 1. Summary Sheet
  const summaryData = [
    ['Dashboard', title],
    ['Período', `${format(dateRange.start, 'dd/MM/yyyy')} - ${format(dateRange.end, 'dd/MM/yyyy')}`],
    [''],
    ['KPI', 'Valor', 'Tendência (%)'],
    ['Produção Total', kpis.totalPiecesProduced, kpis.trends.production.toFixed(2)],
    ['Eficiência Global', `${kpis.productionEfficiency.toFixed(1)}%`, kpis.trends.efficiency.toFixed(2)],
    ['Taxa de Qualidade', `${kpis.qualityRate.toFixed(1)}%`, kpis.trends.quality.toFixed(2)],
    ['Utilização Máquinas', `${kpis.machineUtilization.toFixed(1)}%`, kpis.trends.utilization.toFixed(2)],
    ['Jobs Concluídos', kpis.totalJobsCompleted, ''],
    ['Jobs em Progresso', kpis.totalJobsInProgress, ''],
  ];

  // 2. Production Trend Sheet
  const trendData = [
    ['Data', 'Produzido', 'Meta'],
    ...kpis.productionTrend.map(t => [t.date, t.produced, t.target])
  ];

  // 3. Machine Performance Sheet
  const machineData = [
    ['Máquina', 'Utilização (%)', 'OEE (%)'],
    ...kpis.machinePerformance.map(m => [m.machine, m.utilization, m.oee])
  ];

  // Generate file name and download
  const fileName = `${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`;
  await downloadWorkbook(
    [
      { name: 'Resumo', rows: summaryData },
      { name: 'Tendência de Produção', rows: trendData },
      { name: 'Performance Máquinas', rows: machineData },
    ],
    fileName,
  );
};
