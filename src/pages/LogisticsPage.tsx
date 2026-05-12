import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Truck, 
  Package, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Filter,
  MoreVertical
} from 'lucide-react';
import { useLogistics } from '@/hooks/useLogistics';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { CreateShipmentModal } from '@/components/logistics/CreateShipmentModal';

const statusMap = {
  pending: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: Clock },
  in_transit: { label: 'Em Trânsito', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Truck },
  delivered: { label: 'Entregue', color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: CheckCircle2 },
  returned: { label: 'Devolvido', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: RotateCcw },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: AlertTriangle },
};

import { RotateCcw } from 'lucide-react';

export default function LogisticsPage() {
  const { shipments } = useLogistics();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isLoading = shipments.isLoading;

  const filteredShipments = shipments.data?.filter(s => 
    s.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.job?.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.job?.client?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold flex items-center gap-2">
              <Truck className="h-8 w-8 text-primary" />
              Gestão de Logística
            </h1>
            <p className="text-muted-foreground mt-1">Acompanhe e gerencie todos os envios e fretes.</p>
          </div>
          <Button className="gradient-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Envio
          </Button>
        </div>

        <CreateShipmentModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Em Trânsito</p>
                  <p className="text-2xl font-black mt-1">
                    {shipments.data?.filter(s => s.status === 'in_transit').length || 0}
                  </p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Truck className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-black mt-1">
                    {shipments.data?.filter(s => s.status === 'pending').length || 0}
                  </p>
                </div>
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Entregues (Hoje)</p>
                  <p className="text-2xl font-black mt-1">0</p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Alertas</p>
                  <p className="text-2xl font-black mt-1">0</p>
                </div>
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card border-none bg-muted/30">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por OS, Cliente ou Rastreio..." 
                className="pl-10 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Shipments List */}
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
          ) : filteredShipments?.length === 0 ? (
            <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">Nenhum envio encontrado.</p>
            </div>
          ) : (
            filteredShipments?.map((shipment) => {
              const StatusIcon = statusMap[shipment.status].icon;
              return (
                <Card key={shipment.id} className="glass-card hover:border-primary/30 transition-all group overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center p-4 gap-4">
                    {/* Status Column */}
                    <div className="flex items-center gap-4 md:w-48 shrink-0">
                      <div className={cn("p-2 rounded-xl", statusMap[shipment.status].color)}>
                        <StatusIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <Badge variant="outline" className={cn("font-bold text-[10px] uppercase", statusMap[shipment.status].color)}>
                          {statusMap[shipment.status].label}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-1 font-bold">
                          {shipment.tracking_code || 'S/ RASTREIO'}
                        </p>
                      </div>
                    </div>

                    {/* Job Info Column */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/20 text-primary border-primary/30 font-black">
                          OS {shipment.job?.order_number}
                        </Badge>
                        <h3 className="font-bold truncate">{shipment.job?.client}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {shipment.job?.product}
                      </p>
                    </div>

                    {/* Logistics Detail Column */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Transportadora</p>
                        <p className="font-bold text-sm">{shipment.provider?.name || 'Não definida'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Previsão</p>
                        <p className="font-bold text-sm">
                          {shipment.estimated_delivery ? format(new Date(shipment.estimated_delivery), 'dd/MM/yy', { locale: ptBR }) : '---'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="group-hover:text-primary">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Editar Envio</DropdownMenuItem>
                            <DropdownMenuItem>Copiar Link de Rastreio</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Cancelar Envio</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  {/* Progress bar mock */}
                  <div className="h-1 bg-muted">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000",
                        shipment.status === 'delivered' ? 'w-full bg-green-500' : 
                        shipment.status === 'in_transit' ? 'w-1/2 bg-blue-500' : 'w-5 bg-yellow-500'
                      )} 
                    />
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </MainLayout>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
