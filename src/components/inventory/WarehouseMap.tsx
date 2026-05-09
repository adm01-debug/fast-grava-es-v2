import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Box, MapPin, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface WarehouseMapProps {
  items: any[];
}

export function WarehouseMap({ items }: WarehouseMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Group items by location prefix (e.g., A1, A2 -> Area A)
  const areas = ['A', 'B', 'C', 'D'];
  const levels = [1, 2, 3, 4];

  const getItemsAt = (area: string, level: number) => {
    return items.filter(item => item.location === `${area}${level}`);
  };

  const handleTransfer = (location: string) => {
    const locationItems = items.filter(item => item.location === location);
    if (locationItems.length === 0) return;
    setSelectedLocation(location);
    setIsTransferring(true);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-sm font-display flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Mapa do Almoxarifado (WMS)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          {areas.map(area => (
            <div key={area} className="space-y-4">
              <div className="text-center font-black text-xs text-muted-foreground uppercase border-b border-border/50 pb-1">
                Corredor {area}
              </div>
              <div className="grid grid-rows-4 gap-2">
                {levels.map(level => {
                  const locationItems = getItemsAt(area, level);
                  const isLow = locationItems.some(item => item.current_stock <= item.min_stock_level);
                  
                  return (
                    <TooltipProvider key={`${area}${level}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={cn(
                            "h-12 border rounded-md flex items-center justify-center transition-all cursor-help relative group",
                            locationItems.length > 0 ? "bg-primary/5 border-primary/20" : "bg-muted/10 border-border/30 opacity-50",
                            isLow && "bg-destructive/10 border-destructive/30"
                          )}>
                            <span className="text-[10px] font-black opacity-20 group-hover:opacity-100 transition-opacity">
                              {area}{level}
                            </span>
                            {locationItems.length > 0 && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Box className={cn(
                                  "h-4 w-4",
                                  isLow ? "text-destructive animate-pulse" : "text-primary/60"
                                )} />
                                <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[8px]">
                                  {locationItems.length}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <div className="space-y-1">
                            <p className="font-bold text-[10px] uppercase">Posição {area}{level}</p>
                            {locationItems.length > 0 ? (
                              locationItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between gap-4 text-[10px]">
                                  <span>{item.name}</span>
                                  <span className={cn("font-bold", item.current_stock <= item.min_stock_level ? "text-destructive" : "text-emerald-500")}>
                                    {item.current_stock} {item.unit}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] italic text-muted-foreground">Vazio</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center gap-6 text-[10px] font-medium uppercase text-muted-foreground">
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-primary/10 border border-primary/20" /> Ocupado</div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-destructive/10 border border-destructive/30" /> Estoque Baixo</div>
          <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded bg-muted/10 border border-border/30" /> Vazio</div>
        </div>
      </CardContent>

      <Dialog open={isTransferring} onOpenChange={setIsTransferring}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferência de Localização: {selectedLocation}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs font-bold uppercase mb-2">Itens nesta posição:</p>
              {items.filter(i => i.location === selectedLocation).map(i => (
                <div key={i.id} className="text-xs flex justify-between py-1 border-b border-border/30 last:border-0">
                  <span>{i.name}</span>
                  <span className="font-mono">{i.current_stock} {i.unit}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Nova Localização (Ex: A2, B4)</Label>
              <Input 
                placeholder="Ex: A2" 
                value={newLocation} 
                onChange={(e) => setNewLocation(e.target.value.toUpperCase())}
                maxLength={2}
              />
            </div>
            <Button className="w-full gap-2" onClick={() => {
              toast.info(`Iniciando transferência de ${selectedLocation} para ${newLocation}`);
              setIsTransferring(false);
              setNewLocation('');
            }}>
              <Move className="h-4 w-4" />
              Confirmar Transferência
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
