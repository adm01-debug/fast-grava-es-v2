import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FavoriteButton, FavoritesDropdown } from '@/components/navigation/FavoritesManager';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { KPITooltip } from '@/components/ui/kpi-tooltip';
import { useEnergy } from '@/hooks/useEnergy';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  BatteryCharging, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  DollarSign,
  Gauge,
  Plus,
  CheckCircle,
  Command
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function EnergyDashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  });
  const [isAddingConsumption, setIsAddingConsumption] = useState(false);
  const [newConsumption, setNewConsumption] = useState({
    machine_id: '',
    consumption_kwh: '',
    power_factor: '',
    peak_demand_kw: '',
  });

  const { 
    consumption, 
    alerts, 
    stats, 
    isLoading, 
    addConsumption, 
    resolveAlert 
  } = useEnergy(dateRange);

  // Fetch machines for select
  const { data: machines } = useQuery({
    queryKey: ['machines-active'],
    queryFn: async () => {
      const { data } = await supabase
        .from('machines')
        .select('id, name, code')
        .eq('is_active', true);
      return data || [];
    },
  });

  const handleAddConsumption = async () => {
    if (!newConsumption.machine_id || !newConsumption.consumption_kwh) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    await addConsumption.mutateAsync({
      machine_id: newConsumption.machine_id,
      consumption_kwh: parseFloat(newConsumption.consumption_kwh),
      power_factor: newConsumption.power_factor ? parseFloat(newConsumption.power_factor) : undefined,
      peak_demand_kw: newConsumption.peak_demand_kw ? parseFloat(newConsumption.peak_demand_kw) : undefined,
      reading_type: 'manual',
    });

    toast.success('Leitura registrada com sucesso');
    setIsAddingConsumption(false);
    setNewConsumption({ machine_id: '', consumption_kwh: '', power_factor: '', peak_demand_kw: '' });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in-up">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-display font-bold">
                <span className="gradient-text">Monitoramento de Energia</span>
              </h1>
              <FavoriteButton 
                path="/energy" 
                name="Energia" 
              />
            </div>
            <p className="text-muted-foreground">
              {format(dateRange.start, "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <FavoritesDropdown onNavigate={(url) => navigate(url)} />
            <Badge variant="outline" className="gap-1 text-xs hidden sm:flex">
              <Command className="h-3 w-3" />K para buscar
            </Badge>
            <Button
              variant="outline"
              onClick={() => setDateRange({
                start: startOfMonth(subMonths(dateRange.start, 1)),
                end: endOfMonth(subMonths(dateRange.start, 1)),
              })}
            >
              Mês Anterior
            </Button>
            
            <Dialog open={isAddingConsumption} onOpenChange={setIsAddingConsumption}>
              <DialogTrigger asChild>
                <Button className="gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Leitura
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Leitura de Energia</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Máquina *</Label>
                    <Select 
                      value={newConsumption.machine_id}
                      onValueChange={(v) => setNewConsumption(prev => ({ ...prev, machine_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a máquina" />
                      </SelectTrigger>
                      <SelectContent>
                        {machines?.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Consumo (kWh) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newConsumption.consumption_kwh}
                      onChange={(e) => setNewConsumption(prev => ({ ...prev, consumption_kwh: e.target.value }))}
                      placeholder="Ex: 125.50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Fator de Potência</Label>
                      <Input
                        type="number"
                        step="0.01"
                        max="1"
                        value={newConsumption.power_factor}
                        onChange={(e) => setNewConsumption(prev => ({ ...prev, power_factor: e.target.value }))}
                        placeholder="Ex: 0.92"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Demanda de Pico (kW)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={newConsumption.peak_demand_kw}
                        onChange={(e) => setNewConsumption(prev => ({ ...prev, peak_demand_kw: e.target.value }))}
                        placeholder="Ex: 45.5"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleAddConsumption} 
                    className="w-full gradient-primary"
                    disabled={addConsumption.isPending}
                  >
                    {addConsumption.isPending ? 'Salvando...' : 'Registrar Leitura'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Consumo Total</p>
                  <p className="text-2xl font-bold">{stats.totalConsumption.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kWh</p>
                  <p className="text-xs text-muted-foreground">
                    Média: {stats.avgDailyConsumption.toFixed(1)} kWh/dia
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Custo Total</p>
                  <p className="text-2xl font-bold">R$ {stats.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stats.costTrend >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-destructive" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-success" />
                    )}
                    <span className={`text-xs ${stats.costTrend >= 0 ? 'text-destructive' : 'text-success'}`}>
                      {Math.abs(stats.costTrend).toFixed(1)}% vs mês anterior
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Demanda de Pico</p>
                  <p className="text-2xl font-bold">{stats.peakDemand.toFixed(1)} kW</p>
                  <p className="text-xs text-muted-foreground">Maior demanda registrada</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <BatteryCharging className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fator de Potência</p>
                  <p className="text-2xl font-bold">{stats.avgPowerFactor.toFixed(2)}</p>
                  <Badge variant={stats.avgPowerFactor >= 0.92 ? 'default' : 'destructive'} className="mt-1">
                    {stats.avgPowerFactor >= 0.92 ? 'Adequado' : 'Baixo'}
                  </Badge>
                </div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <Gauge className="h-6 w-6 text-cyan-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="consumption" className="space-y-4">
          <TabsList>
            <TabsTrigger value="consumption">Consumo Diário</TabsTrigger>
            <TabsTrigger value="machines">Por Máquina</TabsTrigger>
            <TabsTrigger value="pattern">Padrão Horário</TabsTrigger>
            <TabsTrigger value="alerts">Alertas ({alerts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="consumption">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Consumo e Custo Diário</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={stats.dailyConsumption}>
                    <defs>
                      <linearGradient id="colorConsumption" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(v) => format(new Date(v), 'dd/MM')}
                      className="text-xs fill-muted-foreground"
                    />
                    <YAxis yAxisId="left" className="text-xs fill-muted-foreground" />
                    <YAxis yAxisId="right" orientation="right" className="text-xs fill-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'consumption' 
                          ? `${value.toFixed(1)} kWh` 
                          : `R$ ${value.toFixed(2)}`,
                        name === 'consumption' ? 'Consumo' : 'Custo'
                      ]}
                      labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy')}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="consumption"
                      stroke="hsl(var(--primary))"
                      fill="url(#colorConsumption)"
                      strokeWidth={2}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="cost"
                      stroke="hsl(var(--accent))"
                      fill="url(#colorCost)"
                      strokeWidth={2}
                    />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="machines">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Consumo por Máquina</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.consumptionByMachine.slice(0, 5)}
                        dataKey="consumption"
                        nameKey="machineName"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.consumptionByMachine.slice(0, 5).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(1)} kWh`, 'Consumo']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Ranking de Consumo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.consumptionByMachine.slice(0, 8).map((machine, index) => (
                      <div key={machine.machineId} className="flex items-center gap-3">
                        <span className="w-6 text-center font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">{machine.machineName}</span>
                            <span className="text-sm text-muted-foreground">
                              {machine.consumption.toFixed(0)} kWh
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ 
                                width: `${(machine.consumption / (stats.consumptionByMachine[0]?.consumption || 1)) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground w-20 text-right">
                          R$ {machine.cost.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pattern">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Padrão de Consumo por Hora</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats.hourlyPattern}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis 
                      dataKey="hour" 
                      tickFormatter={(v) => `${v}h`}
                      className="text-xs fill-muted-foreground"
                    />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value.toFixed(2)} kWh`, 'Média de Consumo']}
                      labelFormatter={(label) => `${label}:00h`}
                    />
                    <Bar 
                      dataKey="avgConsumption" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Identifique os horários de pico para otimizar o uso de energia
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Alertas de Energia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success opacity-50" />
                    <p>Nenhum alerta ativo</p>
                    <p className="text-sm">O consumo de energia está dentro dos parâmetros normais</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div 
                        key={alert.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            alert.severity === 'critical' ? 'bg-destructive/10' :
                            alert.severity === 'warning' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                          }`}>
                            <AlertTriangle className={`h-5 w-5 ${
                              alert.severity === 'critical' ? 'text-destructive' :
                              alert.severity === 'warning' ? 'text-amber-500' : 'text-blue-500'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{alert.message}</p>
                            <p className="text-sm text-muted-foreground">
                              {alert.machine?.name} • {format(new Date(alert.created_at), 'dd/MM HH:mm')}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => resolveAlert.mutate(alert.id)}
                          disabled={resolveAlert.isPending}
                        >
                          Resolver
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Readings */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Últimas Leituras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2">Data/Hora</th>
                    <th className="text-left py-3 px-2">Máquina</th>
                    <th className="text-right py-3 px-2">Consumo (kWh)</th>
                    <th className="text-right py-3 px-2">FP</th>
                    <th className="text-right py-3 px-2">Demanda (kW)</th>
                    <th className="text-right py-3 px-2">Custo</th>
                    <th className="text-center py-3 px-2">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {consumption.slice(0, 15).map((c) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-2">
                        {format(new Date(c.recorded_at), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="py-2 px-2">{c.machine?.name || '-'}</td>
                      <td className="py-2 px-2 text-right font-medium">
                        {Number(c.consumption_kwh).toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {c.power_factor ? Number(c.power_factor).toFixed(2) : '-'}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {c.peak_demand_kw ? Number(c.peak_demand_kw).toFixed(1) : '-'}
                      </td>
                      <td className="py-2 px-2 text-right text-success">
                        R$ {Number(c.total_cost).toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <Badge variant={c.reading_type === 'automatic' ? 'default' : 'secondary'}>
                          {c.reading_type === 'automatic' ? 'Auto' : 'Manual'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
