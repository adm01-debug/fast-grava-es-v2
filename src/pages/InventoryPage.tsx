import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ArrowLeftRight
} from 'lucide-react';
import { useInventory, useInventoryMovements, InventoryItem } from '@/hooks/useInventory';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InventoryPage() {
  const { items, isLoading, recordMovement } = useInventory();
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
             <Button className="gap-2">
               <Plus className="h-4 w-4" />
               Novo Item
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card">
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

          <Card className={cn("glass-card border-red-500/20", lowStockItems.length > 0 && "bg-red-500/5")}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                {lowStockItems.length > 0 && <Badge variant="destructive" className="animate-pulse">CRÍTICO</Badge>}
              </div>
              <p className="text-3xl font-bold text-red-500">{lowStockItems.length}</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-tighter">Itens com Estoque Baixo</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <ArrowLeftRight className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <p className="text-3xl font-bold">24</p>
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-tighter">Movimentações (24h)</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="inventory" className="gap-2">
              <Package className="h-4 w-4" />
              Estoque Atual
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Histórico de Movimentações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar material..." 
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
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState('1');

  const handleRecord = async () => {
    await onMovement({
      item_id: item.id,
      type: movementType,
      quantity: Number(quantity),
      reason: movementType === 'IN' ? 'Reposição' : 'Saída para produção',
    });
    setIsModalOpen(false);
  };

  return (
    <Card className={cn(
      "glass-card hover:border-primary/30 transition-all overflow-hidden",
      isLowStock && "border-red-500/30"
    )}>
      <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="text-[9px] uppercase font-black border-primary/20">
            {item.category}
          </Badge>
          {isLowStock && (
            <Badge variant="destructive" className="text-[9px] font-black h-5">ESTOQUE BAIXO</Badge>
          )}
        </div>
        <CardTitle className="text-lg font-bold mt-2">{item.name}</CardTitle>
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
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Mínimo</p>
            <p className="text-sm font-bold text-muted-foreground">{item.min_stock_level} {item.unit}</p>
          </div>
        </div>

        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all",
              isLowStock ? "bg-red-500" : "bg-primary"
            )} 
            style={{ width: `${Math.min(100, (item.current_stock / (item.min_stock_level * 3)) * 100)}%` }}
          />
        </div>

        <div className="flex gap-2">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5" onClick={() => setMovementType('IN')}>
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
              <Button onClick={handleRecord}>Confirmar Movimentação</Button>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5" onClick={() => { setMovementType('OUT'); setIsModalOpen(true); }}>
            <ArrowDownRight className="h-3 w-3" /> Saída
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InventoryHistoryTable() {
  const { data: movements, isLoading } = useInventoryMovements();

  if (isLoading) return <div className="p-8 text-center"><Skeleton className="h-20 w-full" /></div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/30 border-b border-border/50">
            <th className="text-left p-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Data/Hora</th>
            <th className="text-left p-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Item</th>
            <th className="text-left p-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Tipo</th>
            <th className="text-right p-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Qtd</th>
            <th className="text-left p-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Usuário</th>
            <th className="text-left p-4 font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Motivo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {movements?.map((m: any) => (
            <tr key={m.id} className="hover:bg-muted/10 transition-colors">
              <td className="p-4 text-xs font-medium">
                {format(new Date(m.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
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
                    "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  )}
                >
                  {m.type === 'IN' ? 'Entrada' : m.type === 'OUT' ? 'Saída' : 'Ajuste'}
                </Badge>
              </td>
              <td className={cn(
                "p-4 text-right font-black",
                m.type === 'IN' ? "text-emerald-500" : "text-red-500"
              )}>
                {m.type === 'IN' ? '+' : '-'}{m.quantity}
              </td>
              <td className="p-4 text-xs text-muted-foreground">
                {m.profiles?.display_name || 'Sistema'}
              </td>
              <td className="p-4 text-xs text-muted-foreground italic">
                {m.reason || '-'}
              </td>
            </tr>
          ))}
          {(!movements || movements.length === 0) && (
            <tr>
              <td colSpan={6} className="p-8 text-center text-muted-foreground italic">Nenhuma movimentação registrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
