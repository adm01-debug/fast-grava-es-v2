import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLogistics } from '@/hooks/useLogistics';
import { useJobs } from '@/hooks/useJobs';
import { Truck } from 'lucide-react';

interface CreateShipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateShipmentModal({ open, onOpenChange }: CreateShipmentModalProps) {
  const { t } = useTranslation();
  const { providers, createShipment } = useLogistics();
  const { data: jobs } = useJobs();
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [trackingCode, setTrackingCode] = useState('');
  const [destination, setDestination] = useState('');
  const [freightCost, setFreightCost] = useState('0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createShipment.mutate({
      job_id: selectedJobId || null,
      provider_id: selectedProviderId || null,
      tracking_code: trackingCode,
      destination: destination,
      freight_cost: parseFloat(freightCost) || 0,
      status: 'pending'
    }, {
      onSuccess: () => onOpenChange(false)
    });
  };

  const availableJobs = jobs?.filter(j => j.status === 'finished' && !j.shipment_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            {t('logistics.newShipment')}
          </DialogTitle>
          <DialogDescription>
            {t('logistics.description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label>{t('jobs.title')}</Label>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger>
                <SelectValue placeholder={t('common.search')} />
              </SelectTrigger>
              <SelectContent>
                {availableJobs?.map(job => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.order_number} - {job.client}
                  </SelectItem>
                ))}
                {availableJobs?.length === 0 && (
                  <SelectItem value="none" disabled>{t('common.none')}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('logistics.provider')}</Label>
            <Select value={selectedProviderId} onValueChange={setSelectedProviderId}>
              <SelectTrigger>
                <SelectValue placeholder={t('common.search')} />
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

          <div className="space-y-2">
            <Label htmlFor="tracking">{t('logistics.trackingCode')} ({t('common.optional')})</Label>
            <Input 
              id="tracking" 
              value={trackingCode} 
              onChange={(e) => setTrackingCode(e.target.value)} 
              placeholder="Ex: LOG-123456"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dest">{t('logistics.destination')}</Label>
            <Input 
              id="dest" 
              value={destination} 
              onChange={(e) => setDestination(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="freight">{t('logistics.freightCost')}</Label>
            <Input 
              id="freight" 
              type="number"
              step="0.01"
              value={freightCost} 
              onChange={(e) => setFreightCost(e.target.value)} 
              placeholder="0.00"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="flex-1 gradient-primary" disabled={createShipment.isPending}>
              {createShipment.isPending ? t('common.loading') : t('logistics.newShipment')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
