import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Bell, 
  Moon, 
  Volume2, 
  RefreshCw, 
  Database,
  Shield,
  Palette,
  Download,
  Upload,
  Users,
  AlertTriangle,
  Plug,
  Trash2,
  UserPlus,
  Mail,
  Save,
  RotateCcw
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePushSubscription } from '@/hooks/usePushSubscription';

// Settings persistence hook
function usePersistedSettings() {
  const { user } = useAuth();
  const storageKey = `app-settings-${user?.id || 'guest'}`;
  
  const [settings, setSettings] = useState(() => {
    if (typeof window === 'undefined') {
      return { notifications: true, sounds: true, autoRefresh: true };
    }
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : { notifications: true, sounds: true, autoRefresh: true };
  });
  
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  }, [settings, storageKey]);
  
  return [settings, setSettings] as const;
}

// Alert thresholds hook
function useAlertThresholds() {
  const [thresholds, setThresholds] = useState(() => {
    const stored = localStorage.getItem('alert-thresholds');
    return stored ? JSON.parse(stored) : {
      lowBuffer: 30,
      criticalBuffer: 10,
      delayedJobMinutes: 60,
      oeeWarning: 70,
      oeeCritical: 50,
      energyPeakKw: 100,
    };
  });

  useEffect(() => {
    localStorage.setItem('alert-thresholds', JSON.stringify(thresholds));
  }, [thresholds]);

  return [thresholds, setThresholds] as const;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [settings, setSettings] = usePersistedSettings();
  const [thresholds, setThresholds] = useAlertThresholds();
  const { isSubscribed, subscribe, unsubscribe, sendTestNotification, isLoading: pushLoading } = usePushSubscription();

  // Fetch users for management
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch user roles
  const { data: userRoles = [] } = useQuery({
    queryKey: ['user_roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings((prev: typeof settings) => ({ ...prev, [key]: value }));
    toast.success('Configuração salva automaticamente');
  };

  const handleThresholdChange = (key: string, value: number) => {
    setThresholds((prev: typeof thresholds) => ({ ...prev, [key]: value }));
  };

  const handleSaveThresholds = () => {
    toast.success('Limites de alerta salvos!');
  };

  const handleExportData = async () => {
    toast.loading('Exportando dados...', { id: 'export' });
    
    try {
      // Export jobs
      const { data: jobs } = await supabase.from('jobs').select('*');
      const { data: operators } = await supabase.from('profiles').select('*');
      const { data: machines } = await supabase.from('machines').select('*');

      const exportData = {
        exportedAt: new Date().toISOString(),
        jobs,
        operators,
        machines,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Dados exportados com sucesso!', { id: 'export' });
    } catch (error) {
      toast.error('Erro ao exportar dados', { id: 'export' });
    }
  };

  const handleResetThresholds = () => {
    setThresholds({
      lowBuffer: 30,
      criticalBuffer: 10,
      delayedJobMinutes: 60,
      oeeWarning: 70,
      oeeCritical: 50,
      energyPeakKw: 100,
    });
    toast.success('Limites restaurados para padrão');
  };

  const getUserRole = (userId: string) => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role || 'operator';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold gradient-text">Configurações Avançadas</h1>
          <p className="text-muted-foreground">Gerencie todas as configurações do sistema</p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Aparência
                </CardTitle>
                <CardDescription>Personalize a aparência visual do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Tema Escuro
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Alterna entre modo claro e escuro
                    </p>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Atualização Automática
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Atualizar dados em tempo real
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoRefresh}
                    onCheckedChange={(checked) => handleSettingChange('autoRefresh', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Database className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Lovable Cloud</p>
                      <p className="text-sm text-muted-foreground">Conectado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">Autenticação</p>
                      <p className="text-sm text-muted-foreground">Ativa e segura</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Push Notifications
                </CardTitle>
                <CardDescription>Configure notificações push do navegador</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações mesmo com o navegador fechado
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isSubscribed ? 'default' : 'secondary'}>
                      {isSubscribed ? 'Ativado' : 'Desativado'}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={isSubscribed ? unsubscribe : subscribe}
                      disabled={pushLoading}
                    >
                      {isSubscribed ? 'Desativar' : 'Ativar'}
                    </Button>
                  </div>
                </div>
                {isSubscribed && (
                  <>
                    <Separator />
                    <Button variant="outline" onClick={sendTestNotification}>
                      Enviar Notificação de Teste
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-primary" />
                  Sons
                </CardTitle>
                <CardDescription>Configure sons de notificação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sons de Alerta</Label>
                    <p className="text-sm text-muted-foreground">
                      Tocar sons ao receber notificações
                    </p>
                  </div>
                  <Switch
                    checked={settings.sounds}
                    onCheckedChange={(checked) => handleSettingChange('sounds', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações Visuais</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar toasts na tela
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Limites de Alerta
                </CardTitle>
                <CardDescription>Configure quando os alertas devem ser disparados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Buffer Baixo (%)</Label>
                    <Input
                      type="number"
                      value={thresholds.lowBuffer}
                      onChange={(e) => handleThresholdChange('lowBuffer', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">Alerta quando buffer ficar abaixo deste %</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Buffer Crítico (%)</Label>
                    <Input
                      type="number"
                      value={thresholds.criticalBuffer}
                      onChange={(e) => handleThresholdChange('criticalBuffer', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">Alerta crítico quando buffer muito baixo</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Job Atrasado (minutos)</Label>
                    <Input
                      type="number"
                      value={thresholds.delayedJobMinutes}
                      onChange={(e) => handleThresholdChange('delayedJobMinutes', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">Tempo para considerar um job atrasado</p>
                  </div>
                  <div className="space-y-2">
                    <Label>OEE Warning (%)</Label>
                    <Input
                      type="number"
                      value={thresholds.oeeWarning}
                      onChange={(e) => handleThresholdChange('oeeWarning', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">OEE abaixo deste valor gera warning</p>
                  </div>
                  <div className="space-y-2">
                    <Label>OEE Crítico (%)</Label>
                    <Input
                      type="number"
                      value={thresholds.oeeCritical}
                      onChange={(e) => handleThresholdChange('oeeCritical', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">OEE abaixo deste valor é crítico</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Pico de Energia (kW)</Label>
                    <Input
                      type="number"
                      value={thresholds.energyPeakKw}
                      onChange={(e) => handleThresholdChange('energyPeakKw', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">Alerta quando consumo ultrapassar</p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={handleResetThresholds}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restaurar Padrão
                  </Button>
                  <Button onClick={handleSaveThresholds} className="gradient-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Limites
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Gerenciamento de Usuários
                </CardTitle>
                <CardDescription>Visualize e gerencie usuários do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</div>
                ) : (
                  <div className="space-y-3">
                    {users.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {u.full_name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{u.full_name || 'Sem nome'}</p>
                            <p className="text-sm text-muted-foreground">{u.phone || 'Sem telefone'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getUserRole(u.id) === 'manager' ? 'default' : 'secondary'}>
                            {getUserRole(u.id)}
                          </Badge>
                          {u.id === user?.id && (
                            <Badge variant="outline">Você</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  Backup de Dados
                </CardTitle>
                <CardDescription>Exporte seus dados para backup local</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  O backup incluirá: Jobs, Operadores, Máquinas e configurações.
                </p>
                <Button onClick={handleExportData} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Dados (JSON)
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="h-5 w-5 text-primary" />
                  Integrações
                </CardTitle>
                <CardDescription>Status das integrações configuradas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Database className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Lovable Cloud</p>
                      <p className="text-sm text-muted-foreground">Banco de dados</p>
                    </div>
                  </div>
                  <Badge className="bg-success text-success-foreground">Conectado</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <Plug className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium">Bitrix24</p>
                      <p className="text-sm text-muted-foreground">CRM/ERP</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Configurar</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Email (Resend)</p>
                      <p className="text-sm text-muted-foreground">Notificações por email</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Configurar</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
