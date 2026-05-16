import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

export const exportOEETabledData = (data: any, formatType: 'pdf' | 'csv') => {
  const fileName = `OEE_Report_${format(new Date(), 'yyyy-MM-dd_HHmm')}`;
  
  const headers = [['Máquina', 'Disponibilidade (%)', 'Performance (%)', 'Qualidade (%)', 'OEE (%)']];
  const body = data.byMachine.map((m: any) => [
    m.machineName,
    m.availability.toFixed(1),
    m.performance.toFixed(1),
    m.quality.toFixed(1),
    m.oee.toFixed(1)
  ]);

  if (formatType === 'pdf') {
    const doc = new jsPDF();
    doc.text('Relatório Global de OEE', 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 22);
    
    (doc as any).autoTable({
      startY: 30,
      head: headers,
      body: body,
      theme: 'grid',
      headStyles: { fillStyle: '#0ea5e9' }
    });
    
    doc.save(`${fileName}.pdf`);
  } else {
    const csvRows = [
      headers[0].join(','),
      ...body.map((row: any[]) => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
