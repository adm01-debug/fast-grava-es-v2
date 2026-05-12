import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FavoriteButton, FavoritesDropdown } from '@/components/navigation/FavoritesManager';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { useEnergy } from '@/hooks/useEnergy';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BatteryCharging, Zap, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Gauge, Plus, CheckCircle, Command } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { EnergyChartTabs } from '@/components/energy/EnergyChartTabs';
import { AIEnergyAdvisor } from '@/components/energy/AIEnergyAdvisor';


export default function EnergyDashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) });
  const [isAddingConsumption, setIsAddingConsumption] = useState(false);
  const [newConsumption, setNewConsumption] = useState({ machine_id: '', consumption_kwh: '', power_factor: '', peak_demand_kw: '' });

  const { consumption, alerts, stats, isLoading, addConsumption, resolveAlert } = useEnergy(dateRange);

  const { data: machines } = useQuery({
    queryKey: ['machines-active'],
    queryFn: async () => { const { data } = await supabase.from('machines').select('id, name, code').eq('is_active', true); return data || []; },
  });

  const handleAddConsumption = async () => {
    if (!newConsumption.machine_id || !newConsumption.consumption_kwh) { toast.error('Preencha os campos obrigatórios'); return; }
    await addConsumption.mutateAsync({
      machine_id: newConsumption.machine_id, consumption_kwh: parseFloat(newConsumption.consumption_kwh),
      power_factor: newConsumption.power_factor ? parseFloat(newConsumption.power_factor) : undefined,
      peak_demand_kw: newConsumption.peak_demand_kw ? parseFloat(newConsumption.peak_demand_kw) : undefined,
      reading_type: 'manual',
    });
    toast.success('Leitura registrada com sucesso');
    setIsAddingConsumption(false);
    setNewConsumption({ machine_id: '', consumption_kwh: '', power_factor: '', peak_demand_kw: '' });
  };

  if (isLoading) {
    return (<MainLayout><div className="p-6 space-y-6"><Skeleton className="h-10 w-64" /><div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}</div><Skeleton className="h-96" /></div></MainLayout>);
  }

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in-up">
        <Breadcrumbs />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-black tracking-tighter">
                <span className="gradient-text animate-pulse-glow">Sustainable Intelligence 10/10</span>
              </h1>
              <FavoriteButton path="/energy" name="Energia" />
            </div>
            <p className="text-muted-foreground mt-1">Gestão energética avançada e monitoramento de pegada de carbono</p>
            <p className="text-muted-foreground">{format(dateRange.start, "MMMM 'de' yyyy", { locale: ptBR })}</p>
          </div>
          <div className="flex items-center gap-2">
            <FavoritesDropdown onNavigate={(url) => navigate(url)} />
            <Badge variant="outline" className="gap-1 text-xs hidden sm:flex"><Command className="h-3 w-3" />K para buscar</Badge>
            <Button variant="outline" onClick={() => setDateRange({ start: startOfMonth(subMonths(dateRange.start, 1)), end: endOfMonth(subMonths(dateRange.start, 1)) })}>Mês Anterior</Button>
            <Dialog open={isAddingConsumption} onOpenChange={setIsAddingConsumption}>
              <DialogTrigger asChild><Button className="gradient-primary"><Plus className="h-4 w-4 mr-2" />Nova Leitura</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Registrar Leitura de Energia</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Máquina *</Label>
                    <Select value={newConsumption.machine_id} onValueChange={(v) => setNewConsumption(prev => ({ ...prev, machine_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione a máquina" /></SelectTrigger>
                      <SelectContent>{machines?.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Consumo (kWh) *</Label><Input type="number" step="0.01" value={newConsumption.consumption_kwh} onChange={(e) => setNewConsumption(prev => ({ ...prev, consumption_kwh: e.target.value }))} placeholder="Ex: 125.50" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Fator de Potência</Label><Input type="number" step="0.01" max="1" value={newConsumption.power_factor} onChange={(e) => setNewConsumption(prev => ({ ...prev, power_factor: e.target.value }))} placeholder="Ex: 0.92" /></div>
                    <div className="space-y-2"><Label>Demanda de Pico (kW)</Label><Input type="number" step="0.1" value={newConsumption.peak_demand_kw} onChange={(e) => setNewConsumption(prev => ({ ...prev, peak_demand_kw: e.target.value }))} placeholder="Ex: 45.5" /></div>
                  </div>
                  <Button onClick={handleAddConsumption} className="w-full gradient-primary" disabled={addConsumption.isPending}>{addConsumption.isPending ? 'Salvando...' : 'Registrar Leitura'}</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="glass-card"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Consumo Total</p><p className="text-2xl font-bold">{stats.totalConsumption.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kWh</p><p className="text-xs text-muted-foreground">Média: {stats.avgDailyConsumption.toFixed(1)} kWh/dia</p></div><div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Zap className="h-6 w-6 text-primary" /></div></div></CardContent></Card>
          <Card className="glass-card"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Custo Total</p><p className="text-2xl font-bold">R$ {stats.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p><div className="flex items-center gap-1 mt-1">{stats.costTrend >= 0 ? <TrendingUp className="h-3 w-3 text-destructive" /> : <TrendingDown className="h-3 w-3 text-success" />}<span className={`text-xs ${stats.costTrend >= 0 ? 'text-destructive' : 'text-success'}`}>{Math.abs(stats.costTrend).toFixed(1)}% vs mês anterior</span></div></div><div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center"><DollarSign className="h-6 w-6 text-green-500" /></div></div></CardContent></Card>
          <Card className="glass-card"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Demanda de Pico</p><p className="text-2xl font-bold">{stats.peakDemand.toFixed(1)} kW</p><p className="text-xs text-muted-foreground">Maior demanda registrada</p></div><div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center"><BatteryCharging className="h-6 w-6 text-orange-500" /></div></div></CardContent></Card>
          <Card className="glass-card"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Fator de Potência</p><p className="text-2xl font-bold">{stats.avgPowerFactor.toFixed(2)}</p><Badge variant={stats.avgPowerFactor >= 0.92 ? 'default' : 'destructive'} className="mt-1">{stats.avgPowerFactor >= 0.92 ? 'Adequado' : 'Baixo'}</Badge></div><div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center"><Gauge className="h-6 w-6 text-cyan-500" /></div></div></CardContent></Card>
        </div>

        <EnergyChartTabs stats={stats} alerts={alerts} onResolveAlert={(id) => resolveAlert.mutate(id)} isResolving={resolveAlert.isPending} />

        {/* Recent Readings */}
        <Card className="glass-card">
          <CardHeader><CardTitle>Últimas Leituras</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border"><th className="text-left py-3 px-2">Data/Hora</th><th className="text-left py-3 px-2">Máquina</th><th className="text-right py-3 px-2">Consumo (kWh)</th><th className="text-right py-3 px-2">FP</th><th className="text-right py-3 px-2">Demanda (kW)</th><th className="text-right py-3 px-2">Custo</th><th className="text-center py-3 px-2">Tipo</th></tr></thead>
                <tbody>
                  {consumption.slice(0, 15).map((c) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-2">{format(new Date(c.recorded_at), 'dd/MM/yyyy HH:mm')}</td>
                      <td className="py-2 px-2">{c.machine?.name || '-'}</td>
                      <td className="py-2 px-2 text-right font-medium">{Number(c.consumption_kwh).toFixed(2)}</td>
                      <td className="py-2 px-2 text-right">{c.power_factor ? Number(c.power_factor).toFixed(2) : '-'}</td>
                      <td className="py-2 px-2 text-right">{c.peak_demand_kw ? Number(c.peak_demand_kw).toFixed(1) : '-'}</td>
                      <td className="py-2 px-2 text-right text-success">R$ {Number(c.total_cost).toFixed(2)}</td>
                      <td className="py-2 px-2 text-center"><Badge variant={c.reading_type === 'automatic' ? 'default' : 'secondary'}>{c.reading_type === 'automatic' ? 'Auto' : 'Manual'}</Badge></td>
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
