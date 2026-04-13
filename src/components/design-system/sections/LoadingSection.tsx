import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CodeBlock } from '@/components/ui/code-block';
import { useState, useEffect } from 'react';
import { Activity, Layers, Loader2, Play, RefreshCw, RotateCw, Save, Zap } from 'lucide-react';

export function LoadingSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulateLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Spinners */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 text-primary" />
            Spinners
          </CardTitle>
          <CardDescription>Indicadores de carregamento giratórios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Spinners */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tamanhos</h4>
            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-2 text-center">
                <Loader2 className="h-4 w-4 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">Small (16px)</p>
              </div>
              <div className="space-y-2 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">Default (24px)</p>
              </div>
              <div className="space-y-2 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">Large (32px)</p>
              </div>
              <div className="space-y-2 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">XL (48px)</p>
              </div>
            </div>
          </div>

          {/* Colored Spinners */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cores</h4>
            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-2 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">Primary</p>
              </div>
              <div className="space-y-2 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-success mx-auto" />
                <p className="text-xs text-muted-foreground">Success</p>
              </div>
              <div className="space-y-2 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-warning mx-auto" />
                <p className="text-xs text-muted-foreground">Warning</p>
              </div>
              <div className="space-y-2 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-destructive mx-auto" />
                <p className="text-xs text-muted-foreground">Destructive</p>
              </div>
              <div className="space-y-2 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-info mx-auto" />
                <p className="text-xs text-muted-foreground">Info</p>
              </div>
            </div>
          </div>

          {/* Alternative Spinners */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variantes Alternativas</h4>
            <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-2 text-center">
                <RefreshCw className="h-6 w-6 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">RefreshCw</p>
              </div>
              <div className="space-y-2 text-center">
                <RotateCw className="h-6 w-6 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">RotateCw</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-muted-foreground">CSS Border</p>
              </div>
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
                  <div className="h-full w-1 bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="h-4 w-1 bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="h-5 w-1 bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
                  <div className="h-3 w-1 bg-primary animate-pulse" style={{ animationDelay: '450ms' }} />
                </div>
                <p className="text-xs text-muted-foreground">Bars Pulse</p>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Spinners"
              code={`{/* Spinner básico com Lucide */}
<Loader2 className="h-6 w-6 animate-spin text-primary" />

{/* Tamanhos */}
<Loader2 className="h-4 w-4 animate-spin" />  {/* Small */}
<Loader2 className="h-8 w-8 animate-spin" />  {/* Large */}
<Loader2 className="h-12 w-12 animate-spin" /> {/* XL */}

{/* Cores */}
<Loader2 className="animate-spin text-success" />
<Loader2 className="animate-spin text-warning" />
<Loader2 className="animate-spin text-destructive" />

{/* CSS Border Spinner */}
<div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />

{/* Dots Bounce */}
<div className="flex gap-1">
  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
</div>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Progress Bars */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Progress Bars
          </CardTitle>
          <CardDescription>Barras de progresso estáticas e animadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Static Progress */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Valores Estáticos</h4>
            <div className="space-y-3 max-w-md">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>0%</span>
                  <span className="text-muted-foreground">Início</span>
                </div>
                <Progress value={0} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>25%</span>
                  <span className="text-muted-foreground">Processando</span>
                </div>
                <Progress value={25} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>50%</span>
                  <span className="text-muted-foreground">Metade</span>
                </div>
                <Progress value={50} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>75%</span>
                  <span className="text-muted-foreground">Quase lá</span>
                </div>
                <Progress value={75} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>100%</span>
                  <span className="text-muted-foreground">Completo</span>
                </div>
                <Progress value={100} />
              </div>
            </div>
          </div>

          {/* Animated Progress */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Progresso Animado</h4>
            <div className="space-y-3 max-w-md">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>{progress}%</span>
                  <span className="text-muted-foreground">
                    {progress === 0 ? 'Aguardando' : progress < 100 ? 'Em progresso' : 'Completo!'}
                  </span>
                </div>
                <Progress value={progress} className="transition-all duration-200" />
                <Button size="sm" onClick={simulateProgress} disabled={progress > 0 && progress < 100}>
                  {progress === 100 ? 'Reiniciar' : 'Iniciar Progresso'}
                </Button>
              </div>
            </div>
          </div>

          {/* Indeterminate Progress */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Indeterminado</h4>
            <div className="max-w-md space-y-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-primary rounded-full animate-[shimmer_1.5s_infinite]" 
                  style={{ 
                    animation: 'shimmer 1.5s infinite',
                    background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)'
                  }} 
                />
              </div>
              <p className="text-xs text-muted-foreground">Para operações sem tempo definido</p>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Progress Bars"
              code={`{/* Básico */}
<Progress value={50} />

{/* Com label */}
<div className="space-y-1">
  <div className="flex justify-between text-xs">
    <span>50%</span>
    <span className="text-muted-foreground">Processando</span>
  </div>
  <Progress value={50} />
</div>

{/* Animado com estado */}
const [progress, setProgress] = useState(0);

<Progress value={progress} className="transition-all duration-200" />

{/* Variantes */}
<Progress value={75} variant="xp" />
<Progress value={50} variant="success" />
<Progress value={30} variant="warning" />
<Progress value={80} variant="destructive" />`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Button Loading States */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Estados de Loading em Botões
          </CardTitle>
          <CardDescription>Botões com indicadores de carregamento integrados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loading Button Examples */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variantes com Loading</h4>
            <div className="flex flex-wrap gap-3">
              <Button disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando...
              </Button>
              <Button variant="secondary" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando
              </Button>
              <Button variant="outline" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
                Aguarde
              </Button>
              <Button variant="gradient" disabled className="opacity-80">
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando
              </Button>
              <Button variant="destructive" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
                Excluindo
              </Button>
            </div>
          </div>

          {/* Interactive Loading Demo */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Demo Interativa</h4>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="gradient"
                onClick={simulateLoading}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Clique para simular (2s)
                  </>
                )}
              </Button>
              <Button 
                variant="gradient-success"
                onClick={simulateLoading}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Icon Only Loading */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Apenas Ícone</h4>
            <div className="flex flex-wrap gap-3">
              <Button size="icon" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
              <Button size="icon" variant="secondary" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
              <Button size="icon" variant="outline" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
              <Button size="icon" variant="ghost" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Button Loading States"
              code={`{/* Botão com loading */}
<Button disabled>
  <Loader2 className="h-4 w-4 animate-spin" />
  Carregando...
</Button>

{/* Toggle loading com estado */}
const [isLoading, setIsLoading] = useState(false);

<Button 
  disabled={isLoading}
  onClick={handleAction}
>
  {isLoading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Processando...
    </>
  ) : (
    <>
      <Save className="h-4 w-4" />
      Salvar
    </>
  )}
</Button>

{/* Icon button loading */}
<Button size="icon" disabled>
  <Loader2 className="h-4 w-4 animate-spin" />
</Button>`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Full Page Loading */}
      <Card className="card-interactive card-shine">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Loading de Página
          </CardTitle>
          <CardDescription>Padrões para carregamento de página inteira</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-8 bg-background/50">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-muted" />
                <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <div className="space-y-2 text-center">
                <p className="text-sm font-medium">Carregando dados...</p>
                <p className="text-xs text-muted-foreground">Por favor, aguarde</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Use este padrão para carregamentos que ocupam a tela inteira ou seções grandes.
          </p>

          {/* Code Examples */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Exemplos de Código</h4>
            <CodeBlock
              label="Full Page Loading"
              code={`{/* Spinner circular duplo */}
<div className="flex flex-col items-center justify-center space-y-4">
  <div className="relative">
    <div className="h-16 w-16 rounded-full border-4 border-muted" />
    <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
  </div>
  <div className="space-y-2 text-center">
    <p className="text-sm font-medium">Carregando dados...</p>
    <p className="text-xs text-muted-foreground">Por favor, aguarde</p>
  </div>
</div>

{/* Overlay de loading */}
{isLoading && (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
)}`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
