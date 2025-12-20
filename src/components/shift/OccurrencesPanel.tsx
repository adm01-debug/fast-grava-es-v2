import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { 
  AlertTriangle, 
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  Wrench,
  Shield,
  Package,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useShiftOccurrences, useShiftHandoverMutations, ShiftOccurrence } from '@/hooks/useShiftHandover';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const OCCURRENCE_TYPES: Record<string, { label: string; icon: typeof AlertTriangle; color: string }> = {
  incident: { label: 'Incidente', icon: AlertTriangle, color: 'text-red-500' },
  maintenance: { label: 'Manutenção', icon: Wrench, color: 'text-blue-500' },
  quality: { label: 'Qualidade', icon: CheckCircle2, color: 'text-green-500' },
  safety: { label: 'Segurança', icon: Shield, color: 'text-amber-500' },
  production: { label: 'Produção', icon: Package, color: 'text-purple-500' },
  other: { label: 'Outro', icon: FileText, color: 'text-slate-500' }
};

const SEVERITY_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  info: { label: 'Info', variant: 'secondary' },
  warning: { label: 'Atenção', variant: 'outline' },
  error: { label: 'Erro', variant: 'default' },
  critical: { label: 'Crítico', variant: 'destructive' }
};

export default function OccurrencesPanel() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [machineFilter, setMachineFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState<ShiftOccurrence | null>(null);
  const [resolution, setResolution] = useState('');

  // New occurrence form state
  const [newOccurrence, setNewOccurrence] = useState({
    occurrence_type: 'incident' as ShiftOccurrence['occurrence_type'],
    severity: 'warning' as ShiftOccurrence['severity'],
    title: '',
    description: '',
    machine_id: ''
  });

  const { data: machines } = useQuery({
    queryKey: ['machines-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: openHandovers } = useQuery({
    queryKey: ['open-handovers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shift_handovers')
        .select('id')
        .eq('status', 'open')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
  });

  const startDate = format(subDays(new Date(), parseInt(dateRange)), 'yyyy-MM-dd');
  
  const { data: occurrences, isLoading } = useShiftOccurrences(undefined, {
    machineId: machineFilter !== 'all' ? machineFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    startDate
  });

  const { addOccurrence, resolveOccurrence } = useShiftHandoverMutations();

  const filteredOccurrences = occurrences?.filter(occ => {
    if (severityFilter !== 'all' && occ.severity !== severityFilter) return false;
    return true;
  });

  const stats = {
    total: occurrences?.length || 0,
    open: occurrences?.filter(o => !o.resolved_at).length || 0,
    critical: occurrences?.filter(o => o.severity === 'critical' && !o.resolved_at).length || 0,
    resolved: occurrences?.filter(o => o.resolved_at).length || 0
  };

  const handleAddOccurrence = async () => {
    if (!newOccurrence.title.trim() || !newOccurrence.description.trim()) return;

    await addOccurrence.mutateAsync({
      handover_id: openHandovers?.id || '',
      occurrence_type: newOccurrence.occurrence_type,
      severity: newOccurrence.severity,
      title: newOccurrence.title.trim(),
      description: newOccurrence.description.trim(),
      machine_id: newOccurrence.machine_id || null,
      job_id: null,
      occurred_at: new Date().toISOString(),
      resolution: null,
      photos: []
    });

    setShowAddModal(false);
    setNewOccurrence({
      occurrence_type: 'incident',
      severity: 'warning',
      title: '',
      description: '',
      machine_id: ''
    });
  };

  const handleResolve = async () => {
    if (!showResolveModal || !resolution.trim()) return;

    await resolveOccurrence.mutateAsync({
      id: showResolveModal.id,
      resolution: resolution.trim()
    });

    setShowResolveModal(null);
    setResolution('');
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{stats.open}</p>
                <p className="text-xs text-muted-foreground">Abertas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{stats.critical}</p>
                <p className="text-xs text-muted-foreground">Críticas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-xs text-muted-foreground">Resolvidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Último dia</SelectItem>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {Object.entries(OCCURRENCE_TYPES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={machineFilter} onValueChange={setMachineFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Máquina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {machines?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Ocorrência
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Ocorrência</DialogTitle>
                  <DialogDescription>
                    Registre uma nova ocorrência do turno atual
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select 
                        value={newOccurrence.occurrence_type}
                        onValueChange={(v) => setNewOccurrence(prev => ({ 
                          ...prev, 
                          occurrence_type: v as ShiftOccurrence['occurrence_type']
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(OCCURRENCE_TYPES).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Severidade</Label>
                      <Select 
                        value={newOccurrence.severity}
                        onValueChange={(v) => setNewOccurrence(prev => ({ 
                          ...prev, 
                          severity: v as ShiftOccurrence['severity']
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(SEVERITY_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Máquina (opcional)</Label>
                    <Select 
                      value={newOccurrence.machine_id}
                      onValueChange={(v) => setNewOccurrence(prev => ({ ...prev, machine_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a máquina" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhuma</SelectItem>
                        {machines?.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      value={newOccurrence.title}
                      onChange={(e) => setNewOccurrence(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Breve descrição da ocorrência"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição detalhada</Label>
                    <Textarea
                      value={newOccurrence.description}
                      onChange={(e) => setNewOccurrence(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva em detalhes o que aconteceu..."
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddModal(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleAddOccurrence}
                      disabled={!newOccurrence.title.trim() || !newOccurrence.description.trim() || addOccurrence.isPending}
                    >
                      Registrar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Occurrences List */}
      <Card>
        <CardHeader>
          <CardTitle>Ocorrências</CardTitle>
          <CardDescription>
            Histórico de ocorrências registradas durante as passagens de turno
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredOccurrences && filteredOccurrences.length > 0 ? (
            <div className="space-y-3">
              {filteredOccurrences.map((occ) => {
                const typeConfig = OCCURRENCE_TYPES[occ.occurrence_type];
                const TypeIcon = typeConfig?.icon || AlertTriangle;
                
                return (
                  <div 
                    key={occ.id}
                    className={`p-4 rounded-lg border ${
                      occ.severity === 'critical' ? 'border-destructive/50 bg-destructive/5' :
                      occ.severity === 'error' ? 'border-orange-500/50 bg-orange-500/5' :
                      occ.resolved_at ? 'bg-muted/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-background border`}>
                          <TypeIcon className={`h-5 w-5 ${typeConfig?.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium">{occ.title}</h4>
                            <Badge variant={SEVERITY_CONFIG[occ.severity]?.variant || 'default'}>
                              {SEVERITY_CONFIG[occ.severity]?.label}
                            </Badge>
                            <Badge variant="outline">
                              {typeConfig?.label}
                            </Badge>
                            {occ.resolved_at && (
                              <Badge variant="secondary" className="text-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Resolvida
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {occ.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>
                              📅 {format(new Date(occ.occurred_at), "dd/MM/yyyy 'às' HH:mm")}
                            </span>
                            {occ.machine && (
                              <span>📍 {occ.machine.name}</span>
                            )}
                          </div>
                          {occ.resolution && (
                            <div className="mt-3 p-2 bg-green-500/10 rounded text-sm">
                              <p className="text-green-600 font-medium">Resolução:</p>
                              <p>{occ.resolution}</p>
                              {occ.resolved_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Resolvida em {format(new Date(occ.resolved_at), "dd/MM/yyyy 'às' HH:mm")}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {!occ.resolved_at && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowResolveModal(occ)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Resolver
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg">Nenhuma ocorrência encontrada</h3>
              <p className="text-muted-foreground">
                Não há ocorrências para os filtros selecionados
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolve Modal */}
      <Dialog open={!!showResolveModal} onOpenChange={() => setShowResolveModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver Ocorrência</DialogTitle>
            <DialogDescription>
              {showResolveModal?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Resolução</Label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Descreva como a ocorrência foi resolvida..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowResolveModal(null)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleResolve}
                disabled={!resolution.trim() || resolveOccurrence.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar como Resolvida
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
