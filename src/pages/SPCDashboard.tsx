import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { format } from 'date-fns';
import {
  Activity,
  Plus,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Target,
  BarChart2,
  Settings,
  Eye
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Bar
} from 'recharts';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import {
  useSPCParameters,
  useSPCMeasurements,
  useSPCAlerts,
  useSPCMutations,
  calculateCapabilityIndices,
  SPCParameter
} from '@/hooks/useSPC';

const MEASUREMENT_TYPES = [
  { value: 'dimensional', label: 'Dimensional' },
  { value: 'weight', label: 'Peso' },
  { value: 'temperature', label: 'Temperatura' },
  { value: 'pressure', label: 'Pressão' },
  { value: 'visual', label: 'Visual' }
];

export default function SPCDashboard() {
  const [selectedParameter, setSelectedParameter] = useState<SPCParameter | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [measurementValues, setMeasurementValues] = useState<string[]>(['', '', '', '', '']);
  const [newParam, setNewParam] = useState({
    name: '',
    measurement_type: 'dimensional',
    unit: 'mm',
    target_value: 0,
    upper_spec_limit: 0,
    lower_spec_limit: 0,
    sample_size: 5,
    frequency_minutes: 60,
    product_name: ''
  });

  const { data: parameters, isLoading: loadingParams } = useSPCParameters();
  const { data: measurements } = useSPCMeasurements(selectedParameter?.id || null, 50);
  const { data: alerts } = useSPCAlerts(true);
  const { createParameter, addMeasurement, acknowledgeAlert, calculateControlLimits } = useSPCMutations();

  const chartData = useMemo(() => {
    if (!measurements || !selectedParameter) return [];
    return [...measurements].reverse().map((m, idx) => ({
      sample: m.sample_number,
      mean: m.mean_value,
      range: m.range_value,
      ucl: selectedParameter.upper_control_limit,
      lcl: selectedParameter.lower_control_limit,
      usl: selectedParameter.upper_spec_limit,
      lsl: selectedParameter.lower_spec_limit,
      target: selectedParameter.target_value,
      inControl: m.is_in_control
    }));
  }, [measurements, selectedParameter]);

  const capability = useMemo(() => {
    if (!measurements || !selectedParameter) return null;
    return calculateCapabilityIndices(
      measurements,
      selectedParameter.upper_spec_limit,
      selectedParameter.lower_spec_limit
    );
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
        setNewParam({
          name: '',
          measurement_type: 'dimensional',
          unit: 'mm',
          target_value: 0,
          upper_spec_limit: 0,
          lower_spec_limit: 0,
          sample_size: 5,
          frequency_minutes: 60,
          product_name: ''
        });
      }
    });
  };

  const handleAddMeasurement = () => {
    if (!selectedParameter) return;
    const values = measurementValues.map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (values.length < 2) return;

    addMeasurement.mutate({
      parameter_id: selectedParameter.id,
      values
    }, {
      onSuccess: () => {
        setShowMeasurementModal(false);
        setMeasurementValues(['', '', '', '', '']);
      }
    });
  };

  return (
    <MainLayout>
      <Helmet>
        <title>SPC - Controle Estatístico | Sistema de Produção</title>
      </Helmet>

      <div className="space-y-6">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Activity className="h-8 w-8" />
              Controle Estatístico de Processo
            </h1>
            <p className="text-muted-foreground">
              Gráficos de controle X-barra, R e análise de capacidade
            </p>
          </div>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Parâmetro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Novo Parâmetro de Controle</DialogTitle>
                <DialogDescription>
                  Configure um novo parâmetro para monitoramento SPC
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome *</Label>
                    <Input
                      value={newParam.name}
                      onChange={(e) => setNewParam(p => ({ ...p, name: e.target.value }))}
                      placeholder="Ex: Diâmetro Externo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Medição</Label>
                    <Select
                      value={newParam.measurement_type}
                      onValueChange={(v) => setNewParam(p => ({ ...p, measurement_type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEASUREMENT_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Valor Alvo *</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={newParam.target_value}
                      onChange={(e) => setNewParam(p => ({ ...p, target_value: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>LSL *</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={newParam.lower_spec_limit}
                      onChange={(e) => setNewParam(p => ({ ...p, lower_spec_limit: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>USL *</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={newParam.upper_spec_limit}
                      onChange={(e) => setNewParam(p => ({ ...p, upper_spec_limit: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Input
                      value={newParam.unit}
                      onChange={(e) => setNewParam(p => ({ ...p, unit: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tamanho Amostra</Label>
                    <Input
                      type="number"
                      value={newParam.sample_size}
                      onChange={(e) => setNewParam(p => ({ ...p, sample_size: parseInt(e.target.value) || 5 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequência (min)</Label>
                    <Input
                      type="number"
                      value={newParam.frequency_minutes}
                      onChange={(e) => setNewParam(p => ({ ...p, frequency_minutes: parseInt(e.target.value) || 60 }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
                  <Button onClick={handleCreateParameter} disabled={createParameter.isPending}>Criar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Parâmetros</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Em Controle</p>
                  <p className="text-2xl font-bold">{stats.inControl}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fora de Controle</p>
                  <p className="text-2xl font-bold">{stats.outOfControl}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <TrendingUp className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cpk Médio</p>
                  <p className="text-2xl font-bold">{capability?.cpk?.toFixed(2) || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Parameters List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Parâmetros
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingParams ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : parameters && parameters.length > 0 ? (
                <div className="space-y-2">
                  {parameters.map(param => (
                    <div
                      key={param.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedParameter?.id === param.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedParameter(param)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{param.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {param.target_value} {param.unit} (±{((param.upper_spec_limit - param.lower_spec_limit) / 2).toFixed(3)})
                          </p>
                        </div>
                        <Badge variant={param.is_active ? 'default' : 'secondary'}>
                          {param.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhum parâmetro</p>
              )}
            </CardContent>
          </Card>

          {/* Charts */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5" />
                    Gráfico de Controle X-barra
                  </CardTitle>
                  <CardDescription>
                    {selectedParameter?.name || 'Selecione um parâmetro'}
                  </CardDescription>
                </div>
                {selectedParameter && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => calculateControlLimits.mutate(selectedParameter.id)}
                      disabled={calculateControlLimits.isPending}
                    >
                      Calcular Limites
                    </Button>
                    <Button size="sm" onClick={() => setShowMeasurementModal(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Medir
                    </Button>
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
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))'
                        }}
                      />
                      {selectedParameter.upper_control_limit && (
                        <ReferenceLine 
                          y={selectedParameter.upper_control_limit} 
                          stroke="#ef4444" 
                          strokeDasharray="5 5"
                          label={{ value: 'UCL', position: 'right', fontSize: 10 }}
                        />
                      )}
                      {selectedParameter.lower_control_limit && (
                        <ReferenceLine 
                          y={selectedParameter.lower_control_limit} 
                          stroke="#ef4444" 
                          strokeDasharray="5 5"
                          label={{ value: 'LCL', position: 'right', fontSize: 10 }}
                        />
                      )}
                      <ReferenceLine 
                        y={selectedParameter.target_value} 
                        stroke="#22c55e" 
                        strokeDasharray="3 3"
                        label={{ value: 'Target', position: 'right', fontSize: 10 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="mean"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={(props: { cx: number; cy: number; payload: { inControl: boolean } }) => {
                          const { cx, cy, payload } = props;
                          return (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={4}
                              fill={payload.inControl ? 'hsl(var(--primary))' : '#ef4444'}
                              stroke={payload.inControl ? 'hsl(var(--primary))' : '#ef4444'}
                            />
                          );
                        }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>

                  {/* Capability Indices */}
                  {capability && (
                    <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Cp</p>
                        <p className={`text-xl font-bold ${capability.cp >= 1.33 ? 'text-green-500' : capability.cp >= 1 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {capability.cp.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Cpk</p>
                        <p className={`text-xl font-bold ${capability.cpk >= 1.33 ? 'text-green-500' : capability.cpk >= 1 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {capability.cpk.toFixed(2)}
                        </p>
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
        </div>

        {/* Alerts */}
        {alerts && alerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Alertas SPC Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parâmetro</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.slice(0, 10).map(alert => (
                    <TableRow key={alert.id}>
                      <TableCell>{alert.parameter?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.alert_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{alert.description}</TableCell>
                      <TableCell>{format(new Date(alert.created_at), 'dd/MM HH:mm')}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeAlert.mutate({ id: alert.id })}
                        >
                          Reconhecer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Measurement Modal */}
      <Dialog open={showMeasurementModal} onOpenChange={setShowMeasurementModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Medição</DialogTitle>
            <DialogDescription>
              {selectedParameter?.name} - Insira os valores da amostra
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {measurementValues.map((val, idx) => (
                <div key={idx} className="space-y-1">
                  <Label className="text-xs">#{idx + 1}</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={val}
                    onChange={(e) => {
                      const newVals = [...measurementValues];
                      newVals[idx] = e.target.value;
                      setMeasurementValues(newVals);
                    }}
                  />
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
