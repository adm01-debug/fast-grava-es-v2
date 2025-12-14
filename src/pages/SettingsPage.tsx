import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Bell, 
  Moon, 
  Volume2, 
  RefreshCw, 
  Database,
  Shield,
  Palette
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = usePersistedSettings();

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings((prev: typeof settings) => ({ ...prev, [key]: value }));
    toast.success('Configuração salva automaticamente');
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-display font-bold gradient-text">Configurações</h1>
          <p className="text-muted-foreground">Personalize o sistema de acordo com suas preferências</p>
        </div>

        {/* Appearance */}
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
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notificações
            </CardTitle>
            <CardDescription>Configure como você deseja receber alertas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações Push</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações do navegador
                </p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Sons de Alerta
                </Label>
                <p className="text-sm text-muted-foreground">
                  Tocar sons ao receber notificações
                </p>
              </div>
              <Switch
                checked={settings.sounds}
                onCheckedChange={(checked) => handleSettingChange('sounds', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Sistema
            </CardTitle>
            <CardDescription>Configurações gerais do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

        {/* Info Cards */}
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

        <div className="flex justify-end">
          <Button onClick={() => toast.success('Todas as configurações estão salvas!')} className="gradient-primary">
            Configurações Atualizadas
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
