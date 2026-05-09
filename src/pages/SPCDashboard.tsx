import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { format } from 'date-fns';
import { Activity, Plus, AlertTriangle, CheckCircle, TrendingUp, Target, Settings } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { useSPCParameters, useSPCMeasurements, useSPCAlerts, useSPCMutations, calculateCapabilityIndices, detectRunRules, SPCParameter } from '@/hooks/useSPC';
import { SPCCreateParameterModal } from '@/components/spc/SPCCreateParameterModal';
import { SPCControlChart } from '@/components/spc/SPCControlChart';

export default function SPCDashboard() {
  const [selectedParameter, setSelectedParameter] = useState<SPCParameter | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [measurementValues, setMeasurementValues] = useState<string[]>(['', '', '', '', '']);
  const [newParam, setNewParam] = useState({
    name: '', measurement_type: 'dimensional', unit: 'mm', target_value: 0,
    upper_spec_limit: 0, lower_spec_limit: 0, sample_size: 5, frequency_minutes: 60, product_name: ''
  });

  const { data: parameters, isLoading: loadingParams } = useSPCParameters();
  const { data: measurements } = useSPCMeasurements(selectedParameter?.id || null, 50);
  const { data: alerts } = useSPCAlerts(true);
  const { createParameter, addMeasurement, acknowledgeAlert, calculateControlLimits } = useSPCMutations();

  const chartData = useMemo(() => {
    if (!measurements || !selectedParameter) return [];
    return [...measurements].reverse().map((m) => ({
      sample: m.sample_number, mean: m.mean_value, range: m.range_value,
      ucl: selectedParameter.upper_control_limit, lcl: selectedParameter.lower_control_limit,
      usl: selectedParameter.upper_spec_limit, lsl: selectedParameter.lower_spec_limit,
      target: selectedParameter.target_value, inControl: m.is_in_control
    }));
  }, [measurements, selectedParameter]);

  const capability = useMemo(() => {
    if (!measurements || !selectedParameter) return null;
    return calculateCapabilityIndices(measurements, selectedParameter.upper_spec_limit, selectedParameter.lower_spec_limit);
  }, [measurements, selectedParameter]);

  const stats = {
    total: parameters?.length || 0,
    active: parameters?.filter(p => p.is_active).length || 0,
    alertCount: alerts?.length || 0,
    inControl: measurements?.filter(m => m.is_in_control).length || 0,
    outOfControl: measurements?.filter(m => !m.is_in_control).length || 0
  };

  const handleCreateParameter = () => {
    createParameter.mutate(newParam, {
      onSuccess: () => {
        setShowCreateModal(false);
        setNewParam({ name: '', measurement_type: 'dimensional', unit: 'mm', target_value: 0, upper_spec_limit: 0, lower_spec_limit: 0, sample_size: 5, frequency_minutes: 60, product_name: '' });
      }
    });
  };

  const handleAddMeasurement = () => {
    if (!selectedParameter) return;
    const values = measurementValues.map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (values.length < 2) return;
    addMeasurement.mutate({ parameter_id: selectedParameter.id, values }, {
      onSuccess: () => { setShowMeasurementModal(false); setMeasurementValues(['', '', '', '', '']); }
    });
  };

  return (
    <MainLayout>
      <Helmet><title>SPC - Controle Estatístico | Sistema de Produção</title></Helmet>
      <div className="space-y-6">
        <Breadcrumbs />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Activity className="h-8 w-8" />Controle Estatístico de Processo</h1>
            <p className="text-muted-foreground">Gráficos de controle X-barra, R e análise de capacidade</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}><Plus className="h-4 w-4 mr-2" />Novo Parâmetro</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Target className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">Parâmetros</p><p className="text-2xl font-bold">{stats.total}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><CheckCircle className="h-5 w-5 text-green-500" /></div><div><p className="text-sm text-muted-foreground">Em Controle</p><p className="text-2xl font-bold">{stats.inControl}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-red-500/10"><AlertTriangle className="h-5 w-5 text-red-500" /></div><div><p className="text-sm text-muted-foreground">Fora de Controle</p><p className="text-2xl font-bold">{stats.outOfControl}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/10"><TrendingUp className="h-5 w-5 text-yellow-500" /></div><div><p className="text-sm text-muted-foreground">Cpk Médio</p><p className="text-2xl font-bold">{capability?.cpk?.toFixed(2) || '-'}</p></div></div></CardContent></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Parâmetros</CardTitle></CardHeader>
            <CardContent>
              {loadingParams ? <p className="text-muted-foreground">Carregando...</p> : parameters && parameters.length > 0 ? (
                <div className="space-y-2">
                  {parameters.map(param => (
                    <div key={param.id} className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedParameter?.id === param.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`} onClick={() => setSelectedParameter(param)}>
                      <div className="flex items-center justify-between">
                        <div><p className="font-medium">{param.name}</p><p className="text-sm text-muted-foreground">{param.target_value} {param.unit} (±{((param.upper_spec_limit - param.lower_spec_limit) / 2).toFixed(3)})</p></div>
                        <Badge variant={param.is_active ? 'default' : 'secondary'}>{param.is_active ? 'Ativo' : 'Inativo'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-center text-muted-foreground py-8">Nenhum parâmetro</p>}
            </CardContent>
          </Card>
          <SPCControlChart selectedParameter={selectedParameter} chartData={chartData} capability={capability} onCalculateLimits={() => selectedParameter && calculateControlLimits.mutate(selectedParameter.id)} onShowMeasurement={() => setShowMeasurementModal(true)} isCalculating={calculateControlLimits.isPending} />
        </div>

        {alerts && alerts.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500" />Alertas SPC Ativos</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Parâmetro</TableHead><TableHead>Tipo</TableHead><TableHead>Descrição</TableHead><TableHead>Data</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {alerts.slice(0, 10).map(alert => (
                    <TableRow key={alert.id}>
                      <TableCell>{alert.parameter?.name || '-'}</TableCell>
                      <TableCell><Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>{alert.alert_type}</Badge></TableCell>
                      <TableCell>{alert.description}</TableCell>
                      <TableCell>{format(new Date(alert.created_at), 'dd/MM HH:mm')}</TableCell>
                      <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => acknowledgeAlert.mutate({ id: alert.id })}>Reconhecer</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <SPCCreateParameterModal open={showCreateModal} onOpenChange={setShowCreateModal} newParam={newParam} onParamChange={setNewParam} onSubmit={handleCreateParameter} isPending={createParameter.isPending} />

      <Dialog open={showMeasurementModal} onOpenChange={setShowMeasurementModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Medição</DialogTitle><DialogDescription>{selectedParameter?.name} - Insira os valores da amostra</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {measurementValues.map((val, idx) => (
                <div key={idx} className="space-y-1">
                  <Label className="text-xs">#{idx + 1}</Label>
                  <Input type="number" step="0.001" value={val} onChange={(e) => { const newVals = [...measurementValues]; newVals[idx] = e.target.value; setMeasurementValues(newVals); }} />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMeasurementModal(false)}>Cancelar</Button>
              <Button onClick={handleAddMeasurement} disabled={addMeasurement.isPending}>Registrar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
