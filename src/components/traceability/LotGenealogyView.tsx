import { GitBranch, ArrowRight, ArrowLeft, Package, Layers } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductionLot, LotComponent, useLotGenealogy } from '@/hooks/useTraceability';

interface GenealogyChildItem extends LotComponent {
  lot?: ProductionLot;
}
import { format } from 'date-fns';

interface LotGenealogyViewProps {
  lot: ProductionLot;
  open: boolean;
  onClose: () => void;
}

export default function LotGenealogyView({ lot, open, onClose }: LotGenealogyViewProps) {
  const { data: genealogy, isLoading } = useLotGenealogy(lot.id);

  const parents = genealogy?.parents?.filter((p: LotComponent) => p.component_lot) || [];
  const children = genealogy?.children || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Genealogia do Lote
          </DialogTitle>
          <DialogDescription>
            Rastreabilidade completa: componentes utilizados e produtos derivados
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : (
          <div className="space-y-8">
            {/* Parents - Components used */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <ArrowLeft className="h-4 w-4 text-blue-500" />
                Origem (Componentes Utilizados)
              </h3>
              {parents.length > 0 ? (
                <div className="grid gap-3">
                  {parents.map((item: LotComponent) => (
                    <Card key={item.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-mono text-sm">{item.component_lot?.lot_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.component_lot?.product_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{item.quantity_used} {item.unit}</p>
                            <Badge variant="outline" className="text-xs">
                              {item.component_lot?.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-6 text-center text-muted-foreground">
                    <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum lote rastreável como componente</p>
                    <p className="text-xs">Componentes manuais podem ter sido adicionados</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Current Lot */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md border-2 border-primary bg-primary/5">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-primary/20">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-mono font-bold">{lot.lot_number}</p>
                      <p className="text-sm">{lot.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {lot.produced_quantity}/{lot.quantity} un • {format(new Date(lot.production_date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <Badge>{lot.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Children - Where this lot is used */}
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <ArrowRight className="h-4 w-4 text-green-500" />
                Destino (Utilizado Em)
              </h3>
              {children.length > 0 ? (
                <div className="grid gap-3">
                  {children.map((item: LotComponent) => (
                    <Card key={item.id} className="border-l-4 border-l-green-500">
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-mono text-sm">{item.lot?.lot_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.lot?.product_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{item.quantity_used} {item.unit}</p>
                            <Badge variant="outline" className="text-xs">
                              {item.lot?.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-6 text-center text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Este lote ainda não foi utilizado em outros produtos</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Summary */}
            <Card className="bg-muted/50">
              <CardContent className="py-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-500">{parents.length}</p>
                    <p className="text-xs text-muted-foreground">Lotes de Origem</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{lot.produced_quantity}</p>
                    <p className="text-xs text-muted-foreground">Produzido</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-500">{children.length}</p>
                    <p className="text-xs text-muted-foreground">Lotes Derivados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
