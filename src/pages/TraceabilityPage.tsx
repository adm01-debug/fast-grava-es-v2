import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Package,
  Search,
  Plus,
  Eye,
  GitBranch,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Layers,
  FileText,
  ClipboardCheck,
  Command
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FavoriteButton, FavoritesDropdown } from '@/components/navigation/FavoritesManager';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProductionLots, useTraceabilityMutations, ProductionLot } from '@/hooks/useTraceability';
import { useJobs } from '@/hooks/useJobs';
import LotDetailsModal from '@/components/traceability/LotDetailsModal';
import LotGenealogyView from '@/components/traceability/LotGenealogyView';
import { VoiceButton } from '@/components/voice/VoiceCommands';

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Ativo', variant: 'default' },
  consumed: { label: 'Consumido', variant: 'secondary' },
  expired: { label: 'Expirado', variant: 'destructive' },
  quarantine: { label: 'Quarentena', variant: 'outline' },
  blocked: { label: 'Bloqueado', variant: 'destructive' }
};

export default function TraceabilityPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState<ProductionLot | null>(null);
  const [showGenealogyView, setShowGenealogyView] = useState(false);
  const [newLot, setNewLot] = useState({
    lot_number: '',
    product_name: '',
    quantity: 0,
    job_id: '',
    production_date: format(new Date(), 'yyyy-MM-dd'),
    expiration_date: '',
    notes: ''
  });

  const { data: lots, isLoading } = useProductionLots();
  const { data: jobs } = useJobs();
  const { createLot } = useTraceabilityMutations();

  const filteredLots = lots?.filter(lot => {
    const matchesSearch = 
      lot.lot_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lot.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const stats = {
    total: lots?.length || 0,
    active: lots?.filter(l => l.status === 'active').length || 0,
    quarantine: lots?.filter(l => l.status === 'quarantine').length || 0,
    blocked: lots?.filter(l => l.status === 'blocked').length || 0
  };

  const generateLotNumber = () => {
    const date = format(new Date(), 'yyyyMMdd');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LOT-${date}-${random}`;
  };

  const handleCreateLot = () => {
    if (!newLot.lot_number || !newLot.product_name || newLot.quantity <= 0) {
      return;
    }
    createLot.mutate({
      ...newLot,
      job_id: newLot.job_id || undefined,
      expiration_date: newLot.expiration_date || undefined,
      notes: newLot.notes || undefined
    }, {
      onSuccess: () => {
        setShowCreateModal(false);
        setNewLot({
          lot_number: '',
          product_name: '',
          quantity: 0,
          job_id: '',
          production_date: format(new Date(), 'yyyy-MM-dd'),
          expiration_date: '',
          notes: ''
        });
      }
    });
  };

  return (
    <MainLayout>
      <Helmet>
        <title>Rastreabilidade | Sistema de Produção</title>
      </Helmet>

      <div className="space-y-6">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Package className="h-8 w-8" />
                Rastreabilidade de Produtos
              </h1>
              <FavoriteButton 
                path="/traceability" 
                name="Rastreabilidade" 
              />
            </div>
            <p className="text-muted-foreground">
              Genealogia, lotes e movimentações de produtos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <VoiceButton />
            <FavoritesDropdown onNavigate={(url) => navigate(url)} />
            <Badge variant="outline" className="gap-1 text-xs hidden sm:flex">
              <Command className="h-3 w-3" />K para buscar
            </Badge>
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
                <DialogDescription>
                  Registre um novo lote de produção
                </DialogDescription>
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
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-8"
                    onClick={() => setNewLot(prev => ({ ...prev, lot_number: generateLotNumber() }))}
                  >
                    Gerar
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Nome do Produto *</Label>
                  <Input
                    value={newLot.product_name}
                    onChange={(e) => setNewLot(prev => ({ ...prev, product_name: e.target.value }))}
                    placeholder="Nome do produto"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantidade *</Label>
                    <Input
                      type="number"
                      value={newLot.quantity}
                      onChange={(e) => setNewLot(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Produção</Label>
                    <Input
                      type="date"
                      value={newLot.production_date}
                      onChange={(e) => setNewLot(prev => ({ ...prev, production_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Job Relacionado (opcional)</Label>
                  <Select
                    value={newLot.job_id}
                    onValueChange={(v) => setNewLot(prev => ({ ...prev, job_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um job" />
                    </SelectTrigger>
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
                  <Input
                    type="date"
                    value={newLot.expiration_date}
                    onChange={(e) => setNewLot(prev => ({ ...prev, expiration_date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={newLot.notes}
                    onChange={(e) => setNewLot(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Observações sobre o lote..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateLot} disabled={createLot.isPending}>
                    Criar Lote
                  </Button>
                </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Lotes</p>
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
                  <p className="text-sm text-muted-foreground">Lotes Ativos</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Em Quarentena</p>
                  <p className="text-2xl font-bold">{stats.quarantine}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bloqueados</p>
                  <p className="text-2xl font-bold">{stats.blocked}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Lotes de Produção
                </CardTitle>
                <CardDescription>
                  Gerencie e rastreie todos os lotes de produção
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar lotes..."
                    className="pl-10 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filteredLots.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lote</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Produção</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLots.map((lot) => (
                    <TableRow key={lot.id}>
                      <TableCell className="font-mono font-medium">
                        {lot.lot_number}
                      </TableCell>
                      <TableCell>{lot.product_name}</TableCell>
                      <TableCell>
                        {lot.produced_quantity} / {lot.quantity}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_CONFIG[lot.status]?.variant || 'default'}>
                          {STATUS_CONFIG[lot.status]?.label || lot.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(lot.production_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {lot.job?.order_number || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedLot(lot)}
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedLot(lot);
                              setShowGenealogyView(true);
                            }}
                            title="Ver genealogia"
                          >
                            <GitBranch className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg">Nenhum lote encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Crie o primeiro lote de produção para começar o rastreamento
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Lote
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lot Details Modal */}
      {selectedLot && !showGenealogyView && (
        <LotDetailsModal
          lot={selectedLot}
          open={!!selectedLot}
          onClose={() => setSelectedLot(null)}
        />
      )}

      {/* Genealogy View Modal */}
      {selectedLot && showGenealogyView && (
        <LotGenealogyView
          lot={selectedLot}
          open={showGenealogyView}
          onClose={() => {
            setShowGenealogyView(false);
            setSelectedLot(null);
          }}
        />
      )}
    </MainLayout>
  );
}
