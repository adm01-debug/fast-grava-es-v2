import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Settings2, 
  Table2, 
  CheckCircle2, 
  ChevronRight, 
  Filter,
  BarChart3,
  LayoutDashboard,
  FileDown,
  Clock,
  Search,
  Calendar,
  Save,
  Trash2,
  Share2,
  FileCheck,
  Zap,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const REPORT_TABLES = [
  { id: 'jobs', name: 'Jobs e Produção', icon: FileText },
  { id: 'machines', name: 'Máquinas e Ativos', icon: LayoutDashboard },
  { id: 'profiles', name: 'Operadores e Equipe', icon: BarChart3 },
  { id: 'inventory_items', name: 'Estoque e Materiais', icon: Table2 },
  { id: 'maintenance_records', name: 'Manutenção e TPM', icon: Settings2 },
];

const TABLE_COLUMNS: Record<string, string[]> = {
  jobs: ['id', 'order_number', 'client', 'product', 'status', 'quantity', 'produced_quantity', 'lost_pieces', 'created_at'],
  machines: ['id', 'code', 'name', 'technique_id', 'is_active', 'created_at'],
  profiles: ['id', 'display_name', 'full_name', 'avatar_url', 'created_at'],
  inventory_items: ['id', 'name', 'category', 'current_stock', 'unit', 'min_stock_level'],
  maintenance_records: ['id', 'machine_id', 'status', 'maintenance_type_id', 'start_time', 'end_time'],
};

const TABLE_FILTER_FIELDS: Record<string, string> = {
  jobs: 'created_at',
  machines: 'created_at',
  profiles: 'created_at',
  inventory_items: 'created_at',
  maintenance_records: 'start_time',
};

const STATUS_OPTIONS: Record<string, string[]> = {
  jobs: ['finished', 'production', 'scheduled', 'queue', 'delayed'],
  maintenance_records: ['pending', 'in_progress', 'completed', 'cancelled'],
};


export default function ReportBuilderPage() {
  const [selectedTable, setSelectedTable] = useState<string>('jobs');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(TABLE_COLUMNS.jobs);
  const [formatType, setFormatType] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['report-preview', selectedTable, selectedColumns, dateRange, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from(selectedTable as any)
        .select(selectedColumns.join(','))
        .limit(10);
      
      const filterField = TABLE_FILTER_FIELDS[selectedTable];
      if (dateRange?.from && filterField) {
        query = query.gte(filterField, startOfDay(dateRange.from).toISOString());
      }
      if (dateRange?.to && filterField) {
        query = query.lte(filterField, endOfDay(dateRange.to).toISOString());
      }
      
      if (selectedStatus !== 'all' && STATUS_OPTIONS[selectedTable]) {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const toggleColumn = (col: string) => {
    setSelectedColumns(prev => 
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      let query = supabase
        .from(selectedTable as any)
        .select(selectedColumns.join(','));
      
      const filterField = TABLE_FILTER_FIELDS[selectedTable];
      if (dateRange?.from && filterField) {
        query = query.gte(filterField, startOfDay(dateRange.from).toISOString());
      }
      if (dateRange?.to && filterField) {
        query = query.lte(filterField, endOfDay(dateRange.to).toISOString());
      }
      
      if (selectedStatus !== 'all' && STATUS_OPTIONS[selectedTable]) {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      if (!data || data.length === 0) {
        toast.info('Nenhum dado encontrado para exportação');
        return;
      }

      if (formatType === 'csv') {
        const header = selectedColumns.join(',');
        const rows = data.map(row => 
          selectedColumns.map(col => {
            const val = row[col as keyof typeof row];
            return val === null ? '' : `"${String(val).replace(/"/g, '""')}"`;
          }).join(',')
        );
        const csv = [header, ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio_${selectedTable}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        link.click();
      } else if (formatType === 'pdf') {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(14, 165, 233); // Primary color
        doc.text(`RELATÓRIO INDUSTRIAL: ${selectedTable.toUpperCase()}`, 14, 15);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 14, 22);
        
        if (dateRange?.from) {
          doc.text(`Período: ${format(dateRange.from, 'dd/MM/yyyy')} a ${dateRange.to ? format(dateRange.to, 'dd/MM/yyyy') : '---'}`, 14, 27);
        }
        
        const tableBody = data.map(row => selectedColumns.map(col => {
           const val = row[col as keyof typeof row];
           if (col.includes('created_at') || col.includes('time')) {
             try { return format(parseISO(String(val)), 'dd/MM/yy HH:mm'); } catch { return String(val || '-'); }
           }
           return String(val || '-');
        }));
        
        autoTable(doc, {
          startY: 35,
          head: [selectedColumns.map(c => c.replace(/_/g, ' ').toUpperCase())],
          body: tableBody,
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [14, 165, 233] },
          alternateRowStyles: { fillColor: [245, 245, 245] },
        });
        
        doc.save(`relatorio_${selectedTable}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      } else {
        toast.success('Excel exportado com sucesso (simulado)');
      }
      
      toast.success(`${data.length} registros exportados!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsGenerating(false);
    }
  };


  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
        <Breadcrumbs />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold flex items-center gap-3">
              <FileDown className="h-8 w-8 text-primary" />
              Construtor de Relatórios
            </h1>
            <p className="text-muted-foreground mt-1">Geração dinâmica de dados e exportação personalizada</p>
          </div>
          <Button 
            className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            onClick={handleExport}
            disabled={isGenerating || selectedColumns.length === 0}
          >
            {isGenerating ? <Clock className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Exportar Relatório
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Step 1: Source Selection */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <Filter className="h-3 w-3 text-primary" />
                   Filtros Inteligentes
                 </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Período de Dados</Label>
                  <DateRangePicker date={dateRange} setDate={setDateRange} />
                </div>
                
                {STATUS_OPTIONS[selectedTable] && (
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Filtrar por Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="h-8 text-xs font-bold bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        {STATUS_OPTIONS[selectedTable].map(s => (
                          <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="pt-2">
                  <Button variant="ghost" size="sm" className="w-full h-7 text-[9px] uppercase font-bold text-muted-foreground hover:text-primary" onClick={() => { setDateRange({ from: subDays(new Date(), 30), to: new Date() }); setSelectedStatus('all'); }}>
                    Resetar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="pb-3">
                 <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                   <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">1</span>
                   Fonte de Dados
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {REPORT_TABLES.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => {
                      setSelectedTable(table.id);
                      setSelectedColumns(TABLE_COLUMNS[table.id]);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${
                      selectedTable === table.id 
                        ? 'border-primary bg-primary/10 shadow-sm' 
                        : 'border-border/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${selectedTable === table.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors'}`}>
                      <table.icon className="h-4 w-4" />
                    </div>
                    <span className={`text-sm font-bold ${selectedTable === table.id ? 'text-primary' : 'text-muted-foreground'}`}>{table.name}</span>
                    <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${selectedTable === table.id ? 'rotate-90 text-primary' : 'text-muted-foreground/30'}`} />
                  </button>
                ))}
              </CardContent>
            </Card>


            <Card className="glass-card border-amber-500/20 bg-amber-500/5">
               <CardHeader className="pb-3">
                 <CardTitle className="text-[10px] font-black uppercase tracking-widest text-amber-600">Formato de Saída</CardTitle>
               </CardHeader>
               <CardContent>
                  <Select value={formatType} onValueChange={(v: any) => setFormatType(v)}>
                    <SelectTrigger className="bg-background/50 border-amber-500/20 text-amber-900 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Excel, Google Sheets)</SelectItem>
                      <SelectItem value="pdf">PDF (Documento Oficial)</SelectItem>
                      <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                    </SelectContent>
                  </Select>
               </CardContent>
            </Card>
          </div>

          {/* Step 2: Configuration */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="glass-card">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">2</span>
                      Configuração de Colunas
                    </CardTitle>
                    <CardDescription>Selecione as dimensões e métricas para o relatório</CardDescription>
                  </div>
                  <Badge variant="secondary" className="font-black">{selectedColumns.length} SELECIONADAS</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {TABLE_COLUMNS[selectedTable].map((col) => (
                    <div 
                      key={col} 
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        selectedColumns.includes(col) ? 'bg-primary/5 border-primary/40 shadow-inner' : 'bg-background border-border/50 hover:border-primary/20'
                      }`}
                      onClick={() => toggleColumn(col)}
                    >
                      <Checkbox 
                        id={col} 
                        checked={selectedColumns.includes(col)}
                        onCheckedChange={() => toggleColumn(col)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label 
                        htmlFor={col} 
                        className={`text-xs font-bold uppercase tracking-tight cursor-pointer ${selectedColumns.includes(col) ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        {col.replace(/_/g, ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card overflow-hidden">
               <CardHeader className="bg-muted/10 border-b border-border/50">
                 <div className="flex items-center justify-between">
                   <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                     <Search className="h-4 w-4 text-muted-foreground" />
                     Pré-visualização (10 primeiros registros)
                   </CardTitle>
                   {isLoading && <Clock className="h-4 w-4 animate-spin text-primary" />}
                 </div>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/30">
                          {selectedColumns.map(col => (
                            <th key={col} className="text-left p-3 font-black uppercase tracking-tighter text-muted-foreground border-b border-border/50">{col.replace(/_/g, ' ')}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {reportData?.map((row, i) => (
                          <tr key={i} className="hover:bg-muted/10 transition-colors">
                            {selectedColumns.map(col => (
                              <td key={col} className="p-3 font-medium text-muted-foreground truncate max-w-[200px]">
                                {String(row[col as keyof typeof row] || '-')}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {(!reportData || reportData.length === 0) && !isLoading && (
                          <tr>
                            <td colSpan={selectedColumns.length} className="p-8 text-center text-muted-foreground italic">Nenhum dado para exibir.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
               </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
