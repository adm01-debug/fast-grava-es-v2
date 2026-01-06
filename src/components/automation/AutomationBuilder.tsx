import * as React from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Zap,
  Plus,
  Trash2,
  GripVertical,
  Play,
  Pause,
  Settings,
  Clock,
  ArrowRight,
  CheckCircle,
  Copy,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Types
type TriggerType = "schedule" | "event" | "webhook" | "manual";
type ActionType = "notify" | "update" | "create" | "delete" | "email" | "webhook" | "custom";

interface AutomationTrigger {
  id: string;
  type: TriggerType;
  config: Record<string, any>;
}

interface AutomationAction {
  id: string;
  type: ActionType;
  config: Record<string, any>;
  order: number;
}

interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  actions: AutomationAction[];
  isActive: boolean;
  lastRun?: Date;
  runCount: number;
  createdAt: Date;
}

interface AutomationBuilderProps {
  rules: AutomationRule[];
  onSave: (rule: Omit<AutomationRule, "id" | "createdAt" | "runCount">) => void;
  onDelete: (ruleId: string) => void;
  onToggle: (ruleId: string, isActive: boolean) => void;
  onTest?: (rule: AutomationRule) => void;
}

const triggerTypes: { type: TriggerType; label: string; description: string }[] = [
  { type: "schedule", label: "Agendado", description: "Executar em horários específicos" },
  { type: "event", label: "Evento", description: "Quando um evento ocorrer" },
  { type: "webhook", label: "Webhook", description: "Quando receber uma requisição" },
  { type: "manual", label: "Manual", description: "Executar manualmente" },
];

const actionTypes: { type: ActionType; label: string; icon: React.ReactNode }[] = [
  { type: "notify", label: "Enviar Notificação", icon: <Zap className="h-4 w-4" /> },
  { type: "update", label: "Atualizar Registro", icon: <CheckCircle className="h-4 w-4" /> },
  { type: "create", label: "Criar Registro", icon: <Plus className="h-4 w-4" /> },
  { type: "email", label: "Enviar E-mail", icon: <ArrowRight className="h-4 w-4" /> },
  { type: "webhook", label: "Chamar Webhook", icon: <ArrowRight className="h-4 w-4" /> },
];

export function AutomationBuilder({
  rules,
  onSave,
  onDelete,
  onToggle,
  onTest,
}: AutomationBuilderProps) {
  const [isCreating, setIsCreating] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Automações
          </h2>
          <p className="text-muted-foreground">
            Configure regras para automatizar tarefas repetitivas
          </p>
        </div>

        <Sheet open={isCreating} onOpenChange={setIsCreating}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Automação
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Criar Automação</SheetTitle>
              <SheetDescription>
                Configure o gatilho e as ações da sua automação
              </SheetDescription>
            </SheetHeader>
            <AutomationForm
              onSave={(rule) => {
                onSave(rule);
                setIsCreating(false);
              }}
              onCancel={() => setIsCreating(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Rules list */}
      <div className="grid gap-4">
        {rules.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-center">
                Nenhuma automação configurada.
                <br />
                Crie sua primeira automação para começar.
              </p>
            </CardContent>
          </Card>
        ) : (
          rules.map((rule) => (
            <AutomationRuleCard
              key={rule.id}
              rule={rule}
              onToggle={onToggle}
              onDelete={onDelete}
              onTest={onTest}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Rule card component
function AutomationRuleCard({
  rule,
  onToggle,
  onDelete,
  onTest,
}: {
  rule: AutomationRule;
  onToggle: (ruleId: string, isActive: boolean) => void;
  onDelete: (ruleId: string) => void;
  onTest?: (rule: AutomationRule) => void;
}) {
  const trigger = triggerTypes.find((t) => t.type === rule.trigger.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={cn(!rule.isActive && "opacity-60")}>
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              {rule.name}
              <Badge variant={rule.isActive ? "default" : "secondary"} className="text-xs">
                {rule.isActive ? "Ativa" : "Inativa"}
              </Badge>
            </CardTitle>
            {rule.description && (
              <CardDescription>{rule.description}</CardDescription>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={rule.isActive}
              onCheckedChange={(checked) => onToggle(rule.id, checked)}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onTest && (
                  <DropdownMenuItem onClick={() => onTest(rule)}>
                    <Play className="h-4 w-4 mr-2" />
                    Testar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete(rule.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            {/* Trigger */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <span className="text-muted-foreground">{trigger?.label}</span>
            </div>

            <ArrowRight className="h-4 w-4 text-muted-foreground" />

            {/* Actions count */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-success" />
              </div>
              <span className="text-muted-foreground">
                {rule.actions.length} ação(ões)
              </span>
            </div>

            {/* Stats */}
            {rule.runCount > 0 && (
              <div className="ml-auto text-xs text-muted-foreground">
                Executado {rule.runCount} vez(es)
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Form for creating/editing automations
function AutomationForm({
  initialData,
  onSave,
  onCancel,
}: {
  initialData?: Partial<AutomationRule>;
  onSave: (rule: Omit<AutomationRule, "id" | "createdAt" | "runCount">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = React.useState(initialData?.name || "");
  const [description, setDescription] = React.useState(initialData?.description || "");
  const [triggerType, setTriggerType] = React.useState<TriggerType>(
    initialData?.trigger?.type || "manual"
  );
  const [actions, setActions] = React.useState<AutomationAction[]>(
    initialData?.actions || []
  );

  const addAction = (type: ActionType) => {
    const newAction: AutomationAction = {
      id: `action-${Date.now()}`,
      type,
      config: {},
      order: actions.length,
    };
    setActions([...actions, newAction]);
  };

  const removeAction = (actionId: string) => {
    setActions(actions.filter((a) => a.id !== actionId));
  };

  const handleSave = () => {
    onSave({
      name,
      description,
      trigger: { id: `trigger-${Date.now()}`, type: triggerType, config: {} },
      actions,
      isActive: true,
      lastRun: undefined,
    });
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Basic info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Notificar sobre pedidos pendentes"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o que esta automação faz..."
            rows={2}
          />
        </div>
      </div>

      {/* Trigger */}
      <div className="space-y-3">
        <Label>Gatilho</Label>
        <Select value={triggerType} onValueChange={(v) => setTriggerType(v as TriggerType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {triggerTypes.map((t) => (
              <SelectItem key={t.type} value={t.type}>
                <div>
                  <div className="font-medium">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Ações</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {actionTypes.map((a) => (
                <DropdownMenuItem key={a.type} onClick={() => addAction(a.type)}>
                  {a.icon}
                  <span className="ml-2">{a.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {actions.length === 0 ? (
          <div className="border border-dashed rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Adicione ações que serão executadas quando o gatilho for ativado
            </p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={actions}
            onReorder={setActions}
            className="space-y-2"
          >
            {actions.map((action) => {
              const actionType = actionTypes.find((a) => a.type === action.type);
              return (
                <Reorder.Item key={action.id} value={action}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    {actionType?.icon}
                    <span className="flex-1 text-sm font-medium">{actionType?.label}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeAction(action.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={!name || actions.length === 0} className="flex-1">
          Salvar Automação
        </Button>
      </div>
    </div>
  );
}
