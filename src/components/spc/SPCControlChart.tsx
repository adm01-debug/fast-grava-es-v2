import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, BarChart2, Plus, Sparkles, TrendingUp, History, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Area } from 'recharts';
import { SPCParameter } from '@/hooks/useSPC';
import { cn } from '@/lib/utils';

interface SPCControlChartProps {
  selectedParameter: SPCParameter | null;
  chartData: Array<{
    sample: number; mean: number; range: number;
    ucl: number | null; lcl: number | null;
    usl: number; lsl: number; target: number; inControl: boolean;
  }>;
  capability: { cp: number; cpk: number; mean: number; stdDev: number; performance: string } | null;
  onCalculateLimits: () => void;
  onShowMeasurement: () => void;
  isCalculating: boolean;
}

export function SPCControlChart({ selectedParameter, chartData, capability, onCalculateLimits, onShowMeasurement, isCalculating }: SPCControlChartProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5" />Gráfico de Controle X-barra</CardTitle>
            <CardDescription>{selectedParameter?.name || 'Selecione um parâmetro'}</CardDescription>
          </div>
          {selectedParameter && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onCalculateLimits} disabled={isCalculating}>Calcular Limites</Button>
              <Button size="sm" onClick={onShowMeasurement}><Plus className="h-4 w-4 mr-1" />Medir</Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {selectedParameter && chartData.length > 0 ? (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="sample" fontSize={12} />
                <YAxis fontSize={12} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                {selectedParameter.upper_control_limit && (
                  <ReferenceLine y={selectedParameter.upper_control_limit} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'UCL', position: 'right', fontSize: 10 }} />
                )}
                {selectedParameter.lower_control_limit && (
                  <ReferenceLine y={selectedParameter.lower_control_limit} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'LCL', position: 'right', fontSize: 10 }} />
                )}
                <ReferenceLine y={selectedParameter.target_value} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Target', position: 'right', fontSize: 10 }} />
                <Line
                  type="monotone" dataKey="mean" stroke="hsl(var(--primary))" strokeWidth={2}
                  dot={(props: { cx: number; cy: number; payload: { inControl: boolean } }) => {
                    const { cx, cy, payload } = props;
                    return <circle cx={cx} cy={cy} r={4} fill={payload.inControl ? 'hsl(var(--primary))' : '#ef4444'} stroke={payload.inControl ? 'hsl(var(--primary))' : '#ef4444'} />;
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            {capability && (
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Cp</p>
                  <p className={`text-xl font-bold ${capability.cp >= 1.33 ? 'text-green-500' : capability.cp >= 1 ? 'text-yellow-500' : 'text-red-500'}`}>{capability.cp.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Cpk</p>
                  <p className={`text-xl font-bold ${capability.cpk >= 1.33 ? 'text-green-500' : capability.cpk >= 1 ? 'text-yellow-500' : 'text-red-500'}`}>{capability.cpk.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Média</p>
                  <p className="text-xl font-bold">{capability.mean.toFixed(3)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Desvio Padrão</p>
                  <p className="text-xl font-bold">{capability.stdDev.toFixed(4)}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecione um parâmetro para visualizar o gráfico</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
