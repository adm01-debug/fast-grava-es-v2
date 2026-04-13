import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, Volume2 } from 'lucide-react';
import { usePushSubscription } from '@/hooks/usePushSubscription';

interface SettingsNotificationsTabProps {
  settings: { notifications: boolean; sounds: boolean };
  onSettingChange: (key: string, value: boolean) => void;
}

export function SettingsNotificationsTab({ settings, onSettingChange }: SettingsNotificationsTabProps) {
  const { isSubscribed, subscribe, unsubscribe, sendTestNotification, isLoading: pushLoading } = usePushSubscription();

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Push Notifications</CardTitle>
          <CardDescription>Configure notificações push do navegador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações Push</Label>
              <p className="text-sm text-muted-foreground">Receber notificações mesmo com o navegador fechado</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isSubscribed ? 'default' : 'secondary'}>{isSubscribed ? 'Ativado' : 'Desativado'}</Badge>
              <Button variant="outline" size="sm" onClick={isSubscribed ? unsubscribe : subscribe} disabled={pushLoading}>{isSubscribed ? 'Desativar' : 'Ativar'}</Button>
            </div>
          </div>
          {isSubscribed && (<><Separator /><Button variant="outline" onClick={sendTestNotification}>Enviar Notificação de Teste</Button></>)}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Volume2 className="h-5 w-5 text-primary" />Sons</CardTitle>
          <CardDescription>Configure sons de notificação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5"><Label>Sons de Alerta</Label><p className="text-sm text-muted-foreground">Tocar sons ao receber notificações</p></div>
            <Switch checked={settings.sounds} onCheckedChange={(checked) => onSettingChange('sounds', checked)} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5"><Label>Notificações Visuais</Label><p className="text-sm text-muted-foreground">Mostrar toasts na tela</p></div>
            <Switch checked={settings.notifications} onCheckedChange={(checked) => onSettingChange('notifications', checked)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
