import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Wrench, Users } from "lucide-react";
import { HookDemo } from "./HookDemo";

export const UseOperatorsDemo = () => {
  const [operators] = useState([
    { name: "João Silva", active: true, machines: 3 },
    { name: "Maria Santos", active: true, machines: 2 },
    { name: "Pedro Costa", active: false, machines: 0 },
  ]);

  return (
    <HookDemo
      title="useOperators"
      description="Gestão de operadores e atribuições"
      icon={Users}
      code={`const { data, removeOperator, toggleActive } = useOperators();
await toggleActive(operatorId, true);`}
    >
      <div className="space-y-2">
        {operators.map((op, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-background border">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${op.active ? "bg-success" : "bg-muted"}`} />
              <span className="text-sm font-medium">{op.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{op.machines} máquinas</Badge>
              <Badge variant={op.active ? "default" : "secondary"} className="text-xs">{op.active ? "Ativo" : "Inativo"}</Badge>
            </div>
          </div>
        ))}
      </div>
    </HookDemo>
  );
};

export const UseTPMDataDemo = () => {
  const [schedules] = useState([
    { machine: "SER-01", type: "Preventiva", nextDue: "Hoje", status: "overdue" },
    { machine: "LASER-01", type: "Lubrificação", nextDue: "Amanhã", status: "upcoming" },
    { machine: "TAMP-02", type: "Calibração", nextDue: "3 dias", status: "scheduled" },
  ]);
  const [alerts] = useState(2);

  return (
    <HookDemo
      title="useTPMData"
      description="Dados de Manutenção Produtiva Total"
      icon={Wrench}
      code={`const { schedules, records, alerts, types, isLoading } = useTPMData();
const overdue = schedules.filter(s => new Date(s.next_due_at) < new Date());`}
    >
      <div className="space-y-4">
        {alerts > 0 && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">{alerts} alertas de manutenção</AlertTitle>
          </Alert>
        )}
        <div className="space-y-2">
          {schedules.map((s, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${s.status === "overdue" ? "bg-destructive/10 border-destructive/30" : "bg-background"}`}>
              <div className="flex items-center gap-3">
                <Wrench className={`h-4 w-4 ${s.status === "overdue" ? "text-destructive" : "text-muted-foreground"}`} />
                <div>
                  <div className="font-medium text-sm">{s.machine}</div>
                  <div className="text-xs text-muted-foreground">{s.type}</div>
                </div>
              </div>
              <Badge variant={s.status === "overdue" ? "destructive" : s.status === "upcoming" ? "outline" : "secondary"}>{s.nextDue}</Badge>
            </div>
          ))}
        </div>
      </div>
    </HookDemo>
  );
};
