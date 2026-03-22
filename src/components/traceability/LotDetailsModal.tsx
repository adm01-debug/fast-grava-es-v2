import { useState } from 'react';
import { format } from 'date-fns';
import {
  Package, Plus, CheckCircle, XCircle, AlertTriangle,
  Layers, ClipboardCheck, ArrowRightLeft
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  ProductionLot, useLotComponents, useLotMovements, useLotInspections,
  useTraceabilityMutations, useProductionLots
} from '@/hooks/useTraceability';
import { LotMovementTimeline } from './LotMovementTimeline';
import { QualityDashboardCards } from './QualityDashboardCards';
import { toast } from 'sonner';

interface LotDetailsModalProps {
  lot: ProductionLot;
  open: boolean;
  onClose: () => void;
}

const MOVEMENT_TYPES = {
  production: 'Produção',
  transfer: 'Transferência',
  consumption: 'Consumo',
  adjustment: 'Ajuste',
  return: 'Devolução',
};

const INSPECTION_RESULTS: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  approved: { label: 'Aprovado', variant: 'default' },
  rejected: { label: 'Rejeitado', variant: 'destructive' },
  conditional: { label: 'Condicional', variant: 'secondary' },
};

const STATUS_OPTIONS: Record<string, { label: string; targets: string[] }> = {
  active: { label: 'Ativo', targets: ['consumed', 'quarantine', 'blocked'] },
  quarantine: { label: 'Quarentena', targets: ['active', 'blocked'] },
  blocked: { label: 'Bloqueado', targets: ['quarantine', 'active'] },
  consumed: { label: 'Consumido', targets: [] },
  expired: { label: 'Expirado', targets: ['blocked'] },
};

export default function LotDetailsModal({ lot, open, onClose }: LotDetailsModalProps) {
  const [showAddComponent, setShowAddComponent] = useState(false);
  const [showAddMovement, setShowAddMovement] = useState(false);
  const [showAddInspection, setShowAddInspection] = useState(false);

  const [newComponent, setNewComponent] = useState({
    component_name: '', quantity_used: 0, unit: 'un',
    component_lot_id: '', supplier: '', batch_number: '', notes: ''
  });
  const [newMovement, setNewMovement] = useState({
    movement_type: 'production', quantity: 0,
    from_location: '', to_location: '', reason: ''
  });
  const [newInspection, setNewInspection] = useState({
    inspection_type: '', result: 'approved',
    inspector_name: '', sample_size: 0, defects_found: 0, notes: ''
  });

  const { data: components } = useLotComponents(lot.id);
  const { data: movements } = useLotMovements(lot.id);
  const { data: inspections } = useLotInspections(lot.id);
  const { data: allLots } = useProductionLots();
  const { addComponent, addMovement, addInspection, updateLot } = useTraceabilityMutations();

  const progressPct = lot.quantity > 0 ? (lot.produced_quantity / lot.quantity * 100) : 0;
  const statusConfig = STATUS_OPTIONS[lot.status];
  const canTransition = statusConfig?.targets?.length > 0;

  const handleStatusChange = (newStatus: string) => {
    updateLot.mutate({ id: lot.id, status: newStatus }, {
      onSuccess: () => toast.success(`Status alterado para ${STATUS_OPTIONS[newStatus]?.label || newStatus}`),
    });
  };

  const handleAddComponent = () => {
    addComponent.mutate({
      lot_id: lot.id, component_name: newComponent.component_name,
      quantity_used: newComponent.quantity_used, unit: newComponent.unit,
      component_lot_id: newComponent.component_lot_id || undefined,
      supplier: newComponent.supplier || undefined,
      batch_number: newComponent.batch_number || undefined,
      notes: newComponent.notes || undefined
    }, {
      onSuccess: () => {
        setShowAddComponent(false);
        setNewComponent({ component_name: '', quantity_used: 0, unit: 'un', component_lot_id: '', supplier: '', batch_number: '', notes: '' });
      }
    });
  };

  const handleAddMovement = () => {
    addMovement.mutate({
      lot_id: lot.id, movement_type: newMovement.movement_type,
      quantity: newMovement.quantity,
      from_location: newMovement.from_location || undefined,
      to_location: newMovement.to_location || undefined,
      reason: newMovement.reason || undefined
    }, {
      onSuccess: () => {
        setShowAddMovement(false);
        setNewMovement({ movement_type: 'production', quantity: 0, from_location: '', to_location: '', reason: '' });
      }
    });
  };

  const handleAddInspection = () => {
    addInspection.mutate({
      lot_id: lot.id, inspection_type: newInspection.inspection_type,
      result: newInspection.result,
      inspector_name: newInspection.inspector_name || undefined,
      sample_size: newInspection.sample_size || undefined,
      defects_found: newInspection.defects_found || undefined,
      notes: newInspection.notes || undefined
    }, {
      onSuccess: () => {
        setShowAddInspection(false);
        setNewInspection({ inspection_type: '', result: 'approved', inspector_name: '', sample_size: 0, defects_found: 0, notes: '' });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lote: {lot.lot_number}
          </DialogTitle>
          <DialogDescription>
            {lot.product_name} — {lot.produced_quantity}/{lot.quantity} unidades
          </DialogDescription>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-3 pb-3">
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge>{STATUS_OPTIONS[lot.status]?.label || lot.status}</Badge>
                {canTransition && (
                  <Select onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-6 w-6 p-0 border-0">
                      <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusConfig.targets.map(s => (
                        <SelectItem key={s} value={s}>
                          {STATUS_OPTIONS[s]?.label || s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 pb-3">
              <p className="text-xs text-muted-foreground">Progresso</p>
              <div className="mt-1">
                <span className="text-sm font-medium">{progressPct.toFixed(0)}%</span>
                <Progress value={progressPct} className="h-1.5 mt-1" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 pb-3">
              <p className="text-xs text-muted-foreground">Data Produção</p>
              <p className="font-medium text-sm mt-1">{format(new Date(lot.production_date), 'dd/MM/yyyy')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 pb-3">
              <p className="text-xs text-muted-foreground">Validade</p>
              <p className="font-medium text-sm mt-1">
                {lot.expiration_date ? format(new Date(lot.expiration_date), 'dd/MM/yyyy') : 'N/A'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quality Dashboard */}
        {inspections && inspections.length > 0 && (
          <QualityDashboardCards inspections={inspections} />
        )}

        <Tabs defaultValue="components">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="components">
              <Layers className="h-3.5 w-3.5 mr-1" />
              Componentes ({components?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="movements">
              <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
              Movimentações ({movements?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="inspections">
              <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
              Inspeções ({inspections?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Componentes Utilizados</h4>
              <Button size="sm" onClick={() => setShowAddComponent(true)}>
                <Plus className="h-4 w-4 mr-1" />Adicionar
              </Button>
            </div>

            {showAddComponent && (
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Componente *</Label>
                      <Input value={newComponent.component_name}
                        onChange={(e) => setNewComponent(p => ({ ...p, component_name: e.target.value }))}
                        placeholder="Ex: Tinta Azul" />
                    </div>
                    <div className="space-y-2">
                      <Label>Lote do Componente</Label>
                      <Select value={newComponent.component_lot_id}
                        onValueChange={(v) => setNewComponent(p => ({ ...p, component_lot_id: v }))}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhum</SelectItem>
                          {allLots?.filter(l => l.id !== lot.id).map(l => (
                            <SelectItem key={l.id} value={l.id}>{l.lot_number} - {l.product_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Quantidade *</Label>
                      <Input type="number" value={newComponent.quantity_used}
                        onChange={(e) => setNewComponent(p => ({ ...p, quantity_used: parseFloat(e.target.value) || 0 }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Unidade</Label>
                      <Input value={newComponent.unit}
                        onChange={(e) => setNewComponent(p => ({ ...p, unit: e.target.value }))} placeholder="un, kg, L" />
                    </div>
                    <div className="space-y-2">
                      <Label>Fornecedor</Label>
                      <Input value={newComponent.supplier}
                        onChange={(e) => setNewComponent(p => ({ ...p, supplier: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAddComponent(false)}>Cancelar</Button>
                    <Button onClick={handleAddComponent} disabled={addComponent.isPending}>Adicionar</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {components && components.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Componente</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {components.map((comp) => (
                    <TableRow key={comp.id}>
                      <TableCell>{comp.component_name}</TableCell>
                      <TableCell className="font-mono text-sm">{comp.batch_number || '-'}</TableCell>
                      <TableCell>{comp.quantity_used} {comp.unit}</TableCell>
                      <TableCell>{comp.supplier || '-'}</TableCell>
                      <TableCell>{format(new Date(comp.created_at), 'dd/MM HH:mm')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : !showAddComponent && (
              <div className="text-center py-8 text-muted-foreground">
                <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum componente registrado</p>
              </div>
            )}
          </TabsContent>

          {/* Movements Tab — Visual Timeline */}
          <TabsContent value="movements" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Histórico de Movimentações</h4>
              <Button size="sm" onClick={() => setShowAddMovement(true)}>
                <Plus className="h-4 w-4 mr-1" />Registrar
              </Button>
            </div>

            {showAddMovement && (
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo *</Label>
                      <Select value={newMovement.movement_type}
                        onValueChange={(v) => setNewMovement(p => ({ ...p, movement_type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(MOVEMENT_TYPES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Quantidade *</Label>
                      <Input type="number" value={newMovement.quantity}
                        onChange={(e) => setNewMovement(p => ({ ...p, quantity: parseInt(e.target.value) || 0 }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Origem</Label>
                      <Input value={newMovement.from_location}
                        onChange={(e) => setNewMovement(p => ({ ...p, from_location: e.target.value }))}
                        placeholder="Local de origem" />
                    </div>
                    <div className="space-y-2">
                      <Label>Destino</Label>
                      <Input value={newMovement.to_location}
                        onChange={(e) => setNewMovement(p => ({ ...p, to_location: e.target.value }))}
                        placeholder="Local de destino" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Motivo</Label>
                    <Textarea value={newMovement.reason}
                      onChange={(e) => setNewMovement(p => ({ ...p, reason: e.target.value }))} rows={2} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAddMovement(false)}>Cancelar</Button>
                    <Button onClick={handleAddMovement} disabled={addMovement.isPending}>Registrar</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <LotMovementTimeline movements={movements || []} />
          </TabsContent>

          {/* Inspections Tab */}
          <TabsContent value="inspections" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Inspeções de Qualidade</h4>
              <Button size="sm" onClick={() => setShowAddInspection(true)}>
                <Plus className="h-4 w-4 mr-1" />Nova Inspeção
              </Button>
            </div>

            {showAddInspection && (
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Inspeção *</Label>
                      <Input value={newInspection.inspection_type}
                        onChange={(e) => setNewInspection(p => ({ ...p, inspection_type: e.target.value }))}
                        placeholder="Ex: Visual, Dimensional" />
                    </div>
                    <div className="space-y-2">
                      <Label>Resultado *</Label>
                      <Select value={newInspection.result}
                        onValueChange={(v) => setNewInspection(p => ({ ...p, result: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Aprovado</SelectItem>
                          <SelectItem value="rejected">Rejeitado</SelectItem>
                          <SelectItem value="conditional">Condicional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Inspetor</Label>
                      <Input value={newInspection.inspector_name}
                        onChange={(e) => setNewInspection(p => ({ ...p, inspector_name: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Amostra</Label>
                      <Input type="number" value={newInspection.sample_size}
                        onChange={(e) => setNewInspection(p => ({ ...p, sample_size: parseInt(e.target.value) || 0 }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Defeitos</Label>
                      <Input type="number" value={newInspection.defects_found}
                        onChange={(e) => setNewInspection(p => ({ ...p, defects_found: parseInt(e.target.value) || 0 }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea value={newInspection.notes}
                      onChange={(e) => setNewInspection(p => ({ ...p, notes: e.target.value }))} rows={2} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAddInspection(false)}>Cancelar</Button>
                    <Button onClick={handleAddInspection} disabled={addInspection.isPending}>Registrar</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {inspections && inspections.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Inspetor</TableHead>
                    <TableHead>Amostra/Defeitos</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inspections.map((insp) => (
                    <TableRow key={insp.id}>
                      <TableCell>{insp.inspection_type}</TableCell>
                      <TableCell>
                        <Badge variant={INSPECTION_RESULTS[insp.result]?.variant || 'default'}>
                          {INSPECTION_RESULTS[insp.result]?.label || insp.result}
                        </Badge>
                      </TableCell>
                      <TableCell>{insp.inspector_name || '-'}</TableCell>
                      <TableCell>{insp.sample_size || 0} / {insp.defects_found}</TableCell>
                      <TableCell>{format(new Date(insp.inspected_at), 'dd/MM HH:mm')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : !showAddInspection && (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma inspeção registrada</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
