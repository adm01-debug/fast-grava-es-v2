import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, XCircle, Clock, Search, Filter, Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function TPMNotificationLogs() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['tpm-notification-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tpm_notification_logs')
        .select(`
          *,
          machine:machines(name, code)
        `)
        .order('sent_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    }
  });

  const filteredLogs = logs?.filter(log => 
    log.machine?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.machine?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.severity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.channel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    if (!filteredLogs || filteredLogs.length === 0) return;

    const headers = ['Data/Hora', 'Máquina', 'Canal', 'Severidade', 'Status', 'Destinatário', 'Erro'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.sent_at), 'dd/MM/yyyy HH:mm'),
        log.machine?.name || '',
        log.channel,
        log.severity,
        log.status,
        log.recipient || '',
        log.error_message || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tpm_notifications_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.click();
    toast.success('Log exportado com sucesso');
  };

  if (isLoading) return <div className="p-8 text-center">Carregando logs...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrar por máquina, severidade ou canal..."
            className="pl-9 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-9">
          <FileSpreadsheet className="h-4 w-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Máquina</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Severidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Destinatário</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum log encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {log.sent_at ? format(new Date(log.sent_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{log.machine?.name}</span>
                    <span className="text-xs text-muted-foreground block">{log.machine?.code}</span>
                  </TableCell>
                  <TableCell className="capitalize">{log.channel}</TableCell>
                  <TableCell>
                    <Badge variant={
                      log.severity === 'critical' ? 'destructive' : 
                      log.severity === 'overdue' ? 'secondary' : 
                      log.severity === 'due' ? 'outline' : 'secondary'
                    } className="capitalize">
                      {log.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.status === 'success' ? (
                      <div className="flex items-center text-emerald-500 gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Sucesso</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-destructive gap-1" title={log.error_message || undefined}>
                        <XCircle className="h-4 w-4" />
                        <span>Falha</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-mono">{log.recipient || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
