import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { Layers, Loader2 } from 'lucide-react';

export function PageLoadingSection() {
  return (
    <Card className="card-interactive card-shine">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-primary" />Loading de Página</CardTitle>
        <CardDescription>Padrões para carregamento de página inteira</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg p-8 bg-background/50">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-6 w-6 text-primary animate-spin" style={{ animationDirection: 'reverse' }} /></div>
            </div>
            <div className="space-y-2 text-center"><p className="font-medium">Carregando dados...</p><p className="text-sm text-muted-foreground">Isso pode levar alguns segundos</p></div>
          </div>
        </div>
        <div className="border rounded-lg p-6 bg-background/50 space-y-3">
          <div className="h-4 bg-muted rounded-full w-3/4 animate-pulse" />
          <div className="h-4 bg-muted rounded-full w-1/2 animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="h-4 bg-muted rounded-full w-5/6 animate-pulse" style={{ animationDelay: '300ms' }} />
          <div className="h-4 bg-muted rounded-full w-2/3 animate-pulse" style={{ animationDelay: '450ms' }} />
        </div>
        <div className="space-y-4 pt-4 border-t">
          <CodeBlock label="Page Loading" code={`<div className="flex flex-col items-center justify-center space-y-4">
  <div className="relative">
    <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
  </div>
  <p className="font-medium">Carregando dados...</p>
</div>

{/* Skeleton Pattern */}
<div className="space-y-3">
  <div className="h-4 bg-muted rounded-full w-3/4 animate-pulse" />
  <div className="h-4 bg-muted rounded-full w-1/2 animate-pulse" />
</div>`} />
        </div>
      </CardContent>
    </Card>
  );
}
