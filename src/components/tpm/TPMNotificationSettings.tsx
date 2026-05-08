import { useState, useEffect } from 'react';
import { Bell, BellOff, Volume2, VolumeX, Clock, AlertTriangle, AlertCircle, Calendar, Mail, MessageCircle, Settings, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTPMNotifications } from '@/hooks/useTPMNotifications';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useTPM } from '@/hooks/useTPM';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

export function TPMNotificationSettings() {
  const { permission, isSupported, requestPermission } = useTPMNotifications();
  const { settings, isLoading, updateSettings } = useNotificationSettings();
  const { machines } = useTPM();
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    if (settings?.whatsapp_number) {
      setWhatsappNumber(settings.whatsapp_number);
    }
  }, [settings]);

  const handleToggleType = (type: string) => {
    if (!settings) return;
    const currentTypes = settings.notification_types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    updateSettings.mutate({ notification_types: newTypes });
  };

  const handleToggleMachine = (machineId: string) => {
    if (!settings) return;
    const currentFilters = settings.machine_filters || [];
    const newFilters = currentFilters.includes(machineId)
      ? currentFilters.filter(id => id !== machineId)
      : [...currentFilters, machineId];
    
    updateSettings.mutate({ machine_filters: newFilters });
  };

  if (isLoading) return <div className="p-8 text-center">Carregando configurações...</div>;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Configurações de Alerta TPM
        </CardTitle>
        <CardDescription>
          Personalize como e quando você deseja ser notificado sobre manutenções.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Channels */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Canais de Notificação</h3>
          
          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-secondary/10">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">E-mail</p>
                <p className="text-xs text-muted-foreground">Receba alertas detalhados na sua caixa de entrada</p>
              </div>
            </div>
            <Switch 
              checked={settings?.email_enabled} 
              onCheckedChange={(checked) => updateSettings.mutate({ email_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-secondary/10">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="font-medium">Push (Navegador)</p>
                <p className="text-xs text-muted-foreground">Notificações em tempo real na tela</p>
              </div>
            </div>
            <Switch 
              checked={settings?.push_enabled} 
              onCheckedChange={(checked) => updateSettings.mutate({ push_enabled: checked })}
              disabled={permission !== 'granted'}
            />
          </div>

          <div className="p-4 rounded-lg border border-border/50 bg-secondary/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Alertas críticos via WhatsApp Business</p>
                </div>
              </div>
              <Switch 
                checked={settings?.whatsapp_enabled} 
                onCheckedChange={(checked) => updateSettings.mutate({ whatsapp_enabled: checked })}
              />
            </div>
            {settings?.whatsapp_enabled && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                <Input 
                  placeholder="+55 11 99999-9999" 
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                />
                <Button size="sm" onClick={() => updateSettings.mutate({ whatsapp_number: whatsappNumber })}>Salvar</Button>
              </div>
            )}
          </div>
        </div>

        {/* Alert Types */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tipos de Alerta</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'upcoming', label: 'Próximas', icon: <Calendar className="h-4 w-4 text-blue-400" /> },
              { id: 'due', label: 'Vence Hoje', icon: <Clock className="h-4 w-4 text-amber-400" /> },
              { id: 'overdue', label: 'Atrasadas', icon: <AlertTriangle className="h-4 w-4 text-orange-400" /> },
              { id: 'critical', label: 'Críticas', icon: <AlertCircle className="h-4 w-4 text-destructive" /> },
            ].map(type => (
              <div 
                key={type.id}
                onClick={() => handleToggleType(type.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border border-border/50 cursor-pointer transition-all",
                  settings?.notification_types.includes(type.id) ? "bg-primary/10 border-primary/40" : "bg-card hover:bg-secondary/20"
                )}
              >
                {type.icon}
                <span className="text-sm font-medium">{type.label}</span>
                {settings?.notification_types.includes(type.id) && <Check className="h-4 w-4 ml-auto text-primary" />}
              </div>
            ))}
          </div>
        </div>

        {/* Machine Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Filtro por Máquina</h3>
            <Badge variant="outline">{settings?.machine_filters.length === 0 ? 'Todas as Máquinas' : `${settings?.machine_filters.length} Selecionadas`}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Selecione máquinas específicas para receber alertas. Deixe vazio para todas.</p>
          
          <div className="flex flex-wrap gap-2">
            {machines.map(machine => (
              <Badge 
                key={machine.id}
                variant={settings?.machine_filters.includes(machine.id) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleToggleMachine(machine.id)}
              >
                {machine.code}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
