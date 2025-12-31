import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, CheckCircle, XCircle, ShieldAlert, Shield, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LoginAuditEntry {
  id: string;
  user_id: string | null;
  user_email: string;
  ip_address: string | null;
  user_agent: string | null;
  login_status: string;
  failure_reason: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle }> = {
  success: { label: 'Sucesso', variant: 'default', icon: CheckCircle },
  failed: { label: 'Falhou', variant: 'destructive', icon: XCircle },
  blocked_ip: { label: 'IP Bloqueado', variant: 'destructive', icon: ShieldAlert },
  mfa_required: { label: 'MFA Pendente', variant: 'secondary', icon: Shield },
  mfa_failed: { label: 'MFA Falhou', variant: 'destructive', icon: Shield },
};

export function LoginAuditLog() {
  const { isCoordinator, isManager } = useAuth();

  const { data: auditLog = [], isLoading } = useQuery({
    queryKey: ['login-audit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('login_audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as LoginAuditEntry[];
    },
    enabled: isCoordinator || isManager,
  });

  if (!isCoordinator && !isManager) {
    return null;
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Histórico de Login
        </CardTitle>
        <CardDescription>
          Últimas 100 tentativas de login no sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : auditLog.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum registro de login ainda</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLog.map((entry) => {
                  const config = statusConfig[entry.login_status] || statusConfig.failed;
                  const Icon = config.icon;

                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm">
                        {format(new Date(entry.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">{entry.user_email}</TableCell>
                      <TableCell className="font-mono text-xs">{entry.ip_address || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={config.variant} className="gap-1">
                          <Icon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {entry.failure_reason || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
