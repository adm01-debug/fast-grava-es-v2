import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Users, 
  Lock,
  Settings,
  AlertTriangle,
  Smartphone,
  Key,
  Bell,
  LayoutDashboard
} from 'lucide-react';
import { useBlockedIPs, useRateLimitLogs, useSecurityEvents } from '@/hooks/useRateLimitLogs';
import { BlockedIPsPanel } from '@/components/security/BlockedIPsPanel';
import { RateLimitSettings } from '@/components/security/RateLimitSettings';
import { SecurityEventsLog } from '@/components/security/SecurityEventsLog';
import { PermissionMatrix } from '@/components/security/PermissionMatrix';
import { PermissionManager } from '@/components/security/PermissionManager';
import { MFASettings } from '@/components/security/MFASettings';
import { IPAllowlist } from '@/components/settings/IPAllowlist';
import { LoginAuditLog } from '@/components/settings/LoginAuditLog';
import { SecurityOverviewCard } from '@/components/security/SecurityOverviewCard';
import { ActiveDevicesPanel } from '@/components/security/ActiveDevicesPanel';
import { SecurityAlertsPanel } from '@/components/security/SecurityAlertsPanel';
import { PushNotificationSettings } from '@/components/security/PushNotificationSettings';
import { PasskeySettings } from '@/components/security/PasskeySettings';
import { useMFA } from '@/hooks/useMFA';
import { useUserDevices } from '@/hooks/useUserDevices';

export default function SecurityDashboard() {
  const { isCoordinator, isManager } = useAuth();
  const { data: blockedIPs } = useBlockedIPs();
  const { data: rateLimitLogs } = useRateLimitLogs(100);
  const { data: securityEvents } = useSecurityEvents(100);
  const { isMFAEnabled } = useMFA();
  const { devices } = useUserDevices();

  if (!isCoordinator && !isManager) {
    return <Navigate to="/" replace />;
  }

  // Calculate stats
  const activeBlocks = blockedIPs?.length || 0;
  const recentRateLimits = rateLimitLogs?.filter(l => l.is_blocked).length || 0;
  const criticalEvents = securityEvents?.filter(e => 
    e.severity === 'critical' || e.severity === 'error'
  ).length || 0;
  const trustedDevices = devices?.filter(d => d.is_trusted).length || 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Painel de Segurança Unificado
        </h1>
        <p className="text-muted-foreground">
          Visão completa de todas as configurações de segurança do sistema
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IPs Bloqueados</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBlocks}</div>
            <p className="text-xs text-muted-foreground">Ativos no momento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limits</CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentRateLimits}</div>
            <p className="text-xs text-muted-foreground">Bloqueios recentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalEvents}</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispositivos</CardTitle>
            <Smartphone className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trustedDevices}/{devices?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Confiáveis / Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">2FA</CardTitle>
            <Key className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={isMFAEnabled ? 'default' : 'secondary'} className={isMFAEnabled ? 'bg-green-500' : ''}>
                {isMFAEnabled ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Autenticação 2FA</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-9 w-full">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden md:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="devices" className="gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="hidden md:inline">Sessões</span>
          </TabsTrigger>
          <TabsTrigger value="mfa" className="gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden md:inline">MFA</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Alertas</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden md:inline">Eventos</span>
          </TabsTrigger>
          <TabsTrigger value="blocked" className="gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span className="hidden md:inline">IPs</span>
          </TabsTrigger>
          <TabsTrigger value="ratelimit" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Rate Limit</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Permissões</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden md:inline">Auditoria</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <SecurityOverviewCard />
            <SecurityAlertsPanel />
          </div>
        </TabsContent>

        <TabsContent value="devices">
          <ActiveDevicesPanel />
        </TabsContent>

        <TabsContent value="mfa">
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <MFASettings />
              <PushNotificationSettings />
            </div>
            <PasskeySettings />
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <SecurityAlertsPanel />
        </TabsContent>

        <TabsContent value="events">
          <SecurityEventsLog />
        </TabsContent>

        <TabsContent value="blocked">
          <div className="grid gap-6 lg:grid-cols-2">
            <BlockedIPsPanel />
            <IPAllowlist />
          </div>
        </TabsContent>

        <TabsContent value="ratelimit">
          <RateLimitSettings />
        </TabsContent>

        <TabsContent value="permissions">
          <div className="space-y-6">
            <PermissionManager />
            <PermissionMatrix />
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <LoginAuditLog />
        </TabsContent>
      </Tabs>
    </div>
  );
}
