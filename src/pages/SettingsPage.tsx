import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, ShieldIcon, BellIcon, AlertTriangleIcon, UsersIcon, DatabaseIcon, ZapIcon, LockIcon, FingerprintIcon, GlobeIcon, KeyIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { UserManagement } from '@/components/settings/UserManagement';
import { PasswordResetRequests } from '@/components/settings/PasswordResetRequests';
import { TwoFactorSetup } from '@/components/settings/TwoFactorSetup';
import { IPAllowlist } from '@/components/settings/IPAllowlist';
import { LoginAuditLog } from '@/components/settings/LoginAuditLog';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import IntegrationHub from '@/components/integrations/IntegrationHub';
import { SettingsGeneralTab } from '@/components/settings/SettingsGeneralTab';
import { SettingsNotificationsTab } from '@/components/settings/SettingsNotificationsTab';
import { SettingsAlertsTab } from '@/components/settings/SettingsAlertsTab';
import { SettingsBackupTab } from '@/components/settings/SettingsBackupTab';
import { PageTransition } from '@/components/layout/PageTransition';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

function usePersistedSettings() {
  const { user } = useAuth();
  const storageKey = `app-settings-${user?.id || 'guest'}`;
  const [settings, setSettings] = useState(() => {
    if (typeof window === 'undefined') return { notifications: true, sounds: true, autoRefresh: true };
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : { notifications: true, sounds: true, autoRefresh: true };
  });
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(settings)); }, [settings, storageKey]);
  return [settings, setSettings] as const;
}

function useAlertThresholds() {
  const [thresholds, setThresholds] = useState(() => {
    const stored = localStorage.getItem('alert-thresholds');
    return stored ? JSON.parse(stored) : { lowBuffer: 30, criticalBuffer: 10, delayedJobMinutes: 60, oeeWarning: 70, oeeCritical: 50, energyPeakKw: 100 };
  });
  useEffect(() => { localStorage.setItem('alert-thresholds', JSON.stringify(thresholds)); }, [thresholds]);
  return [thresholds, setThresholds] as const;
}

export default function SettingsPage() {
  const [settings, setSettings] = usePersistedSettings();
  const [thresholds, setThresholds] = useAlertThresholds();

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings((prev: typeof settings) => ({ ...prev, [key]: value }));
    toast.success('Configuração salva automaticamente');
  };

  const handleThresholdChange = (key: string, value: number) => {
    setThresholds((prev: typeof thresholds) => ({ ...prev, [key]: value }));
  };

  const handleExportData = async () => {
    toast.loading('Exportando dados...', { id: 'export' });
    try {
      const { data: jobs } = await supabase.from('jobs').select('*');
      const { data: operators } = await supabase.from('profiles').select('*');
      const { data: machines } = await supabase.from('machines').select('*');
      const exportData = { exportedAt: new Date().toISOString(), jobs, operators, machines };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `backup-${new Date().toISOString().split('T')[0]}.json`; a.click(); URL.revokeObjectURL(url);
      toast.success('Dados exportados com sucesso!', { id: 'export' });
    } catch { toast.error('Erro ao exportar dados', { id: 'export' }); }
  };

  return (
    <MainLayout>
      <PageTransition>
        <div className="container mx-auto p-4 sm:p-8 space-y-10 max-w-7xl animate-in fade-in duration-700">
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border/40 pb-8">
            <div className="flex items-start gap-5">
              <div className="p-4 bg-primary/10 rounded-2xl shadow-glow-primary/10 ring-1 ring-primary/20">
                <Settings className="h-8 w-8 text-primary" aria-hidden />
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl font-black font-display tracking-tight leading-none uppercase gradient-text">System Configuration</h1>
                <p className="text-base text-muted-foreground font-medium uppercase tracking-[0.2em] opacity-80">Global Parameters & Control Center</p>
              </div>
            </div>
            <Badge variant="outline" className="h-10 px-4 rounded-xl border-primary/20 bg-primary/5 text-xs font-black tracking-widest uppercase text-primary">
              <LockIcon className="h-3.5 w-3.5 mr-2" />
              Secure Environment
            </Badge>
          </header>

          <Tabs defaultValue="general" className="w-full space-y-8">
            <TabsList className="inline-flex h-auto w-full items-center justify-start rounded-2xl bg-muted/30 p-1.5 backdrop-blur-xl border border-border/40 shadow-inner flex-wrap gap-1">
              {[
                { value: 'general', icon: Settings, label: 'General' },
                { value: 'security', icon: ShieldIcon, label: 'Security' },
                { value: 'notifications', icon: BellIcon, label: 'Notifications' },
                { value: 'alerts', icon: AlertTriangleIcon, label: 'Thresholds' },
                { value: 'users', icon: UsersIcon, label: 'Identity' },
                { value: 'backup', icon: DatabaseIcon, label: 'Resilience' },
                { value: 'integrations', icon: ZapIcon, label: 'Hub' },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="h-11 rounded-xl px-6 text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-md flex items-center gap-2"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="grid grid-cols-1 gap-8">
              <TabsContent value="general" className="outline-none">
                <SettingsGeneralTab settings={settings} onSettingChange={handleSettingChange} />
              </TabsContent>

              <TabsContent value="security" className="space-y-8 outline-none focus-visible:ring-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-8">
                    <TwoFactorSetup />
                    <IPAllowlist />
                  </div>
                  <LoginAuditLog />
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="outline-none">
                <SettingsNotificationsTab settings={settings} onSettingChange={handleSettingChange} />
              </TabsContent>

              <TabsContent value="alerts" className="outline-none">
                <SettingsAlertsTab 
                  thresholds={thresholds} 
                  onThresholdChange={handleThresholdChange} 
                  onSave={() => toast.success('Limites de alerta salvos!')} 
                  onReset={() => { 
                    setThresholds({ lowBuffer: 30, criticalBuffer: 10, delayedJobMinutes: 60, oeeWarning: 70, oeeCritical: 50, energyPeakKw: 100 }); 
                    toast.success('Limites restaurados para padrão'); 
                  }} 
                />
              </TabsContent>

              <TabsContent value="users" className="space-y-8 outline-none">
                <UserManagement />
                <PasswordResetRequests />
              </TabsContent>

              <TabsContent value="backup" className="outline-none">
                <SettingsBackupTab onExportData={handleExportData} />
              </TabsContent>

              <TabsContent value="integrations" className="outline-none">
                <IntegrationHub />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
