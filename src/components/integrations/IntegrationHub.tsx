import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plug,
  RefreshCw,
  Settings,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Bitrix24SyncPanel } from "./Bitrix24SyncPanel";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "connected" | "disconnected" | "error";
  enabled: boolean;
  lastSync?: Date;
}

const integrations: Integration[] = [
  {
    id: "bitrix24",
    name: "Bitrix24",
    description: "Sincronização com CRM e gestão de negócios",
    icon: <Plug className="h-5 w-5" />,
    status: "disconnected",
    enabled: false,
  },
  {
    id: "erp",
    name: "ERP API",
    description: "Integração com sistema ERP via API REST",
    icon: <Settings className="h-5 w-5" />,
    status: "connected",
    enabled: true,
    lastSync: new Date(),
  },
];

export default function IntegrationHub() {
  const [showBitrix24, setShowBitrix24] = React.useState(false);

  const statusConfig = {
    connected: { label: "Conectado", color: "text-green-500", icon: CheckCircle2 },
    disconnected: { label: "Desconectado", color: "text-muted-foreground", icon: XCircle },
    error: { label: "Erro", color: "text-destructive", icon: AlertTriangle },
  };

  if (showBitrix24) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setShowBitrix24(false)}>
          ← Voltar para Integrações
        </Button>
        <Bitrix24SyncPanel />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Central de Integrações</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie conexões com sistemas externos
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => {
          const status = statusConfig[integration.status];

          return (
            <Card key={integration.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      integration.enabled ? "bg-primary/10" : "bg-muted"
                    )}>
                      {integration.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{integration.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {integration.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch checked={integration.enabled} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className={cn("flex items-center gap-2 text-sm", status.color)}>
                    <status.icon className="h-4 w-4" />
                    <span>{status.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {integration.id === "bitrix24" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBitrix24(true)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configurar
                      </Button>
                    )}
                    {integration.lastSync && (
                      <span className="text-xs text-muted-foreground">
                        Sync: {integration.lastSync.toLocaleTimeString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Available integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integrações Disponíveis</CardTitle>
          <CardDescription>
            Configure novas integrações para expandir as funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <ExternalLink className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">Webhooks</p>
                <p className="text-xs text-muted-foreground">
                  Receba notificações em tempo real
                </p>
              </div>
            </div>
            <Badge variant="secondary">Em breve</Badge>
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <RefreshCw className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">Sincronização Automática</p>
                <p className="text-xs text-muted-foreground">
                  Sync agendado com sistemas externos
                </p>
              </div>
            </div>
            <Badge variant="secondary">Em breve</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
