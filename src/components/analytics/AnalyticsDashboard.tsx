import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Users, Package, Clock, AlertTriangle,
  BarChart3, PieChart, Activity, Calendar, Download, Filter, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface MetricData {
  label: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

// Metric Card with Animation
export function AnimatedMetricCard({ metric }: { metric: MetricData }) {
  const Icon = metric.icon;
  const isPositive = metric.changeType === 'increase';
  const isNegative = metric.changeType === 'decrease';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="relative overflow-hidden">
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10"
          style={{ backgroundColor: metric.color }}
        />
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <motion.p 
                className="text-3xl font-bold mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {metric.value.toLocaleString('pt-BR')}
              </motion.p>
              <div className={cn(
                'flex items-center gap-1 mt-2 text-sm',
                isPositive && 'text-chart-2',
                isNegative && 'text-destructive',
                !isPositive && !isNegative && 'text-muted-foreground'
              )}>
                {isPositive ? <TrendingUp className="h-4 w-4" /> : 
                 isNegative ? <TrendingDown className="h-4 w-4" /> : null}
                <span>{Math.abs(metric.change)}%</span>
                <span className="text-muted-foreground">vs período anterior</span>
              </div>
            </div>
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${metric.color}20` }}
            >
              <Icon className="h-6 w-6" style={{ color: metric.color }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Mini Bar Chart
export function MiniBarChart({ data, height = 60 }: { data: ChartData[]; height?: number }) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((item, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t bg-primary/20 relative group"
          initial={{ height: 0 }}
          animate={{ height: `${(item.value / maxValue) * 100}%` }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
        >
          <div 
            className="absolute inset-x-0 bottom-0 rounded-t bg-primary transition-all group-hover:opacity-80"
            style={{ height: `${(item.value / maxValue) * 100}%` }}
          />
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
              {item.name}: {item.value}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Progress Ring
export function ProgressRing({ 
  value, 
  size = 120, 
  strokeWidth = 8,
  label,
}: { 
  value: number; 
  size?: number; 
  strokeWidth?: number;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
          className="text-primary"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold">{value}%</span>
        {label && <span className="text-xs text-muted-foreground">{label}</span>}
      </div>
    </div>
  );
}

// Sparkline
export function Sparkline({ data, color = 'hsl(var(--primary))' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 40" className="w-full h-10">
      <motion.polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
      />
    </svg>
  );
}

// Full Analytics Dashboard
export function AnalyticsDashboard() {
  const [period, setPeriod] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const metrics: MetricData[] = useMemo(() => [
    { label: 'Total Produzido', value: 12847, change: 12.5, changeType: 'increase', icon: Package, color: 'hsl(var(--primary))' },
    { label: 'Eficiência Média', value: 94.2, change: 3.2, changeType: 'increase', icon: Activity, color: 'hsl(var(--chart-2))' },
    { label: 'Tempo Médio', value: 4.5, change: -8.1, changeType: 'decrease', icon: Clock, color: 'hsl(var(--chart-3))' },
    { label: 'Alertas Ativos', value: 3, change: 0, changeType: 'neutral', icon: AlertTriangle, color: 'hsl(var(--warning))' },
  ], []);

  const weeklyData: ChartData[] = [
    { name: 'Seg', value: 1200 },
    { name: 'Ter', value: 1800 },
    { name: 'Qua', value: 1400 },
    { name: 'Qui', value: 2100 },
    { name: 'Sex', value: 1900 },
    { name: 'Sáb', value: 800 },
    { name: 'Dom', value: 400 },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Visão geral do desempenho</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <AnimatedMetricCard key={i} metric={metric} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Produção Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MiniBarChart data={weeklyData} height={200} />
            <div className="flex justify-between mt-4 text-xs text-muted-foreground">
              {weeklyData.map((d, i) => (
                <span key={i}>{d.name}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              OEE Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ProgressRing value={87} size={160} label="OEE" />
            <div className="grid grid-cols-3 gap-4 mt-6 w-full text-center">
              <div>
                <p className="text-2xl font-bold text-chart-2">92%</p>
                <p className="text-xs text-muted-foreground">Disponibilidade</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-chart-3">95%</p>
                <p className="text-xs text-muted-foreground">Performance</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-chart-4">99%</p>
                <p className="text-xs text-muted-foreground">Qualidade</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Tendência de Produção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Sparkline data={[10, 15, 8, 22, 18, 25, 30, 28, 35, 32, 40, 38]} />
        </CardContent>
      </Card>
    </div>
  );
}

export default AnalyticsDashboard;
