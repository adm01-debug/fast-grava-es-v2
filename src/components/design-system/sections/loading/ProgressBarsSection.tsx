import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CodeBlock } from '@/components/ui/code-block';
import { Activity } from 'lucide-react';

export function ProgressBarsSection() {
  const [progress, setProgress] = useState(0);

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <Card className="card-interactive card-shine">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Progress Bars</CardTitle>
        <CardDescription>Barras de progresso estáticas e animadas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Valores Estáticos</h4>
          <div className="space-y-3 max-w-md">
            {[{ v: 0, l: 'Início' }, { v: 25, l: 'Processando' }, { v: 50, l: 'Metade' }, { v: 75, l: 'Quase lá' }, { v: 100, l: 'Completo' }].map(p => (
              <div key={p.v} className="space-y-1">
                <div className="flex justify-between text-xs"><span>{p.v}%</span><span className="text-muted-foreground">{p.l}</span></div>
                <Progress value={p.v} />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Progresso Animado</h4>
          <div className="space-y-3 max-w-md">
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span>{progress}%</span><span className="text-muted-foreground">{progress === 0 ? 'Aguardando' : progress < 100 ? 'Em progresso' : 'Completo!'}</span></div>
              <Progress value={progress} className="transition-all duration-200" />
              <Button size="sm" onClick={simulateProgress} disabled={progress > 0 && progress < 100}>{progress === 100 ? 'Reiniciar' : 'Iniciar Progresso'}</Button>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Indeterminado</h4>
          <div className="max-w-md space-y-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-primary rounded-full" style={{ animation: 'shimmer 1.5s infinite', background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)' }} />
            </div>
            <p className="text-xs text-muted-foreground">Para operações sem tempo definido</p>
          </div>
        </div>
        <div className="space-y-4 pt-4 border-t">
          <CodeBlock label="Progress Bars" code={`<Progress value={50} />
<Progress value={75} variant="xp" />
<Progress value={50} variant="success" />`} />
        </div>
      </CardContent>
    </Card>
  );
}
