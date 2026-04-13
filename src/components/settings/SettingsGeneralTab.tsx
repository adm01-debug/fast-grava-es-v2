import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Moon, RefreshCw, Database, Shield, Palette } from 'lucide-react';
import { useTheme } from 'next-themes';
import { AutoThemeToggle } from '@/components/settings/AutoThemeToggle';

interface SettingsGeneralTabProps {
  settings: { autoRefresh: boolean };
  onSettingChange: (key: string, value: boolean) => void;
}

export function SettingsGeneralTab({ settings, onSettingChange }: SettingsGeneralTabProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" />Aparência</CardTitle>
          <CardDescription>Personalize a aparência visual do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2"><Moon className="h-4 w-4" />Tema Escuro</Label>
              <p className="text-sm text-muted-foreground">Alterna entre modo claro e escuro</p>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
          </div>
          <Separator />
          <AutoThemeToggle compact />
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2"><RefreshCw className="h-4 w-4" />Atualização Automática</Label>
              <p className="text-sm text-muted-foreground">Atualizar dados em tempo real</p>
            </div>
            <Switch checked={settings.autoRefresh} onCheckedChange={(checked) => onSettingChange('autoRefresh', checked)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Database className="h-6 w-6 text-primary" /></div>
              <div><p className="font-medium">Lovable Cloud</p><p className="text-sm text-muted-foreground">Conectado</p></div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center"><Shield className="h-6 w-6 text-success" /></div>
              <div><p className="font-medium">Autenticação</p><p className="text-sm text-muted-foreground">Ativa e segura</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
