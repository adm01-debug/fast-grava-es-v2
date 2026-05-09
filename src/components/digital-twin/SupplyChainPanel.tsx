import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Truck, Package, AlertCircle, CheckCircle2, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export function SupplyChainPanel() {
  const providers = [
    { name: 'Global Ink Co.', status: 'in-transit', eta: '4h', location: 'SP-101', alert: false },
    { name: 'Screen Master Ltd.', status: 'processing', eta: '12h', location: 'Distribution Center', alert: true },
    { name: 'Solvent Tech', status: 'delivered', eta: '0h', location: 'Factory Gate', alert: false },
  ];

  return (
    <Card className="glass-card border-primary/20 bg-primary/5 overflow-hidden">
      <CardHeader className="py-3 border-b border-primary/20 bg-primary/10">
        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
          <Globe className="h-4 w-4 animate-spin-slow" />
          Suprimentos Autônomos (SCM IA)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-primary/10">
          {providers.map((provider, i) => (
            <div key={i} className="p-3 flex items-start gap-3 hover:bg-primary/5 transition-colors">
              <div className="mt-1 p-1.5 rounded-lg bg-background border border-primary/10 text-primary">
                <Truck className="h-3 w-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black uppercase truncate">{provider.name}</span>
                  <Badge variant="outline" className="text-[8px] h-4 py-0 border-primary/30">
                    ETA: {provider.eta}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Package className="h-2.5 w-2.5" /> {provider.location}
                  </span>
                  {provider.alert && (
                    <span className="flex items-center gap-1 text-destructive font-bold animate-pulse">
                      <AlertCircle className="h-2.5 w-2.5" /> ATRASO
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 bg-emerald-500/10 border-t border-primary/10">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                 <span className="text-[9px] font-black text-emerald-600 uppercase">Reserva Inteligente: OK</span>
              </div>
              <span className="text-[9px] font-bold text-muted-foreground">
                <TrendingDown className="h-3 w-3 inline mr-1" />
                -8% Custo Frete
              </span>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}