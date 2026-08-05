import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Plug, Database, Mail } from 'lucide-react';

interface SettingsBackupTabProps {
  onExportData: () => void;
}

export function SettingsBackupTab({ onExportData }: SettingsBackupTabProps) {
  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Download className="h-5 w-5 text-primary" />Backup de Dados</CardTitle>
          <CardDescription>Exporte seus dados para backup local</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">O backup incluirá: Jobs, Operadores, Máquinas e configurações.</p>
          <Button onClick={onExportData} className="w-full"><Download className="h-4 w-4 mr-2" />Exportar Dados (JSON)</Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Plug className="h-5 w-5 text-primary" />Status das Integrações</CardTitle>
          <CardDescription>Veja o status das integrações configuradas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { icon: Database, color: 'blue-500', name: 'Lovable Cloud', desc: 'Banco de dados', status: 'Conectado', connected: true },
            { icon: Plug, color: 'orange-500', name: 'Bitrix24', desc: 'CRM/ERP', status: 'Configurar', connected: false },
            { icon: Mail, color: 'purple-500', name: 'Email (Resend)', desc: 'Notificações por email', status: 'Configurar', connected: false },
          ].map(item => (
            <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${item.color}/20 flex items-center justify-center`}><item.icon className={`h-5 w-5 text-${item.color}`} /></div>
                <div><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">{item.desc}</p></div>
              </div>
              <Badge className={item.connected ? 'bg-success text-success-foreground' : ''} variant={item.connected ? 'default' : 'secondary'}>{item.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
