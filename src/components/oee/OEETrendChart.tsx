import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TrendDataPoint {
  date: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
}

interface OEETrendChartProps {
  data: TrendDataPoint[];
  worldClassBenchmark: number;
}

export function OEETrendChart({ data, worldClassBenchmark }: OEETrendChartProps) {
  const chartData = data.map(d => ({
    ...d,
    dateLabel: format(parseISO(d.date), 'dd/MM', { locale: ptBR })
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do OEE (Últimos 14 dias)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="dateLabel" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                tickFormatter={v => `${v}%`}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    oee: 'OEE',
                    availability: 'Disponibilidade',
                    performance: 'Performance',
                    quality: 'Qualidade'
                  };
                  return [`${value.toFixed(1)}%`, labels[name] || name];
                }}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Legend 
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    oee: 'OEE',
                    availability: 'Disponibilidade',
                    performance: 'Performance',
                    quality: 'Qualidade'
                  };
                  return labels[value] || value;
                }}
              />
              
              {/* World-class benchmark line */}
              <ReferenceLine 
                y={worldClassBenchmark} 
                stroke="hsl(var(--primary))"
                strokeDasharray="5 5"
                label={{ 
                  value: 'World Class', 
                  position: 'right',
                  fontSize: 10,
                  fill: 'hsl(var(--primary))'
                }}
              />
              
              <Line
                type="monotone"
                dataKey="oee"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="availability"
                stroke="hsl(142 76% 36%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(142 76% 36%)', strokeWidth: 1, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="performance"
                stroke="hsl(221 83% 53%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(221 83% 53%)', strokeWidth: 1, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="quality"
                stroke="hsl(262 83% 58%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(262 83% 58%)', strokeWidth: 1, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
