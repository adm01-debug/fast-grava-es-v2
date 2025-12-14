import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Clock, Gauge, Target } from 'lucide-react';

interface OEELossesChartProps {
  availabilityLosses: number;
  performanceLosses: number;
  qualityLosses: number;
  overallOEE: number;
}

export function OEELossesChart({ 
  availabilityLosses, 
  performanceLosses, 
  qualityLosses,
  overallOEE
}: OEELossesChartProps) {
  const data = [
    {
      name: 'OEE Atual',
      value: overallOEE,
      color: 'hsl(var(--primary))',
      icon: Target
    },
    {
      name: 'Perdas Disponibilidade',
      value: availabilityLosses,
      color: 'hsl(var(--destructive))',
      icon: Clock
    },
    {
      name: 'Perdas Performance',
      value: performanceLosses,
      color: 'hsl(25 95% 53%)',
      icon: Gauge
    },
    {
      name: 'Perdas Qualidade',
      value: qualityLosses,
      color: 'hsl(48 96% 53%)',
      icon: Target
    }
  ];

  const waterfallData = [
    { name: '100%', value: 100, fill: 'hsl(var(--muted))' },
    { name: 'Disp.', value: -availabilityLosses, fill: 'hsl(var(--destructive))' },
    { name: 'Perf.', value: -performanceLosses, fill: 'hsl(25 95% 53%)' },
    { name: 'Qual.', value: -qualityLosses, fill: 'hsl(48 96% 53%)' },
    { name: 'OEE', value: overallOEE, fill: 'hsl(var(--primary))' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Perdas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {data.map((item, index) => (
            <div 
              key={item.name}
              className="p-4 rounded-lg border bg-card"
              style={{ borderColor: item.color }}
            >
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="h-4 w-4" style={{ color: item.color }} />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
              <span 
                className="text-2xl font-bold"
                style={{ color: item.color }}
              >
                {item.value.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={waterfallData} 
              layout="vertical"
              margin={{ top: 0, right: 30, left: 60, bottom: 0 }}
            >
              <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => [`${Math.abs(value).toFixed(1)}%`]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" radius={4}>
                {waterfallData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">
            <strong>Interpretação:</strong> O OEE de{' '}
            <span className="font-bold text-primary">{overallOEE.toFixed(1)}%</span> representa 
            a multiplicação de Disponibilidade × Performance × Qualidade. 
            Para atingir <span className="text-success">World Class (85%)</span>, 
            foque primeiro nas maiores perdas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
