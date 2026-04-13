import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Info, Layers } from 'lucide-react';

export function ModalUsageGuide() {
  return (
    <Card className="card-interactive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary" />Guia de Uso</CardTitle>
        <CardDescription>Quando usar cada tipo de modal</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <h4 className="font-semibold flex items-center gap-2"><Layers className="h-4 w-4 text-primary" />Dialog</h4>
            <p className="text-sm text-muted-foreground">Use para formulários curtos, confirmações e conteúdo que requer atenção focada. Ideal para ações que não precisam de muito espaço.</p>
          </div>
          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <h4 className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />Alert Dialog</h4>
            <p className="text-sm text-muted-foreground">Use para ações destrutivas ou irreversíveis que precisam de confirmação explícita do usuário antes de prosseguir.</p>
          </div>
          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <h4 className="font-semibold flex items-center gap-2"><Layers className="h-4 w-4 text-secondary" />Sheet</h4>
            <p className="text-sm text-muted-foreground">Use para formulários longos, configurações, navegação secundária ou conteúdo que precisa de mais espaço vertical.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
