import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  History, Search, Filter, FileSpreadsheet, Download, 
  Eye, Calendar, Wrench, CheckCircle, Clock, AlertTriangle,
  CheckSquare, XSquare, ShieldCheck, Activity, Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useTPM } from '@/hooks/useTPM';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ExecutionDetailsModal } from './ExecutionDetailsModal';
import { BatchApprovalPreviewModal } from './BatchApprovalPreviewModal';
import { cn } from '@/lib/utils';

export function TPMExecutionHistory() {
  const { records, machines, isLoading, approveBatch } = useTPM();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [machineFilter, setMachineFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = 
        record.performed_by_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.machine?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMachine = machineFilter === 'all' || record.machine_id === machineFilter;
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

      return matchesSearch && matchesMachine && matchesStatus;
    });
  }, [records, searchTerm, machineFilter, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black uppercase text-[10px] tracking-widest px-3 py-1 rounded-full"><CheckCircle className="h-3 w-3 mr-1" /> VALIDATED</Badge>;
      case 'completed':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-black uppercase text-[10px] tracking-widest px-3 py-1 rounded-full"><Clock className="h-3 w-3 mr-1" /> PENDING REVIEW</Badge>;
      default:
        return <Badge variant="outline" className="font-black uppercase text-[10px] tracking-widest px-3 py-1 rounded-full">{status}</Badge>;
    }
  };

  return (
    <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-2xl rounded-[2.5rem] overflow-hidden ring-1 ring-white/5 animate-in fade-in duration-700">
      <CardHeader className="p-8 border-b border-border/20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl ring-1 ring-primary/20 shadow-glow-primary/10">
              <History className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black font-display tracking-tight text-foreground/90 uppercase">Execution Logs</CardTitle>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest opacity-60 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Comprehensive Industrial Audit Trail
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <Button 
                onClick={() => setIsPreviewModalOpen(true)}
                className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-xs shadow-glow-emerald/20 transition-all hover:scale-[1.02]"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Approve {selectedIds.length} Selected
              </Button>
            )}
            <Button variant="outline" className="h-12 px-6 rounded-xl border-border/40 hover:bg-muted/30 transition-all font-bold uppercase tracking-widest text-xs">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Dataset
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Filter by operator, machine, ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-12 bg-muted/20 border-border/20 rounded-xl focus:ring-primary/20 font-medium"
            />
          </div>
          <Select value={machineFilter} onValueChange={setMachineFilter}>
            <SelectTrigger className="h-12 bg-muted/20 border-border/20 rounded-xl font-bold uppercase tracking-widest text-[10px]">
              <div className="flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /><SelectValue placeholder="All Assets" /></div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 backdrop-blur-xl">
              <SelectItem value="all">ALL ASSETS</SelectItem>
              {machines.map(m => ( <SelectItem key={m.id} value={m.id}>{m.name.toUpperCase()}</SelectItem> ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-12 bg-muted/20 border-border/20 rounded-xl font-bold uppercase tracking-widest text-[10px]">
              <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-primary" /><SelectValue placeholder="All Status" /></div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 backdrop-blur-xl">
              <SelectItem value="all">ALL STATUS</SelectItem>
              <SelectItem value="completed">PENDING REVIEW</SelectItem>
              <SelectItem value="approved">VALIDATED</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center justify-center h-12 rounded-xl bg-primary/5 border border-primary/20">
            <Activity className="h-4 w-4 mr-2 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{filteredRecords.length} LOG ENTRIES</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-b border-border/20">
              <TableHead className="w-16 px-6"></TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-6 px-6">Timestamp</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-6">Machine Unit</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-6">Operator</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-6">Metric (min)</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground py-6">Status</TableHead>
              <TableHead className="text-right px-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id} className={cn("hover:bg-primary/[0.02] transition-colors border-b border-border/10 group", selectedIds.includes(record.id) && "bg-primary/[0.04]")}>
                <TableCell className="px-6">
                  {record.status === 'completed' && (
                    <Checkbox 
                      checked={selectedIds.includes(record.id)} 
                      onCheckedChange={() => setSelectedIds(prev => prev.includes(record.id) ? prev.filter(i => i !== record.id) : [...prev, record.id])}
                      className="h-5 w-5 rounded-lg border-2"
                    />
                  )}
                </TableCell>
                <TableCell className="py-6 px-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-foreground/80 tracking-tight">
                      {format(new Date(record.completed_at || record.started_at), 'MMM d, yyyy')}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                      {format(new Date(record.completed_at || record.started_at), 'HH:mm:ss')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-background/50 border border-border/20 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black uppercase tracking-tight text-foreground/80">{record.machine?.name}</span>
                      <span className="text-[10px] font-bold text-muted-foreground opacity-60">{record.machine?.code}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase ring-1 ring-primary/20">
                      {(record.performed_by_name || 'N').charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-tight">{record.performed_by_name || 'EXTERNAL'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-black font-mono text-primary/80">{record.downtime_minutes}</span>
                </TableCell>
                <TableCell>{getStatusBadge(record.status)}</TableCell>
                <TableCell className="text-right px-8">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-10 px-4 rounded-xl hover:bg-primary/10 hover:text-primary font-black uppercase tracking-widest text-[10px] opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => { setSelectedRecordId(record.id); setIsModalOpen(true); }}
                  >
                    <Eye className="h-4 w-4 mr-2" /> View Intel
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-40">
            <History className="h-20 w-20 stroke-[0.5]" />
            <p className="text-lg font-black font-display uppercase tracking-widest">No Log Entries Found</p>
          </div>
        )}
      </CardContent>

      <ExecutionDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} recordId={selectedRecordId} />
      <BatchApprovalPreviewModal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} recordIds={selectedIds} onConfirm={async () => { /* Logic */ }} isProcessing={isBatchProcessing} />
    </Card>
  );
}