import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLogistics, DbShipment } from '@/hooks/useLogistics';
import { Truck, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface EditShipmentModalProps {
  shipment: DbShipment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditShipmentModal({ shipment, open, onOpenChange }: EditShipmentModalProps) {
  const { providers, updateShipment } = useLogistics();
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [trackingCode, setTrackingCode] = useState('');
  const [destination, setDestination] = useState('');
  const [status, setStatus] = useState<DbShipment['status']>('pending');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  useEffect(() => {
    if (shipment) {
      setSelectedProviderId(shipment.provider_id || '');
      setTrackingCode(shipment.tracking_code || '');
      setDestination(shipment.destination || '');
      setStatus(shipment.status);
      setEstimatedDelivery(shipment.estimated_delivery ? shipment.estimated_delivery.split('T')[0] : '');
    }
  }, [shipment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment) return;

    updateShipment.mutate({
      id: shipment.id,
      data: {
        provider_id: selectedProviderId || null,
        tracking_code: trackingCode,
        destination: destination,
        status: status,
        estimated_delivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : null,
        actual_delivery: status === 'delivered' ? new Date().toISOString() : shipment.actual_delivery
      }
    }, {
      onSuccess: () => onOpenChange(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Editar Envio
          </DialogTitle>
          <DialogDescription>
            Atualize as informações de transporte e rastreio para este pedido.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="p-3 bg-muted/30 rounded-lg border border-border/50 mb-4">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Pedido Relacionado</p>
            <p className="font-bold text-sm">
              OS {shipment?.job?.order_number} - {shipment?.job?.client}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status do Envio</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_transit">Em Trânsito</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                  <SelectItem value="returned">Devolvido</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transportadora</Label>
              <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.data?.map(provider => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracking-edit">Código de Rastreio</Label>
            <Input 
              id="tracking-edit" 
              value={trackingCode} 
              onChange={(e) => setTrackingCode(e.target.value)} 
              placeholder="Ex: LOG-123456"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dest-edit">Destino / Endereço</Label>
            <Input 
              id="dest-edit" 
              value={destination} 
              onChange={(e) => setDestination(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery-date">Previsão de Entrega</Label>
            <Input 
              id="delivery-date" 
              type="date"
              value={estimatedDelivery} 
              onChange={(e) => setEstimatedDelivery(e.target.value)} 
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 gradient-primary" disabled={updateShipment.isPending}>
              {updateShipment.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
