import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CodeBlock } from '@/components/ui/code-block';
import { Loader2, RefreshCw, RotateCw } from 'lucide-react';

export function SpinnersSection() {
  return (
    <Card className="card-interactive card-shine">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Loader2 className="h-5 w-5 text-primary" />Spinners</CardTitle>
        <CardDescription>Indicadores de carregamento giratórios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tamanhos</h4>
          <div className="flex flex-wrap items-center gap-6">
            {[{ size: 'h-4 w-4', label: 'Small (16px)' }, { size: 'h-6 w-6', label: 'Default (24px)' }, { size: 'h-8 w-8', label: 'Large (32px)' }, { size: 'h-12 w-12', label: 'XL (48px)' }].map(s => (
              <div key={s.label} className="space-y-2 text-center">
                <Loader2 className={`${s.size} animate-spin text-primary mx-auto`} />
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cores</h4>
          <div className="flex flex-wrap items-center gap-6">
            {[{ color: 'text-primary', label: 'Primary' }, { color: 'text-success', label: 'Success' }, { color: 'text-warning', label: 'Warning' }, { color: 'text-destructive', label: 'Destructive' }, { color: 'text-info', label: 'Info' }].map(c => (
              <div key={c.label} className="space-y-2 text-center">
                <Loader2 className={`h-6 w-6 animate-spin ${c.color} mx-auto`} />
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variantes Alternativas</h4>
          <div className="flex flex-wrap items-center gap-6">
            <div className="space-y-2 text-center"><RefreshCw className="h-6 w-6 animate-spin text-primary mx-auto" /><p className="text-xs text-muted-foreground">RefreshCw</p></div>
            <div className="space-y-2 text-center"><RotateCw className="h-6 w-6 animate-spin text-primary mx-auto" /><p className="text-xs text-muted-foreground">RotateCw</p></div>
            <div className="space-y-2 text-center"><div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" /><p className="text-xs text-muted-foreground">CSS Border</p></div>
            <div className="space-y-2 text-center">
              <div className="flex gap-1 mx-auto">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-xs text-muted-foreground">Dots Bounce</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="flex gap-1 mx-auto items-end h-6">
                {[0, 150, 300, 450].map((d, i) => <div key={i} className={`h-${[6, 4, 5, 3][i]} w-1 bg-primary animate-pulse`} style={{ animationDelay: `${d}ms`, height: `${[24, 16, 20, 12][i]}px` }} />)}
              </div>
              <p className="text-xs text-muted-foreground">Bars Pulse</p>
            </div>
          </div>
        </div>
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
          <CodeBlock label="Spinners" code={`<Loader2 className="h-6 w-6 animate-spin text-primary" />
<div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
<div className="flex gap-1">
  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
</div>`} />
        </div>
      </CardContent>
    </Card>
  );
}
