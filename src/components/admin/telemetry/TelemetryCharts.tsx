import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { BarChart3, TrendingUp, PieChart as PieIcon } from "lucide-react";

interface TelemetryRow {
  id: string;
  operation: string;
  table_name: string | null;
  rpc_name: string | null;
  duration_ms: number;
  severity: string;
  created_at: string;
}

interface TelemetryChartsProps {
  rows: TelemetryRow[];
  timeFilter: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(var(--warning, 45 93% 47%))",
  "hsl(var(--success, 142 71% 45%))",
  "hsl(var(--accent))",
  "hsl(220 70% 55%)",
];

export function TelemetryCharts({ rows, timeFilter }: TelemetryChartsProps) {
  const timelineData = useMemo(() => {
    if (rows.length === 0) return [];
    const buckets = new Map<string, { count: number; avgMs: number; totalMs: number }>();
    const isShort = timeFilter === "1h" || timeFilter === "6h";

    for (const r of rows) {
      const d = new Date(r.created_at);
      const key = isShort
        ? `${d.getHours().toString().padStart(2, "0")}:${(Math.floor(d.getMinutes() / 10) * 10).toString().padStart(2, "0")}`
        : `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}h`;

      const prev = buckets.get(key) || { count: 0, avgMs: 0, totalMs: 0 };
      buckets.set(key, { count: prev.count + 1, totalMs: prev.totalMs + r.duration_ms, avgMs: 0 });
    }

    return [...buckets.entries()]
      .map(([time, v]) => ({ time, count: v.count, avgMs: Math.round(v.totalMs / v.count) }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [rows, timeFilter]);

  const severityData = useMemo(() => {
    const counts = { slow: 0, very_slow: 0, error: 0 };
    for (const r of rows) {
      if (r.severity in counts) counts[r.severity as keyof typeof counts]++;
    }
    return [
      { name: "Lentas", value: counts.slow, color: "hsl(45 93% 47%)" },
      { name: "Muito Lentas", value: counts.very_slow, color: "hsl(var(--destructive))" },
      { name: "Erros", value: counts.error, color: "hsl(0 84% 40%)" },
    ].filter(d => d.value > 0);
  }, [rows]);

  const operationData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) {
      counts.set(r.operation, (counts.get(r.operation) || 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [rows]);

  if (rows.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Timeline */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Timeline de Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} className="fill-muted-foreground" />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Alertas" />
              <Line type="monotone" dataKey="avgMs" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} name="Média (ms)" yAxisId={0} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Severity Pie */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <PieIcon className="h-4 w-4" />
            Por Severidade
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          {severityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={severityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {severityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Sem dados</p>
          )}
        </CardContent>
      </Card>

      {/* Operations Bar */}
      {operationData.length > 0 && (
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Por Tipo de Operação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={operationData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Ocorrências" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
