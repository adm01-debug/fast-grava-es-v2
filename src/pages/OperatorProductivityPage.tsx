import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useOperatorProductivity, OperatorProductivityMetrics, ProductivityPeriod } from '@/hooks/useOperatorProductivity';
import { useOperatorEvolution } from '@/hooks/useOperatorEvolution';
import { useOperatorGoals } from '@/hooks/useOperatorGoals';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, TrendingUp as TrendingUpIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateGoalModal } from '@/components/operators/CreateGoalModal';
import { OperatorGoalsCard, GoalsSummary } from '@/components/operators/OperatorGoalsCard';
import { 
  Users, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Clock, 
  Zap, 
  Search,
  Trophy,
  Target,
  Activity,
  BarChart3,
  Timer,
  CheckCircle2,
  XCircle,
  Gauge,
  Loader2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { format, subDays, eachDayOfInterval, startOfDay, parseISO, isAfter, isBefore, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  className = '' 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: typeof Users;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}) {
  return (
    <Card className={`card-elevated hover-lift ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold font-display">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${
            trend === 'up' ? 'bg-success/10 text-success' :
            trend === 'down' ? 'bg-destructive/10 text-destructive' :
            'bg-primary/10 text-primary'
          }`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface OperatorCardProps {
  operator: OperatorProductivityMetrics;
  goals?: ReturnType<typeof useOperatorGoals>['activeGoals'];
  onAddGoal?: () => void;
}

function OperatorCard({ operator, goals = [], onAddGoal }: OperatorCardProps) {
  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getEfficiencyBg = (score: number) => {
    if (score >= 80) return 'bg-success/10';
    if (score >= 60) return 'bg-warning/10';
    return 'bg-destructive/10';
  };

  return (
    <Card className="card-elevated hover-lift transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 border-2 border-border">
            <AvatarImage src={operator.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {operator.operatorName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{operator.operatorName}</h3>
              <Badge variant={operator.isActive ? 'default' : 'secondary'} className="shrink-0">
                {operator.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <span>{operator.assignedMachines} máquina(s)</span>
              {operator.machineNames.length > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-xs">
                      Ver máquinas
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium mb-1">Máquinas atribuídas:</p>
                    <ul className="text-xs space-y-0.5">
                      {operator.machineNames.map((name, i) => (
                        <li key={i}>• {name}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Efficiency Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Eficiência</span>
                <span className={`text-sm font-bold ${getEfficiencyColor(operator.efficiencyScore)}`}>
                  {operator.efficiencyScore.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={operator.efficiencyScore} 
                className={`h-2 ${getEfficiencyBg(operator.efficiencyScore)}`}
              />
            </div>

            {/* Operator Goals */}
            {goals.length > 0 && (
              <div className="mb-4">
                <OperatorGoalsCard goals={goals} metrics={operator} compact />
              </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-muted-foreground">Concluídos:</span>
                <span className="font-medium">{operator.totalJobsCompleted}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Peças:</span>
                <span className="font-medium">{operator.totalPiecesProduced.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-muted-foreground">Perdas:</span>
                <span className="font-medium">{operator.lossRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-warning" />
                <span className="text-muted-foreground">Veloc.:</span>
                <span className="font-medium">{operator.productionVelocity.toFixed(1)}/h</span>
              </div>
            </div>

            {/* Scan Activity */}
            {operator.totalScans > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Atividade de Scans</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-success">▶ {operator.startActions}</span>
                  <span className="text-primary">✓ {operator.finishActions}</span>
                  <span className="text-warning">⏸ {operator.pauseActions}</span>
                </div>
              </div>
            )}

            {/* Add Goal Button */}
            {onAddGoal && goals.length === 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 w-full text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddGoal();
                }}
              >
                <Target className="h-3 w-3 mr-1" />
                Definir meta
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EfficiencyChart({ operators }: { operators: OperatorProductivityMetrics[] }) {
  const chartData = operators
    .filter(o => o.isActive && o.totalJobsCompleted > 0)
    .slice(0, 10)
    .map(o => ({
      name: o.operatorName.split(' ')[0],
      efficiency: Math.round(o.efficiencyScore),
      jobs: o.totalJobsCompleted,
      pieces: o.totalPiecesProduced,
    }));

  if (chartData.length === 0) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comparativo de Eficiência
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          Nenhum dado de produção disponível
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Comparativo de Eficiência
        </CardTitle>
        <CardDescription>Top 10 operadores por score de eficiência</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis type="number" domain={[0, 100]} className="text-xs" />
            <YAxis dataKey="name" type="category" width={80} className="text-xs" />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => [
                `${value}${name === 'efficiency' ? '%' : ''}`,
                name === 'efficiency' ? 'Eficiência' : name === 'jobs' ? 'Jobs' : 'Peças'
              ]}
            />
            <Bar dataKey="efficiency" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={
                    entry.efficiency >= 80 ? 'hsl(var(--success))' :
                    entry.efficiency >= 60 ? 'hsl(var(--warning))' :
                    'hsl(var(--destructive))'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ProductionRadarChart({ operator }: { operator: OperatorProductivityMetrics }) {
  const radarData = [
    { metric: 'Eficiência', value: operator.efficiencyScore, fullMark: 100 },
    { metric: 'Volume', value: Math.min(100, operator.totalJobsCompleted * 10), fullMark: 100 },
    { metric: 'Qualidade', value: Math.max(0, 100 - operator.lossRate * 5), fullMark: 100 },
    { metric: 'Velocidade', value: Math.min(100, operator.productionVelocity * 2), fullMark: 100 },
    { metric: 'Atividade', value: Math.min(100, operator.totalScans * 5), fullMark: 100 },
  ];

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Perfil de Performance
        </CardTitle>
        <CardDescription>
          {operator.operatorName}
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}>
            <PolarGrid className="stroke-border" />
            <PolarAngleAxis dataKey="metric" className="text-xs" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} className="text-xs" />
            <Radar
              name={operator.operatorName}
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface EvolutionChartProps {
  evolutionData: { operatorId: string; operatorName: string; dailyData: { dateLabel: string; efficiencyScore: number; jobsCompleted: number; piecesProduced: number }[] }[];
  overallDailyData: { dateLabel: string; efficiencyScore: number; jobsCompleted: number; piecesProduced: number }[];
  selectedOperatorId: string | 'all';
  onOperatorChange: (id: string | 'all') => void;
  isLoading: boolean;
}

// Linear regression calculation for trend line
function calculateLinearRegression(data: { x: number; y: number }[]) {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: 0 };
  
  const sumX = data.reduce((sum, d) => sum + d.x, 0);
  const sumY = data.reduce((sum, d) => sum + d.y, 0);
  const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
  const sumXX = data.reduce((sum, d) => sum + d.x * d.x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

function EvolutionChart({ evolutionData, overallDailyData, selectedOperatorId, onOperatorChange, isLoading }: EvolutionChartProps) {
  const FORECAST_DAYS = 7;

  const { chartData, trendDirection, forecastValue } = useMemo(() => {
    let baseData: { dateLabel: string; efficiencyScore: number; jobsCompleted: number; piecesProduced: number }[];
    
    if (selectedOperatorId === 'all') {
      baseData = overallDailyData;
    } else {
      const operator = evolutionData.find(o => o.operatorId === selectedOperatorId);
      baseData = operator?.dailyData || [];
    }

    // Filter data points with activity for regression
    const dataWithActivity = baseData
      .map((d, i) => ({ x: i, y: d.efficiencyScore, ...d }))
      .filter(d => d.efficiencyScore > 0);

    // Calculate linear regression
    const { slope, intercept } = calculateLinearRegression(dataWithActivity);
    
    // Calculate trend value for each point
    const dataWithTrend = baseData.map((d, i) => {
      const trendValue = Math.max(0, Math.min(100, intercept + slope * i));
      return {
        ...d,
        efficiency: Math.round(d.efficiencyScore * 10) / 10,
        trend: Math.round(trendValue * 10) / 10,
        isForecast: false,
      };
    });

    // Generate forecast data points
    const lastIndex = baseData.length - 1;
    const forecastData = [];
    for (let i = 1; i <= FORECAST_DAYS; i++) {
      const forecastIndex = lastIndex + i;
      const forecastEfficiency = Math.max(0, Math.min(100, intercept + slope * forecastIndex));
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      
      forecastData.push({
        dateLabel: format(futureDate, 'dd/MM'),
        efficiencyScore: 0,
        jobsCompleted: 0,
        piecesProduced: 0,
        efficiency: null as number | null,
        trend: Math.round(forecastEfficiency * 10) / 10,
        isForecast: true,
        forecast: Math.round(forecastEfficiency * 10) / 10,
      });
    }

    const combinedData = [...dataWithTrend, ...forecastData];
    
    // Determine trend direction
    const trendDir = slope > 0.5 ? 'up' : slope < -0.5 ? 'down' : 'stable';
    const lastForecast = forecastData[forecastData.length - 1]?.forecast || 0;

    return {
      chartData: combinedData,
      trendDirection: trendDir as 'up' | 'down' | 'stable',
      forecastValue: lastForecast,
    };
  }, [selectedOperatorId, evolutionData, overallDailyData]);

  const operatorOptions = useMemo(() => {
    return [
      { id: 'all', name: 'Média Geral' },
      ...evolutionData.map(o => ({ id: o.operatorId, name: o.operatorName })),
    ];
  }, [evolutionData]);

  if (isLoading) {
    return (
      <Card className="card-elevated col-span-full">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="h-[300px]">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasData = chartData.some(d => d.efficiencyScore > 0);

  return (
    <Card className="card-elevated col-span-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5" />
              Evolução da Eficiência
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              Acompanhamento diário com tendência e previsão de {FORECAST_DAYS} dias
              {hasData && (
                <Badge 
                  variant="outline" 
                  className={
                    trendDirection === 'up' ? 'text-success border-success' :
                    trendDirection === 'down' ? 'text-destructive border-destructive' :
                    'text-muted-foreground'
                  }
                >
                  {trendDirection === 'up' ? '↑ Tendência de alta' :
                   trendDirection === 'down' ? '↓ Tendência de queda' :
                   '→ Estável'}
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {hasData && (
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">Previsão em {FORECAST_DAYS} dias</p>
                <p className={`text-lg font-bold ${
                  forecastValue >= 70 ? 'text-success' : 
                  forecastValue >= 50 ? 'text-warning' : 
                  'text-destructive'
                }`}>
                  {forecastValue}%
                </p>
              </div>
            )}
            <Select value={selectedOperatorId} onValueChange={onOperatorChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecionar operador" />
              </SelectTrigger>
              <SelectContent>
                {operatorOptions.map(op => (
                  <SelectItem key={op.id} value={op.id}>
                    {op.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[300px]">
        {!hasData ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Nenhum dado de produção disponível para o período
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="dateLabel" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                domain={[0, 100]} 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => `${v}%`}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number | null, name: string) => {
                  if (value === null) return ['-', ''];
                  if (name === 'efficiency') return [`${value}%`, 'Eficiência'];
                  if (name === 'trend') return [`${value}%`, 'Tendência'];
                  if (name === 'forecast') return [`${value}%`, 'Previsão'];
                  return [value, name];
                }}
                labelFormatter={(label, payload) => {
                  const point = payload?.[0]?.payload;
                  return point?.isForecast ? `Previsão: ${label}` : `Data: ${label}`;
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => {
                  if (value === 'efficiency') return 'Eficiência Real';
                  if (value === 'trend') return 'Linha de Tendência';
                  if (value === 'forecast') return 'Previsão';
                  return value;
                }}
              />
              {/* Actual efficiency area */}
              <Area
                type="monotone"
                dataKey="efficiency"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#efficiencyGradient)"
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
                connectNulls={false}
              />
              {/* Trend line */}
              <Line
                type="monotone"
                dataKey="trend"
                stroke="hsl(var(--warning))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(var(--warning))' }}
              />
              {/* Forecast area */}
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="hsl(var(--success))"
                strokeWidth={2}
                strokeDasharray="3 3"
                fill="url(#forecastGradient)"
                dot={{ fill: 'hsl(var(--success))', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: 'hsl(var(--success))' }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default function OperatorProductivityPage() {
  const [period, setPeriod] = useState<ProductivityPeriod>(30);
  const { operators, overallStats, isLoading } = useOperatorProductivity(period);
  const { activeGoals, getGoalsByOperator, isLoading: isLoadingGoals } = useOperatorGoals();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'efficiency' | 'jobs' | 'pieces' | 'loss'>('efficiency');
  const [selectedOperator, setSelectedOperator] = useState<OperatorProductivityMetrics | null>(null);
  const [evolutionOperatorId, setEvolutionOperatorId] = useState<string | 'all'>('all');
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const [goalOperatorId, setGoalOperatorId] = useState<string | undefined>(undefined);
  
  // Use period for evolution chart (default to 30 if 'all')
  const evolutionDays = period === 'all' ? 30 : period;
  const { evolutionData, overallDailyData, isLoading: isLoadingEvolution } = useOperatorEvolution(evolutionDays);

  const periodLabels: Record<ProductivityPeriod, string> = {
    7: 'Últimos 7 dias',
    30: 'Últimos 30 dias',
    90: 'Últimos 90 dias',
    'all': 'Todo o período',
  };

  const filteredOperators = useMemo(() => {
    let result = operators;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.operatorName.toLowerCase().includes(query) ||
        o.machineNames.some(m => m.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (statusFilter === 'active') {
      result = result.filter(o => o.isActive);
    } else if (statusFilter === 'inactive') {
      result = result.filter(o => !o.isActive);
    }

    // Sort
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'jobs': return b.totalJobsCompleted - a.totalJobsCompleted;
        case 'pieces': return b.totalPiecesProduced - a.totalPiecesProduced;
        case 'loss': return a.lossRate - b.lossRate;
        default: return b.efficiencyScore - a.efficiencyScore;
      }
    });
  }, [operators, searchQuery, statusFilter, sortBy]);

  // Select first operator with data for radar chart
  const displayOperator = selectedOperator || filteredOperators.find(o => o.totalJobsCompleted > 0) || filteredOperators[0];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Produtividade por Operador
            </h1>
            <p className="text-muted-foreground mt-1">
              Métricas individuais de desempenho e eficiência
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setGoalOperatorId(undefined);
                setShowCreateGoalModal(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
            
            {/* Period Filter */}
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <Tabs value={String(period)} onValueChange={(v) => setPeriod(v === 'all' ? 'all' : Number(v) as ProductivityPeriod)}>
                <TabsList className="bg-muted/50">
                  <TabsTrigger value="7" className="text-xs px-3">7 dias</TabsTrigger>
                  <TabsTrigger value="30" className="text-xs px-3">30 dias</TabsTrigger>
                  <TabsTrigger value="90" className="text-xs px-3">90 dias</TabsTrigger>
                  <TabsTrigger value="all" className="text-xs px-3">Tudo</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Period Indicator */}
        {period !== 'all' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="font-normal">
              {periodLabels[period]}
            </Badge>
            <span>•</span>
            <span>Dados filtrados por período de conclusão</span>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Operadores Ativos"
            value={operators.filter(o => o.isActive).length}
            subtitle={`${operators.length} total cadastrados`}
            icon={Users}
          />
          <StatCard
            title="Eficiência Média"
            value={`${overallStats.averageEfficiency.toFixed(1)}%`}
            subtitle="Baseada em qualidade e tempo"
            icon={Gauge}
            trend={overallStats.averageEfficiency >= 70 ? 'up' : 'down'}
          />
          <StatCard
            title="Jobs Concluídos"
            value={overallStats.totalJobsCompleted.toLocaleString()}
            subtitle="Total de todos os operadores"
            icon={CheckCircle2}
            trend="up"
          />
          <StatCard
            title="Taxa de Perda Média"
            value={`${overallStats.averageLossRate.toFixed(1)}%`}
            subtitle="Índice de refugo geral"
            icon={AlertTriangle}
            trend={overallStats.averageLossRate <= 5 ? 'up' : 'down'}
          />
        </div>

        {/* Goals Summary */}
        {activeGoals.length > 0 && (
          <GoalsSummary allGoals={activeGoals} allMetrics={operators} />
        )}

        {/* Top Performer Highlight */}
        {overallStats.topPerformer && overallStats.topPerformer.totalJobsCompleted > 0 && (
          <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Destaque do Período</p>
                  <p className="text-xl font-bold">{overallStats.topPerformer.operatorName}</p>
                  <p className="text-sm text-muted-foreground">
                    {overallStats.topPerformer.efficiencyScore.toFixed(1)}% de eficiência • {' '}
                    {overallStats.topPerformer.totalJobsCompleted} jobs • {' '}
                    {overallStats.topPerformer.totalPiecesProduced.toLocaleString()} peças
                  </p>
                </div>
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  Top Performance
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Evolution Chart */}
        <EvolutionChart
          evolutionData={evolutionData}
          overallDailyData={overallDailyData}
          selectedOperatorId={evolutionOperatorId}
          onOperatorChange={setEvolutionOperatorId}
          isLoading={isLoadingEvolution}
        />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EfficiencyChart operators={operators} />
          {displayOperator && <ProductionRadarChart operator={displayOperator} />}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar operador ou máquina..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="efficiency">Eficiência</SelectItem>
              <SelectItem value="jobs">Jobs Concluídos</SelectItem>
              <SelectItem value="pieces">Peças Produzidas</SelectItem>
              <SelectItem value="loss">Menor Perda</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Operators Grid */}
        {filteredOperators.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum operador encontrado</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Cadastre operadores para visualizar métricas de produtividade'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredOperators.map((operator, index) => (
              <div 
                key={operator.operatorId}
                className="animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedOperator(operator)}
              >
                <OperatorCard 
                  operator={operator} 
                  goals={getGoalsByOperator(operator.operatorId)}
                  onAddGoal={() => {
                    setGoalOperatorId(operator.operatorId);
                    setShowCreateGoalModal(true);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      <CreateGoalModal
        open={showCreateGoalModal}
        onOpenChange={setShowCreateGoalModal}
        defaultOperatorId={goalOperatorId}
      />
    </MainLayout>
  );
}
