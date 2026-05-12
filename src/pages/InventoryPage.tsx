import { useState, useMemo, useRef } from 'react';
import { useRBAC, PermissionGate } from '@/hooks/useRBAC';
import { subDays, isAfter, parseISO, addDays } from 'date-fns';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  History, 
  AlertTriangle,
  Search,
  Filter,
  ArrowLeftRight,
  Map,
  Boxes,
  QrCode,
  TrendingDown,
  Timer,
  Printer,
  X,
  FileDown
} from 'lucide-react';
import { useInventory, useInventoryMovements, InventoryItem } from '@/hooks/useInventory';
import { WarehouseMap } from '@/components/inventory/WarehouseMap';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { QRCodeSVG } from 'qrcode.react';


export default function InventoryPage() {
  const { items, isLoading, recordMovement, stats, transferItems, deleteMovement } = useInventory();
  const { hasPermission } = useRBAC();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.specification?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = items.filter(item => item.current_stock <= item.min_stock_level);

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              Gestão de Materiais
            </h1>
            <p className="text-muted-foreground mt-1">Inventory Intelligence & Controle de Insumos</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="gap-2">
               <QrCode className="h-4 w-4" />
               Escanear QR
             </Button>
             <Button className="gap-2">
               <Plus className="h-4 w-4" />
               Novo Item
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card hover:shadow-glow-primary transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-[10px]">TOTAL</Badge>
              </div>
              <p className="text-3xl font-bold">{items.length}</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-tighter">Itens em Catálogo</p>
            </CardContent>
          </Card>

          <Card className={cn("glass-card border-red-500/20", lowStockItems.length > 0 && "bg-red-500/5 shadow-glow-destructive")}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                {lowStockItems.length > 0 && <Badge variant="destructive" className="animate-pulse">CRÍTICO</Badge>}
              </div>
              <p className="text-3xl font-bold text-red-500">{lowStockItems.length}</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-tighter">Estoque Baixo</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ArrowLeftRight className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <p className="text-3xl font-bold">{stats?.movementsCount24h || 0}</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-tighter">Movimentações (24h)</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <p className="text-3xl font-bold">R$ {((stats?.inventoryValue || 0) / 1000).toFixed(1)}k</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-tighter">Valor em Estoque</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="inventory" className="gap-2">
              <Package className="h-4 w-4" />
              Estoque Atual
            </TabsTrigger>
            <TabsTrigger value="wms" className="gap-2">
              <Map className="h-4 w-4" />
              Mapa WMS
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar material por nome, especificação ou localização..." 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  <SelectItem value="ink">Tintas</SelectItem>
                  <SelectItem value="screen">Telas</SelectItem>
                  <SelectItem value="solvent">Solventes</SelectItem>
                  <SelectItem value="consumable">Consumíveis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                [1,2,3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
              ) : filteredItems.map((item) => (
                <InventoryCard key={item.id} item={item} onMovement={recordMovement} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="wms" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2">
                  <WarehouseMap items={items} />
               </div>
               <div className="space-y-6">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-sm font-display flex items-center gap-2">
                        <Boxes className="h-4 w-4 text-primary" />
                        Sugestões de Re-alocação
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <p className="text-xs font-bold uppercase mb-1">Otimização de Fluxo</p>
                          <p className="text-[11px] text-muted-foreground">
                            O material "Tinta Azul" tem alto giro. Sugere-se mover de B4 para A1 para facilitar o picking.
                          </p>
                       </div>
                       <Button variant="outline" size="sm" className="w-full text-[10px] font-bold uppercase" onClick={() => toast.success("AI analisando padrões de consumo...")}>
                          Ver Todas Sugestões (AI)
                       </Button>
                    </CardContent>
                  </Card>
               </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="glass-card">
              <CardContent className="p-0">
                <InventoryHistoryTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

function InventoryCard({ item, onMovement }: { item: InventoryItem, onMovement: any }) {
  const isLowStock = item.current_stock <= item.min_stock_level;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState('1');

  const handleRecord = async () => {
    if (movementType === 'OUT' && Number(quantity) > item.current_stock) {
      toast.error('Saldo insuficiente para realizar a saída');
      return;
    }

    await onMovement({
      item_id: item.id,
      type: movementType,
      quantity: Number(quantity),
      reason: movementType === 'IN' ? 'Reposição' : 'Saída para produção',
    });
    setIsModalOpen(false);
  };

  const depletionDate = useMemo(() => {
    if (!item.days_of_supply) return null;
    return addDays(new Date(), item.days_of_supply);
  }, [item.days_of_supply]);

  return (
    <Card className={cn(
      "glass-card hover:border-primary/30 transition-all overflow-hidden hover:shadow-glow-primary group",
      isLowStock && "border-red-500/30"
    )}>
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="text-[9px] uppercase font-black border-primary/20">
            {item.category}
          </Badge>
          <div className="flex gap-1">
            {item.location && (
              <Badge variant="secondary" className="text-[9px] font-black h-5 flex items-center gap-1">
                <Map className="h-2 w-2" /> {item.location}
              </Badge>
            )}
            {isLowStock && (
              <Badge variant="destructive" className="text-[9px] font-black h-5 animate-pulse">ESTOQUE BAIXO</Badge>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{item.name}</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setIsQRModalOpen(true)}>
            <QrCode className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1">{item.specification || 'Sem especificação'}</p>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Saldo Atual</p>
            <p className="text-3xl font-black text-foreground">
              {item.current_stock} <span className="text-sm font-bold text-muted-foreground uppercase">{item.unit}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Previsão AI</p>
            {item.days_of_supply !== undefined ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                      "flex items-center gap-1 text-xs font-bold",
                      item.days_of_supply < 7 ? "text-primary" : "text-emerald-500"
                    )}>
                      <Timer className="h-3 w-3" />
                      {item.days_of_supply} dias
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-[10px]">Esgotamento previsto para:</p>
                    <p className="font-bold">{depletionDate ? format(depletionDate, "dd 'de' MMMM", { locale: ptBR }) : '---'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <p className="text-xs font-bold text-muted-foreground">Calculando...</p>
            )}
          </div>
        </div>

        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all",
              isLowStock ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-primary shadow-glow-primary"
            )} 
            style={{ width: `${Math.min(100, (item.current_stock / (item.min_stock_level * 3)) * 100)}%` }}
          />
        </div>

        <div className="flex gap-2">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/50" onClick={() => setMovementType('IN')}>
                <ArrowUpRight className="h-3 w-3" /> Entrada
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Registrar Movimentação: {item.name}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={movementType} onValueChange={(v: any) => setMovementType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN">Entrada (Reposição)</SelectItem>
                      <SelectItem value="OUT">Saída (Consumo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantidade ({item.unit})</Label>
                  <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleRecord} className="w-full">Confirmar Movimentação</Button>
            </DialogContent>
          </Dialog>

          <PermissionGate permission="inventory:adjust">
            <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50" onClick={() => { setMovementType('OUT'); setIsModalOpen(true); }}>
              <ArrowDownRight className="h-3 w-3" /> Saída
            </Button>
          </PermissionGate>
        </div>
      </CardContent>

      <QRLabelModal 
        open={isQRModalOpen} 
        onOpenChange={setIsQRModalOpen} 
        item={item} 
      />
    </Card>
  );
}

function QRLabelModal({ open, onOpenChange, item }: { open: boolean, onOpenChange: (o: boolean) => void, item: InventoryItem }) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write('<html><head><title>Imprimir Etiqueta</title>');
    win.document.write('<style>body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; } .label { border: 2px solid #000; padding: 20px; text-align: center; width: 300px; }</style>');
    win.document.write('</head><body>');
    win.document.write('<div class="label">');
    win.document.write(printContent.innerHTML);
    win.document.write('</div>');
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Gerar Etiqueta QR</DialogTitle>
          <DialogDescription>
            Etiqueta oficial para identificação de materiais e rastreabilidade via scanner.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div ref={printRef} className="p-6 bg-white rounded-xl border-2 border-black flex flex-col items-center">
            <p className="text-[10px] font-black uppercase tracking-tighter mb-2 text-black">Propriedade: INDÚSTRIA 4.0</p>
            <QRCodeSVG 
              value={JSON.stringify({ id: item.id, type: 'inventory', name: item.name })}
              size={180}
              level="H"
              includeMargin={true}
            />
            <div className="mt-4 text-center">
              <p className="text-lg font-black text-black leading-none uppercase">{item.name}</p>
              <p className="text-[10px] text-black/60 font-bold mt-1">ID: {item.id.substring(0, 8).toUpperCase()}</p>
              <p className="text-[9px] font-black bg-black text-white px-2 py-0.5 rounded mt-2 inline-block">
                LOC: {item.location || 'N/A'}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="w-full gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Imprimir Etiqueta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function InventoryHistoryTable() {
  const [dateFilter, setDateFilter] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { data: movements, isLoading } = useInventoryMovements();
  const { deleteMovement } = useInventory();
  const [rollbackId, setRollbackId] = useState<string | null>(null);

  const filteredMovements = useMemo(() => {
    if (!movements) return [];
    let result = [...movements];

    if (typeFilter !== 'all') {
      result = result.filter(m => m.type === typeFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      let cutoff = new Date();
      if (dateFilter === '24h') cutoff = subDays(now, 1);
      if (dateFilter === '7d') cutoff = subDays(now, 7);
      if (dateFilter === '30d') cutoff = subDays(now, 30);
      result = result.filter(m => isAfter(parseISO(m.created_at || ''), cutoff));
    }

    return result;
  }, [movements, typeFilter, dateFilter]);

  const handleExportCSV = () => {
    import('@/hooks/utils/inventoryExport').then(module => {
      module.exportInventoryMovementsToCSV(filteredMovements);
    });
  };

  const confirmRollback = async () => {
    if (!rollbackId) return;
    try {
      await deleteMovement(rollbackId);
      setRollbackId(null);
    } catch (error) {
      // Handled by hook
    }
  };

  if (isLoading) return <div className="p-8 text-center"><Skeleton className="h-20 w-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-4 items-end bg-muted/20">
        <div className="space-y-1 flex-1">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Período</Label>
          <Select value={dateFilter} onValueChange={(v: any) => setDateFilter(v)}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o histórico</SelectItem>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 flex-1">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Operação</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="IN">Entradas</SelectItem>
              <SelectItem value="OUT">Saídas</SelectItem>
              <SelectItem value="TRANSFER">Transferências</SelectItem>
              <SelectItem value="ADJUST">Ajustes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" className="gap-2 h-10 px-4 font-bold border-emerald-500/20 text-emerald-600 hover:bg-emerald-50" onClick={handleExportCSV}>
          <FileDown className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/30 border-b border-border/50">
              <th className="text-left p-4 font-black uppercase tracking-tighter text-muted-foreground">Data/Hora</th>
              <th className="text-left p-4 font-black uppercase tracking-tighter text-muted-foreground">Item</th>
              <th className="text-left p-4 font-black uppercase tracking-tighter text-muted-foreground">Operação</th>
              <th className="text-center p-4 font-black uppercase tracking-tighter text-muted-foreground">Qtd</th>
              <th className="text-left p-4 font-black uppercase tracking-tighter text-muted-foreground">Motivo/Local</th>
              <th className="text-left p-4 font-black uppercase tracking-tighter text-muted-foreground">Usuário</th>
              <th className="text-right p-4 font-black uppercase tracking-tighter text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filteredMovements.map((m: any) => (
              <tr key={m.id} className="hover:bg-muted/10 transition-colors group">
                <td className="p-4 font-mono text-muted-foreground">
                  {format(parseISO(m.created_at), 'dd/MM/yy HH:mm')}
                </td>
                <td className="p-4 font-bold text-foreground">
                  {m.inventory_items?.name}
                </td>
                <td className="p-4">
                  <Badge variant="outline" className={cn(
                    "text-[9px] font-black uppercase tracking-tighter",
                    m.type === 'IN' ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" :
                    m.type === 'OUT' ? "text-red-500 border-red-500/20 bg-red-500/5" :
                    m.type === 'TRANSFER' ? "text-blue-500 border-blue-500/20 bg-blue-500/5" :
                    "text-amber-500 border-amber-500/20 bg-amber-500/5"
                  )}>
                    {m.type}
                  </Badge>
                </td>
                <td className="p-4 text-center font-black">
                  {m.quantity}
                </td>
                <td className="p-4 text-muted-foreground max-w-[200px] truncate">
                  {m.type === 'TRANSFER' ? `${m.from_location} → ${m.to_location}` : (m.reason || '-')}
                </td>
                <td className="p-4 font-medium italic">
                  {m.profiles?.display_name || 'Sistema'}
                </td>
                <td className="p-4 text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setRollbackId(m.id)}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!rollbackId} onOpenChange={(o) => !o && setRollbackId(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Rollback
            </DialogTitle>
            <DialogDescription>
              Esta ação irá desfazer a movimentação selecionada e reajustar o saldo do estoque automaticamente. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setRollbackId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmRollback}>Sim, Desfazer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

        <Button variant="outline" className="gap-2" onClick={handleExportCSV} disabled={filteredMovements.length === 0}>
          <Filter className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border/50">
              <th className="text-left p-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Data/Hora</th>
              <th className="text-left p-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Item</th>
              <th className="text-left p-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Tipo</th>
              <th className="text-right p-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Qtd</th>
              <th className="text-left p-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Usuário</th>
              <th className="text-left p-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Origem/Destino</th>
              <th className="text-center p-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filteredMovements.map((m: any) => (

            <tr key={m.id} className="hover:bg-muted/10 transition-colors group">
              <td className="p-4 text-xs font-medium">
                {format(new Date(m.created_at || ''), "dd/MM/yy HH:mm", { locale: ptBR })}
              </td>
              <td className="p-4 font-bold">
                {m.inventory_items?.name}
              </td>
              <td className="p-4">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[9px] font-black uppercase",
                    m.type === 'IN' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                    m.type === 'OUT' ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                    m.type === 'TRANSFER' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                    "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  )}
                >
                  {m.type === 'IN' ? 'Entrada' : m.type === 'OUT' ? 'Saída' : m.type === 'TRANSFER' ? 'Transf.' : 'Ajuste'}
                </Badge>
              </td>
              <td className={cn(
                "p-4 text-right font-black",
                m.type === 'IN' ? "text-emerald-500" : m.type === 'OUT' ? "text-red-500" : "text-blue-500"
              )}>
                {m.type === 'IN' ? '+' : m.type === 'OUT' ? '-' : ''}{m.quantity || (m.type === 'TRANSFER' ? '→' : '')}
              </td>
              <td className="p-4 text-xs text-muted-foreground">
                {m.profiles?.display_name || 'Sistema'}
              </td>
              <td className="p-4 text-xs text-muted-foreground">
                <div className="flex flex-col">
                  <span className="italic">{m.reason || '-'}</span>
                  {m.type === 'TRANSFER' && (
                    <span className="text-[10px] font-bold text-primary mt-1">
                      {m.from_location} → {m.to_location}
                    </span>
                  )}
                </div>
              </td>
              <td className="p-4 text-center">
                {m.type !== 'ADJUST' && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                    onClick={() => handleRollback(m)}
                    title="Desfazer Movimentação"
                  >
                    <TrendingDown className="h-4 w-4 rotate-180" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
          {(!filteredMovements || filteredMovements.length === 0) && (
            <tr>
              <td colSpan={7} className="p-8 text-center text-muted-foreground italic">Nenhuma movimentação registrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

      <Dialog open={!!rollbackId} onOpenChange={(open) => !open && setRollbackId(null)}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-red-500" />
              Desfazer Movimentação
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este registro e reverter o impacto no sistema? 
              O saldo do estoque será ajustado automaticamente para refletir a reversão desta operação.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setRollbackId(null)}>Cancelar</Button>
            <Button variant="destructive" className="flex-1" onClick={confirmRollback}>Confirmar Rollback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
