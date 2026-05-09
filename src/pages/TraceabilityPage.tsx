import { useState, useMemo, useCallback } from 'react';
import { useFuseSearch } from '@/hooks/useFuseSearch';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { format, differenceInDays } from 'date-fns';
import {
  Package, Search, Plus, Eye, GitBranch, AlertTriangle,
  FileText, Command, QrCode, Download, CheckSquare,
  ArrowUpDown, Calendar, Filter, X, Tag
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FavoriteButton, FavoritesDropdown } from '@/components/navigation/FavoritesManager';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { useProductionLots, useTraceabilityMutations, ProductionLot } from '@/hooks/useTraceability';
import { useJobs } from '@/hooks/useJobs';
import LotDetailsModal from '@/components/traceability/LotDetailsModal';
import LotGenealogyView from '@/components/traceability/LotGenealogyView';
import { TraceabilityStatsCards } from '@/components/traceability/TraceabilityStatsCards';
import { LotQRCode } from '@/components/traceability/LotQRCode';
import { LotLabelPrint } from '@/components/traceability/LotLabelPrint';
import { VoiceButton } from '@/components/voice/VoiceCommands';
import { BlockchainIntegrityCard } from '@/components/traceability/BlockchainIntegrityCard';
import { ElectronicSignatureDialog } from '@/components/traceability/ElectronicSignatureDialog';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Ativo', variant: 'default' },
  consumed: { label: 'Consumido', variant: 'secondary' },
  expired: { label: 'Expirado', variant: 'destructive' },
  quarantine: { label: 'Quarentena', variant: 'outline' },
  blocked: { label: 'Bloqueado', variant: 'destructive' },
};

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  active: ['consumed', 'quarantine', 'blocked', 'expired'],
  quarantine: ['active', 'blocked'],
  blocked: ['quarantine', 'active'],
  consumed: [],
  expired: ['blocked'],
};

type SortField = 'lot_number' | 'product_name' | 'quantity' | 'production_date' | 'status';
type SortDir = 'asc' | 'desc';

export default function TraceabilityPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState<ProductionLot | null>(null);
  const [showGenealogyView, setShowGenealogyView] = useState(false);
  const [qrLot, setQrLot] = useState<ProductionLot | null>(null);
  const [labelLots, setLabelLots] = useState<ProductionLot[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('production_date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [signatureModal, setSignatureModal] = useState<{ open: boolean; status: string }>({ open: false, status: '' });
  const [newLot, setNewLot] = useState({
    lot_number: '', product_name: '', quantity: 0, job_id: '',
    production_date: format(new Date(), 'yyyy-MM-dd'), expiration_date: '', notes: ''
  });

  const { data: lots, isLoading } = useProductionLots();
  const { data: jobs } = useJobs();
  const { createLot, updateLot } = useTraceabilityMutations();

  const fuseSearchedLots = useFuseSearch(lots || [], searchTerm, {
    keys: ['lot_number', 'product_name'],
    threshold: 0.3,
  });

  const filteredAndSortedLots = useMemo(() => {
    let result = fuseSearchedLots.filter(lot => {
      if (statusFilter !== 'all' && lot.status !== statusFilter) return false;
      if (dateFrom && lot.production_date < dateFrom) return false;
      if (dateTo && lot.production_date > dateTo) return false;
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'lot_number': cmp = a.lot_number.localeCompare(b.lot_number); break;
        case 'product_name': cmp = a.product_name.localeCompare(b.product_name); break;
        case 'quantity': cmp = a.quantity - b.quantity; break;
        case 'production_date': cmp = a.production_date.localeCompare(b.production_date); break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [fuseSearchedLots, statusFilter, dateFrom, dateTo, sortField, sortDir]);

  const generateLotNumber = () => {
    const date = format(new Date(), 'yyyyMMdd');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LOT-${date}-${random}`;
  };

  const handleCreateLot = () => {
    if (!newLot.lot_number || !newLot.product_name || newLot.quantity <= 0) return;
    createLot.mutate({
      ...newLot,
      job_id: newLot.job_id || undefined,
      expiration_date: newLot.expiration_date || undefined,
      notes: newLot.notes || undefined
    }, {
      onSuccess: () => {
        setShowCreateModal(false);
        setNewLot({
          lot_number: '', product_name: '', quantity: 0, job_id: '',
          production_date: format(new Date(), 'yyyy-MM-dd'), expiration_date: '', notes: ''
        });
      }
    });
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredAndSortedLots.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedLots.map(l => l.id)));
    }
  };

  const handleBulkStatusChange = useCallback((newStatus: string) => {
    const validLots = filteredAndSortedLots.filter(l =>
      selectedIds.has(l.id) && VALID_TRANSITIONS[l.status]?.includes(newStatus)
    );
    if (validLots.length === 0) {
      toast.error('Nenhum lote pode ser alterado para este status');
      return;
    }
    validLots.forEach(lot => {
      updateLot.mutate({ id: lot.id, status: newStatus });
    });
    toast.success(`${validLots.length} lote(s) atualizados para ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
    setSelectedIds(new Set());
  }, [filteredAndSortedLots, selectedIds, updateLot]);

  const handleExportCSV = () => {
    const headers = ['Lote', 'Produto', 'Quantidade', 'Produzido', 'Status', 'Data Produção', 'Validade', 'Job'];
    const rows = filteredAndSortedLots.map(l => [
      l.lot_number, l.product_name, l.quantity, l.produced_quantity,
      STATUS_CONFIG[l.status]?.label || l.status,
      format(new Date(l.production_date), 'dd/MM/yyyy'),
      l.expiration_date ? format(new Date(l.expiration_date), 'dd/MM/yyyy') : '',
      l.job?.order_number || ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rastreabilidade-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado com sucesso');
  };

  const getExpirationBadge = (lot: ProductionLot) => {
    if (!lot.expiration_date || lot.status !== 'active') return null;
    const daysLeft = differenceInDays(new Date(lot.expiration_date), new Date());
    if (daysLeft < 0) return <Badge variant="destructive" className="text-[10px]">Expirado</Badge>;
    if (daysLeft <= 3) return <Badge variant="destructive" className="text-[10px] animate-pulse">⚠ {daysLeft}d</Badge>;
    if (daysLeft <= 7) return <Badge variant="outline" className="text-[10px] text-orange-500 border-orange-500/30">⏰ {daysLeft}d</Badge>;
    return null;
  };

  const hasActiveFilters = statusFilter !== 'all' || dateFrom || dateTo;

  return (
    <MainLayout>
      <Helmet>
        <title>Rastreabilidade | Sistema de Produção</title>
      </Helmet>

      <div className="space-y-6">
        <Breadcrumbs />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-black tracking-tighter flex items-center gap-3">
                <Package className="h-8 w-8 text-primary animate-float" />
                Hyper-Traceability 13/10 (Blockchain IA)
              </h1>
              <FavoriteButton path="/traceability" name="Rastreabilidade" />
            </div>
            <p className="text-muted-foreground">
              Genealogia, lotes e movimentações de produtos
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <VoiceButton />
            <FavoritesDropdown onNavigate={(url) => navigate(url)} />
            <Badge variant="outline" className="gap-1 text-xs hidden sm:flex">
              <Command className="h-3 w-3" />K para buscar
            </Badge>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Lote
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Criar Novo Lote</DialogTitle>
                  <DialogDescription>Registre um novo lote de produção</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Label>Número do Lote *</Label>
                      <Input
                        value={newLot.lot_number}
                        onChange={(e) => setNewLot(prev => ({ ...prev, lot_number: e.target.value }))}
                        placeholder="LOT-20251220-XXXX"
                      />
                    </div>
                    <Button type="button" variant="outline" className="mt-8"
                      onClick={() => setNewLot(prev => ({ ...prev, lot_number: generateLotNumber() }))}>
                      Gerar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do Produto *</Label>
                    <Input value={newLot.product_name}
                      onChange={(e) => setNewLot(prev => ({ ...prev, product_name: e.target.value }))}
                      placeholder="Nome do produto" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quantidade *</Label>
                      <Input type="number" value={newLot.quantity}
                        onChange={(e) => setNewLot(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Produção</Label>
                      <Input type="date" value={newLot.production_date}
                        onChange={(e) => setNewLot(prev => ({ ...prev, production_date: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Job Relacionado (opcional)</Label>
                    <Select value={newLot.job_id} onValueChange={(v) => setNewLot(prev => ({ ...prev, job_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione um job" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {jobs?.map(job => (
                          <SelectItem key={job.id} value={job.id}>
                            {job.order_number} - {job.client}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Validade (opcional)</Label>
                    <Input type="date" value={newLot.expiration_date}
                      onChange={(e) => setNewLot(prev => ({ ...prev, expiration_date: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea value={newLot.notes}
                      onChange={(e) => setNewLot(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Observações sobre o lote..." rows={2} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
                    <Button onClick={handleCreateLot} disabled={createLot.isPending}>Criar Lote</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats & Integrity */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
             <TraceabilityStatsCards lots={lots || []} />
          </div>
          <div className="lg:col-span-1">
             <BlockchainIntegrityCard />
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="py-3 flex items-center gap-4">
              <CheckSquare className="h-5 w-5 text-primary" />
              <span className="font-medium">{selectedIds.size} lote(s) selecionado(s)</span>
              <div className="flex gap-2 ml-auto">
                <Button size="sm" variant="outline" onClick={() => {
                  const selected = filteredAndSortedLots.filter(l => selectedIds.has(l.id));
                  setLabelLots(selected);
                }}>
                  <Tag className="h-3.5 w-3.5 mr-1" />Etiquetas
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange('quarantine')}>
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" />Quarentena
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange('blocked')}>
                  Bloquear
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange('active')}>
                  Liberar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Lotes de Produção
                </CardTitle>
                <CardDescription>
                  {filteredAndSortedLots.length} de {lots?.length || 0} lotes
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar lotes..." className="pl-10 w-[200px]"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="consumed">Consumidos</SelectItem>
                    <SelectItem value="quarantine">Quarentena</SelectItem>
                    <SelectItem value="blocked">Bloqueados</SelectItem>
                    <SelectItem value="expired">Expirados</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                    className="w-[130px] text-xs" placeholder="De" />
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                    className="w-[130px] text-xs" placeholder="Até" />
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={() => { setStatusFilter('all'); setDateFrom(''); setDateTo(''); }}>
                    <Filter className="h-3.5 w-3.5 mr-1" />Limpar
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filteredAndSortedLots.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox checked={selectedIds.size === filteredAndSortedLots.length && filteredAndSortedLots.length > 0}
                          onCheckedChange={selectAll} />
                      </TableHead>
                      <SortableHead label="Lote" field="lot_number" current={sortField} dir={sortDir} onSort={toggleSort} />
                      <SortableHead label="Produto" field="product_name" current={sortField} dir={sortDir} onSort={toggleSort} />
                      <SortableHead label="Quantidade" field="quantity" current={sortField} dir={sortDir} onSort={toggleSort} />
                      <SortableHead label="Status" field="status" current={sortField} dir={sortDir} onSort={toggleSort} />
                      <SortableHead label="Data Produção" field="production_date" current={sortField} dir={sortDir} onSort={toggleSort} />
                      <TableHead>Job</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedLots.map((lot) => {
                      const progressPct = lot.quantity > 0 ? (lot.produced_quantity / lot.quantity * 100) : 0;
                      const expirationBadge = getExpirationBadge(lot);

                      return (
                        <TableRow key={lot.id} className={selectedIds.has(lot.id) ? 'bg-primary/5' : ''}>
                          <TableCell>
                            <Checkbox checked={selectedIds.has(lot.id)}
                              onCheckedChange={() => toggleSelect(lot.id)} />
                          </TableCell>
                          <TableCell className="font-mono font-medium">{lot.lot_number}</TableCell>
                          <TableCell>{lot.product_name}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <span className="text-sm">{lot.produced_quantity} / {lot.quantity}</span>
                              <Progress value={progressPct} className="h-1.5 w-20" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Badge variant={STATUS_CONFIG[lot.status]?.variant || 'default'}>
                                {STATUS_CONFIG[lot.status]?.label || lot.status}
                              </Badge>
                              {expirationBadge}
                            </div>
                          </TableCell>
                          <TableCell>{format(new Date(lot.production_date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>
                            {lot.job ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="outline" className="text-xs cursor-help">
                                      {lot.job.order_number}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{lot.job.client} — {lot.job.product}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => setSelectedLot(lot)} title="Detalhes">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => { setSelectedLot(lot); setShowGenealogyView(true); }} title="Genealogia">
                                <GitBranch className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setQrLot(lot)} title="QR Code">
                                <QrCode className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setLabelLots([lot])} title="Imprimir Etiqueta">
                                <Tag className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg">Nenhum lote encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters
                    ? 'Tente ajustar os filtros para encontrar lotes'
                    : 'Crie o primeiro lote de produção para começar o rastreamento'}
                </p>
                {!hasActiveFilters && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />Criar Primeiro Lote
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {selectedLot && !showGenealogyView && (
        <LotDetailsModal lot={selectedLot} open={!!selectedLot} onClose={() => setSelectedLot(null)} />
      )}
      {selectedLot && showGenealogyView && (
        <LotGenealogyView lot={selectedLot} open={showGenealogyView}
          onClose={() => { setShowGenealogyView(false); setSelectedLot(null); }} />
      )}
      {qrLot && (
        <LotQRCode lot={qrLot} open={!!qrLot} onClose={() => setQrLot(null)} />
      )}
      {labelLots.length > 0 && (
        <LotLabelPrint lots={labelLots} open={labelLots.length > 0} onClose={() => setLabelLots([])} />
      )}
    </MainLayout>
  );
}

function SortableHead({ label, field, current, dir, onSort }: {
  label: string; field: SortField; current: SortField; dir: SortDir;
  onSort: (f: SortField) => void;
}) {
  return (
    <TableHead>
      <Button variant="ghost" size="sm" className="h-auto p-0 font-medium hover:bg-transparent"
        onClick={() => onSort(field)}>
        {label}
        <ArrowUpDown className={`ml-1 h-3 w-3 ${current === field ? 'text-primary' : 'text-muted-foreground/50'}`} />
      </Button>
    </TableHead>
  );
}
