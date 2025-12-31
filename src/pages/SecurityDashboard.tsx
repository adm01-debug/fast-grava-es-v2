import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Users, 
  Lock,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { useBlockedIPs, useRateLimitLogs, useSecurityEvents } from '@/hooks/useRateLimitLogs';
import { BlockedIPsPanel } from '@/components/security/BlockedIPsPanel';
import { RateLimitSettings } from '@/components/security/RateLimitSettings';
import { SecurityEventsLog } from '@/components/security/SecurityEventsLog';
import { PermissionMatrix } from '@/components/security/PermissionMatrix';
import { MFASettings } from '@/components/security/MFASettings';
import { IPAllowlist } from '@/components/settings/IPAllowlist';
import { LoginAuditLog } from '@/components/settings/LoginAuditLog';

export default function SecurityDashboard() {
  const { isCoordinator, isManager } = useAuth();
  const { data: blockedIPs } = useBlockedIPs();
  const { data: rateLimitLogs } = useRateLimitLogs(100);
  const { data: securityEvents } = useSecurityEvents(100);

  if (!isCoordinator && !isManager) {
    return <Navigate to="/" replace />;
  }

  // Calculate stats
  const activeBlocks = blockedIPs?.length || 0;
  const recentRateLimits = rateLimitLogs?.filter(l => l.is_blocked).length || 0;
  const criticalEvents = securityEvents?.filter(e => 
    e.severity === 'critical' || e.severity === 'error'
  ).length || 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Painel de Segurança
        </h1>
        <p className="text-muted-foreground">
          Monitore e gerencie a segurança do sistema
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-500">
                Protegido
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sistema seguro</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full max-w-4xl">
          <TabsTrigger value="events" className="gap-2">
            <Activity className="h-4 w-4" />
            Eventos
          </TabsTrigger>
          <TabsTrigger value="blocked" className="gap-2">
            <ShieldAlert className="h-4 w-4" />
            IPs Bloqueados
          </TabsTrigger>
          <TabsTrigger value="allowlist" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Whitelist
          </TabsTrigger>
          <TabsTrigger value="ratelimit" className="gap-2">
            <Settings className="h-4 w-4" />
            Rate Limit
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Users className="h-4 w-4" />
            Permissões
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Lock className="h-4 w-4" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <SecurityEventsLog />
        </TabsContent>

        <TabsContent value="blocked">
          <BlockedIPsPanel />
        </TabsContent>

        <TabsContent value="allowlist">
          <IPAllowlist />
        </TabsContent>

        <TabsContent value="ratelimit">
          <RateLimitSettings />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionMatrix />
        </TabsContent>

        <TabsContent value="audit">
          <LoginAuditLog />
        </TabsContent>
      </Tabs>
    </div>
  );
}
