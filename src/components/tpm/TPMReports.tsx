import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, FileText, Table as TableIcon, Calendar, Filter, Activity } from 'lucide-react';
import { useTPM } from '@/hooks/useTPM';
import { useMTBFMTTR } from '@/hooks/useMTBFMTTR';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

export function TPMReports() {
  const { machines, records, maintenanceTypes } = useTPM();
  const [selectedMachineId, setSelectedMachineId] = useState<string>('all');
  const [period, setPeriod] = useState<string>('30');
  const { metrics, summary } = useMTBFMTTR(parseInt(period));
  const [isGenerating, setIsGenerating] = useState(false);

  const getFilteredRecords = () => {
    let filtered = [...records];
    
    // Filter by machine
    if (selectedMachineId !== 'all') {
      filtered = filtered.filter(r => r.machine_id === selectedMachineId);
    }
    
    // Filter by period
    const startDate = subDays(new Date(), parseInt(period));
    filtered = filtered.filter(r => new Date(r.started_at) >= startDate);
    
    return filtered;
  };

  const generatePDF = () => {
    setIsGenerating(true);
    try {
      const filteredRecords = getFilteredRecords();
      const doc = new jsPDF();
      const machineName = selectedMachineId === 'all' ? 'Todas as Máquinas' : machines.find(m => m.id === selectedMachineId)?.name;
      
      // Title
      doc.setFontSize(18);
      doc.text('Relatório de Manutenção TPM', 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Máquina: ${machineName}`, 14, 30);
      doc.text(`Período: Últimos ${period} dias`, 14, 35);
      doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 40);

      // Table
      const tableData = filteredRecords.map(r => [
        format(new Date(r.started_at), 'dd/MM/yyyy'),
        r.machine?.name || 'N/A',
        maintenanceTypes.find(t => t.id === r.maintenance_type_id)?.name || r.maintenance_type_id,
        r.status === 'completed' ? 'Concluída' : 'Em andamento',
        r.performed_by_name || 'N/A',
        `${r.downtime_minutes} min`
      ]);

      (doc as any).autoTable({
        startY: 50,
        head: [['Data', 'Máquina', 'Tipo', 'Status', 'Executado por', 'Downtime']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save(`relatorio-tpm-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success('Relatório PDF gerado com sucesso');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateExcel = () => {
    setIsGenerating(true);
    try {
      const filteredRecords = getFilteredRecords();
      const data = filteredRecords.map(r => ({
        'Data': format(new Date(r.started_at), 'dd/MM/yyyy HH:mm'),
        'Máquina': r.machine?.name || 'N/A',
        'Código Máquina': r.machine?.code || 'N/A',
        'Tipo Manutenção': maintenanceTypes.find(t => t.id === r.maintenance_type_id)?.name || r.maintenance_type_id,
        'Status': r.status === 'completed' ? 'Concluída' : 'Em andamento',
        'Executado por': r.performed_by_name || 'N/A',
        'Downtime (min)': r.downtime_minutes,
        'Custo': r.total_cost,
        'Notas': r.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Histórico');
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `relatorio-tpm-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      
      toast.success('Relatório Excel gerado com sucesso');
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('Erro ao gerar Excel');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Relatórios de Manutenção
        </CardTitle>
        <CardDescription>
          Gere relatórios detalhados em PDF ou Excel para análise de desempenho e histórico.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Filter className="h-4 w-4" /> Máquina
            </Label>
            <Select value={selectedMachineId} onValueChange={setSelectedMachineId}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as máquinas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as máquinas</SelectItem>
                {machines.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name} ({m.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Período
            </Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button 
              variant="outline" 
              className="flex-1 gap-2" 
              onClick={generatePDF}
              disabled={isGenerating || records.length === 0}
            >
              <FileDown className="h-4 w-4" /> PDF
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 gap-2" 
              onClick={generateExcel}
              disabled={isGenerating || records.length === 0}
            >
              <TableIcon className="h-4 w-4" /> Excel
            </Button>
          </div>
        </div>

        {records.length === 0 && (
          <div className="py-8 text-center text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
            <p>Nenhum dado disponível para o período selecionado.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
