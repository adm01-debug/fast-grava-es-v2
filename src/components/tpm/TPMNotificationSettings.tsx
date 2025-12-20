import { useState, useEffect } from 'react';
import { Bell, BellOff, Volume2, VolumeX, Clock, AlertTriangle, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTPMNotifications, saveTPMNotificationPreferences } from '@/hooks/useTPMNotifications';
import { toast } from 'sonner';

interface NotificationPreferences {
  upcomingMaintenance: boolean;
  dueMaintenance: boolean;
  overdueMaintenance: boolean;
  criticalAlerts: boolean;
  soundEnabled: boolean;
}

export function TPMNotificationSettings() {
  const { permission, isSupported, requestPermission, getPreferences } = useTPMNotifications();
  const [preferences, setPreferences] = useState<NotificationPreferences>(getPreferences());

  useEffect(() => {
    setPreferences(getPreferences());
  }, []);

  const handleToggle = (key: keyof NotificationPreferences) => {
    const newValue = !preferences[key];
    const updated = saveTPMNotificationPreferences({ [key]: newValue });
    setPreferences(updated);
    toast.success(`Configuração atualizada`);
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success('Notificações de manutenção ativadas!');
    }
  };

  if (!isSupported) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            Notificações Não Suportadas
          </CardTitle>
          <CardDescription>
            Seu navegador não suporta notificações push.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass-card hover:shadow-glow-primary/20 transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notificações de Manutenção
        </CardTitle>
        <CardDescription>
          Configure quais alertas de manutenção você deseja receber
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            {permission === 'granted' ? (
              <Bell className="h-5 w-5 text-emerald-500" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Status das Notificações</p>
              <p className="text-sm text-muted-foreground">
                {permission === 'granted' 
                  ? 'Notificações ativadas' 
                  : permission === 'denied'
                  ? 'Bloqueadas no navegador'
                  : 'Não configuradas'}
              </p>
            </div>
          </div>
          {permission !== 'granted' && (
            <Button onClick={handleRequestPermission} size="sm">
              Ativar
            </Button>
          )}
          {permission === 'granted' && (
            <Badge variant="default" className="bg-emerald-500">
              Ativo
            </Badge>
          )}
        </div>

        {/* Notification Types */}
        <div className="space-y-4">
          <NotificationToggle
            icon={<Calendar className="h-5 w-5 text-blue-500" />}
            label="Manutenções Próximas"
            description="Aviso quando manutenção estiver a 3 dias de vencer"
            checked={preferences.upcomingMaintenance}
            onCheckedChange={() => handleToggle('upcomingMaintenance')}
            disabled={permission !== 'granted'}
          />

          <NotificationToggle
            icon={<Clock className="h-5 w-5 text-amber-500" />}
            label="Manutenções do Dia"
            description="Alerta quando manutenção vence hoje"
            checked={preferences.dueMaintenance}
            onCheckedChange={() => handleToggle('dueMaintenance')}
            disabled={permission !== 'granted'}
          />

          <NotificationToggle
            icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
            label="Manutenções Atrasadas"
            description="Alerta para manutenções vencidas"
            checked={preferences.overdueMaintenance}
            onCheckedChange={() => handleToggle('overdueMaintenance')}
            priority="Alta"
            disabled={permission !== 'granted'}
          />

          <NotificationToggle
            icon={<AlertCircle className="h-5 w-5 text-destructive" />}
            label="Alertas Críticos"
            description="Notificação urgente para problemas críticos"
            checked={preferences.criticalAlerts}
            onCheckedChange={() => handleToggle('criticalAlerts')}
            priority="Crítica"
            disabled={permission !== 'granted'}
          />
        </div>

        {/* Sound Settings */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {preferences.soundEnabled ? (
                <Volume2 className="h-5 w-5 text-primary" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">Sons de Alerta</p>
                <p className="text-sm text-muted-foreground">
                  Tocar som para alertas críticos e atrasados
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.soundEnabled}
              onCheckedChange={() => handleToggle('soundEnabled')}
              disabled={permission !== 'granted'}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface NotificationToggleProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: () => void;
  priority?: string;
  disabled?: boolean;
}

function NotificationToggle({
  icon,
  label,
  description,
  checked,
  onCheckedChange,
  priority,
  disabled,
}: NotificationToggleProps) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
      checked && !disabled ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
    } ${disabled ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{label}</p>
            {priority && (
              <Badge 
                variant={priority === 'Crítica' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {priority}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}
