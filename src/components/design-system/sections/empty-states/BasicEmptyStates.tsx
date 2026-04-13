import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { Package, Search } from 'lucide-react';

export function BasicEmptyStates() {
  return (
    <Card className="card-interactive card-shine">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" />Estados Vazios Básicos</CardTitle>
        <CardDescription>Padrões para quando não há dados a exibir</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-8 bg-background/50 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center"><Package className="h-8 w-8 text-muted-foreground" /></div>
            <div className="space-y-1"><h3 className="font-medium">Nenhum item encontrado</h3><p className="text-sm text-muted-foreground">Não há itens para exibir no momento.</p></div>
          </div>
          <div className="border rounded-lg p-8 bg-background/50 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center"><Search className="h-8 w-8 text-muted-foreground" /></div>
            <div className="space-y-1"><h3 className="font-medium">Nenhum resultado</h3><p className="text-sm text-muted-foreground">Sua busca não retornou resultados. Tente outros termos.</p></div>
          </div>
        </div>
        <div className="space-y-3 pt-4 border-t border-border">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CodeBlock code={`<div className="border rounded-lg p-8 bg-background/50 flex flex-col items-center justify-center text-center space-y-4">
  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
    <Package className="h-8 w-8 text-muted-foreground" />
  </div>
  <div className="space-y-1">
    <h3 className="font-medium">Nenhum item</h3>
    <p className="text-sm text-muted-foreground">Não há itens para exibir.</p>
  </div>
</div>`} label="Sem Dados (Básico)" />
            <CodeBlock code={`<div className="border rounded-lg p-8 bg-background/50 flex flex-col items-center justify-center text-center space-y-4">
  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
    <Search className="h-8 w-8 text-muted-foreground" />
  </div>
  <div className="space-y-1">
    <h3 className="font-medium">Nenhum resultado</h3>
    <p className="text-sm text-muted-foreground">Tente outros termos.</p>
  </div>
</div>`} label="Sem Resultados de Busca" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
