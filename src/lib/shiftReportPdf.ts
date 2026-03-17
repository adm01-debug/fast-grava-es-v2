import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DbJob } from '@/hooks/useJobs';
import { DbMachine, DbTechnique } from '@/hooks/useJobs';

export interface ShiftReportData {
  shiftName: string;
  shiftStart: Date;
  shiftEnd: Date;
  jobs: DbJob[];
  machines: DbMachine[];
  techniques: DbTechnique[];
}

export function exportShiftReportPDF(data: ShiftReportData): void {
  const { shiftName, shiftStart, shiftEnd, jobs, machines, techniques } = data;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = margin;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Fast Gravações', margin, 16);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.text(`Relatório de Turno — ${shiftName}`, margin, 26);

  doc.setFontSize(9);
  const period = `${format(shiftStart, "dd/MM/yyyy HH:mm", { locale: ptBR })} - ${format(shiftEnd, "HH:mm", { locale: ptBR })}`;
  doc.text(period, pageWidth - margin - doc.getTextWidth(period), 26);

  doc.setFontSize(8);
  const generated = `Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`;
  doc.text(generated, pageWidth - margin - doc.getTextWidth(generated), 33);

  y = 46;
  doc.setTextColor(0, 0, 0);

  // Stats
  const finished = jobs.filter(j => j.status === 'finished');
  const inProgress = jobs.filter(j => j.status === 'production');
  const delayed = jobs.filter(j => j.status === 'delayed');
  const totalPieces = finished.reduce((s, j) => s + (j.produced_quantity || j.quantity), 0);
  const totalLost = finished.reduce((s, j) => s + (j.lost_pieces || 0), 0);
  const lossRate = totalPieces > 0 ? ((totalLost / totalPieces) * 100).toFixed(1) : '0';

  // KPI boxes
  const kpis = [
    { label: 'Jobs Concluídos', value: `${finished.length}` },
    { label: 'Em Produção', value: `${inProgress.length}` },
    { label: 'Atrasados', value: `${delayed.length}` },
    { label: 'Peças Produzidas', value: totalPieces.toLocaleString('pt-BR') },
    { label: 'Perdas', value: `${totalLost.toLocaleString('pt-BR')} (${lossRate}%)` },
  ];

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo do Turno', margin, y);
  y += 6;

  const boxW = (pageWidth - 2 * margin - 4 * 3) / 5;
  kpis.forEach((kpi, i) => {
    const x = margin + i * (boxW + 3);
    doc.setFillColor(240, 240, 245);
    doc.roundedRect(x, y, boxW, 20, 2, 2, 'F');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.value, x + boxW / 2, y + 10, { align: 'center' });

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(kpi.label, x + boxW / 2, y + 17, { align: 'center' });
  });

  y += 28;
  doc.setTextColor(0, 0, 0);

  // Jobs table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Jobs do Turno', margin, y);
  y += 4;

  const tableData = jobs.map(j => {
    const machine = machines.find(m => m.id === j.machine_id);
    const technique = techniques.find(t => t.id === j.technique_id);
    const statusMap: Record<string, string> = {
      queue: 'Na Fila', ready: 'No Jeito', scheduled: 'Agendado',
      production: 'Em Produção', finished: 'Finalizado', paused: 'Pausado',
      cancelled: 'Cancelado', delayed: 'Atrasado', rework: 'Retrabalho',
    };
    return [
      j.order_number,
      j.client,
      j.product,
      technique?.short_name || '-',
      machine?.code || '-',
      statusMap[j.status] || j.status,
      j.quantity.toString(),
      (j.produced_quantity || '-').toString(),
      (j.lost_pieces || 0).toString(),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [['OS', 'Cliente', 'Produto', 'Técnica', 'Máquina', 'Status', 'Qtd', 'Produzido', 'Perdas']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], fontSize: 7 },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 18 },
      5: { cellWidth: 18 },
    },
    margin: { left: margin, right: margin },
  });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 10;
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Fast Gravações — Relatório automático de turno', margin, footerY);
  doc.text('Página 1', pageWidth - margin - 15, footerY);

  // Save
  const filename = `relatorio-turno-${format(shiftStart, 'yyyy-MM-dd-HHmm')}.pdf`;
  doc.save(filename);
}
