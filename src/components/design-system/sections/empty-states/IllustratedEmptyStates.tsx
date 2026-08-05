import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import { Sparkles, Wand2, WifiOff, RefreshCw } from 'lucide-react';

export function IllustratedEmptyStates() {
  return (
    <Card className="card-interactive card-shine">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Com Ilustrações Elaboradas</CardTitle>
        <CardDescription>Estados vazios com visual mais impactante</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border rounded-xl p-8 bg-gradient-to-br from-primary/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"><Wand2 className="h-12 w-12 text-primary" /></div>
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-success flex items-center justify-center"><Sparkles className="h-3 w-3 text-success-foreground" /></div>
            </div>
            <div className="space-y-2 max-w-xs"><h3 className="text-lg font-semibold">Bem-vindo ao Sistema!</h3><p className="text-sm text-muted-foreground">Estamos prontos para ajudá-lo a gerenciar sua produção de forma inteligente.</p></div>
            <div className="flex gap-2"><Button variant="gradient">Começar Agora</Button><Button variant="outline">Ver Tutorial</Button></div>
          </div>
          <div className="border rounded-xl p-8 bg-gradient-to-br from-destructive/5 to-transparent flex flex-col items-center justify-center text-center space-y-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center"><WifiOff className="h-12 w-12 text-destructive" /></div>
            <div className="space-y-2 max-w-xs"><h3 className="text-lg font-semibold">Sem Conexão</h3><p className="text-sm text-muted-foreground">Verifique sua conexão com a internet e tente novamente.</p></div>
            <Button variant="outline"><RefreshCw className="h-4 w-4" />Tentar Novamente</Button>
          </div>
        </div>
        <div className="space-y-3 pt-4 border-t border-border">
          <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
          <CodeBlock code={`<div className="border rounded-xl p-8 bg-gradient-to-br from-primary/5 to-transparent flex flex-col items-center text-center space-y-6">
  <div className="relative">
    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
      <Wand2 className="h-12 w-12 text-primary" />
    </div>
  </div>
  <div className="space-y-2 max-w-xs">
    <h3 className="text-lg font-semibold">Bem-vindo!</h3>
    <p className="text-sm text-muted-foreground">Descrição.</p>
  </div>
  <Button variant="gradient">Começar</Button>
</div>`} label="Welcome State" />
        </div>
      </CardContent>
    </Card>
  );
}
