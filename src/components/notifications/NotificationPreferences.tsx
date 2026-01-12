import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Loader2 } from 'lucide-react';

export function NotificationPreferences() {
  const { preferences, isLoading, updatePreferences, isUpdating } = useNotificationPreferences();

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Canais de Notificação</CardTitle><CardDescription>Escolha como deseja receber notificações</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          {([
            { id: 'email', label: 'E-mail', key: 'email_enabled' as const },
            { id: 'push', label: 'Push Notifications', key: 'push_enabled' as const },
            { id: 'sms', label: 'SMS', key: 'sms_enabled' as const },
            { id: 'whatsapp', label: 'WhatsApp', key: 'whatsapp_enabled' as const },
          ]).map(({ id, label, key }) => (
            <div key={id} className="flex items-center justify-between">
              <Label htmlFor={id}>{label}</Label>
              <Switch 
                id={id} 
                checked={preferences?.[key] ?? (id === 'email' || id === 'push')} 
                onCheckedChange={(checked) => updatePreferences({ [key]: checked })} 
                disabled={isUpdating} 
              />
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Não Perturbe (DND)</CardTitle><CardDescription>Silenciar notificações em horários específicos</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dnd">Ativar DND</Label>
            <Switch id="dnd" checked={preferences?.dnd_enabled ?? false} onCheckedChange={(checked) => updatePreferences({ dnd_enabled: checked })} disabled={isUpdating} />
          </div>
          {preferences?.dnd_enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="dnd-start">Início</Label><Input id="dnd-start" type="time" value={preferences?.dnd_start_time || '22:00'} onChange={(e) => updatePreferences({ dnd_start_time: e.target.value })} /></div>
              <div><Label htmlFor="dnd-end">Fim</Label><Input id="dnd-end" type="time" value={preferences?.dnd_end_time || '08:00'} onChange={(e) => updatePreferences({ dnd_end_time: e.target.value })} /></div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Resumo Diário</CardTitle><CardDescription>Receba um resumo das notificações por e-mail</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="digest">Ativar Digest</Label>
            <Switch id="digest" checked={preferences?.digest_enabled ?? false} onCheckedChange={(checked) => updatePreferences({ digest_enabled: checked })} disabled={isUpdating} />
          </div>
          {preferences?.digest_enabled && (
            <div><Label htmlFor="digest-time">Horário</Label><Input id="digest-time" type="time" value={preferences?.digest_time || '09:00'} onChange={(e) => updatePreferences({ digest_time: e.target.value })} /></div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Contatos</CardTitle><CardDescription>Números para SMS e WhatsApp</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div><Label htmlFor="phone">Telefone (SMS)</Label><Input id="phone" type="tel" placeholder="+55 11 99999-9999" value={preferences?.phone_number || ''} onChange={(e) => updatePreferences({ phone_number: e.target.value })} /></div>
          <div><Label htmlFor="whatsapp">WhatsApp</Label><Input id="whatsapp" type="tel" placeholder="+55 11 99999-9999" value={preferences?.whatsapp_number || ''} onChange={(e) => updatePreferences({ whatsapp_number: e.target.value })} /></div>
        </CardContent>
      </Card>
    </div>
  );
}
