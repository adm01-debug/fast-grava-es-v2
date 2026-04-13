import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CodeBlock } from '@/components/ui/code-block';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Layers, TrendingUp, DollarSign, Package, Activity, Users, Target, Gauge, Coins, Trophy, Sparkles } from 'lucide-react';

export function CardsSection() {
  return (
    <>
            {/* Card Variants Section */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Variantes de Card
                </CardTitle>
                <CardDescription>
                  O componente Card agora suporta variantes via prop: <code className="text-primary">variant="..."</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Default */}
                  <Card variant="default">
                    <CardHeader>
                      <CardTitle className="text-lg">Default</CardTitle>
                      <CardDescription>Variante padrão com sombra sutil</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">variant="default"</code>
                    </CardContent>
                  </Card>

                  {/* Elevated */}
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle className="text-lg">Elevated</CardTitle>
                      <CardDescription>Maior elevação e profundidade</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">variant="elevated"</code>
                    </CardContent>
                  </Card>

                  {/* Interactive */}
                  <Card variant="interactive">
                    <CardHeader>
                      <CardTitle className="text-lg">Interactive</CardTitle>
                      <CardDescription>Hover com lift e glow (clicável)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">variant="interactive"</code>
                    </CardContent>
                  </Card>

                  {/* Glass */}
                  <Card variant="glass">
                    <CardHeader>
                      <CardTitle className="text-lg">Glass</CardTitle>
                      <CardDescription>Glassmorphism com blur</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">variant="glass"</code>
                    </CardContent>
                  </Card>

                  {/* Ghost */}
                  <Card variant="ghost">
                    <CardHeader>
                      <CardTitle className="text-lg">Ghost</CardTitle>
                      <CardDescription>Transparente, aparece no hover</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">variant="ghost"</code>
                    </CardContent>
                  </Card>

                  {/* Outline */}
                  <Card variant="outline">
                    <CardHeader>
                      <CardTitle className="text-lg">Outline</CardTitle>
                      <CardDescription>Apenas borda, sem preenchimento</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">variant="outline"</code>
                    </CardContent>
                  </Card>

                  {/* Stat */}
                  <Card variant="stat">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        Stat
                      </CardTitle>
                      <CardDescription>Para dashboards e KPIs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">1,234</div>
                      <code className="text-xs text-primary mt-2 block">variant="stat"</code>
                    </CardContent>
                  </Card>

                  {/* Premium */}
                  <Card variant="premium">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Coins className="h-4 w-4 text-amber-500" />
                        Premium
                      </CardTitle>
                      <CardDescription>Destaque especial com acento dourado</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">variant="premium"</code>
                    </CardContent>
                  </Card>
                </div>

                {/* Code Examples for Card Variants */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <CodeBlock 
                      code={'<Card variant="default">\n  <CardHeader>\n    <CardTitle>Título</CardTitle>\n  </CardHeader>\n  <CardContent>\n    Conteúdo\n  </CardContent>\n</Card>'} 
                      label="Default"
                    />
                    <CodeBlock 
                      code={'<Card variant="elevated">\n  <CardHeader>\n    <CardTitle>Título</CardTitle>\n  </CardHeader>\n  <CardContent>\n    Conteúdo\n  </CardContent>\n</Card>'} 
                      label="Elevated"
                    />
                    <CodeBlock 
                      code={'<Card variant="interactive">\n  <CardHeader>\n    <CardTitle>Título</CardTitle>\n  </CardHeader>\n  <CardContent>\n    Conteúdo\n  </CardContent>\n</Card>'} 
                      label="Interactive"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <CodeBlock 
                      code={'<Card variant="glass">\n  ...\n</Card>'} 
                      label="Glass"
                    />
                    <CodeBlock 
                      code={'<Card variant="ghost">\n  ...\n</Card>'} 
                      label="Ghost"
                    />
                    <CodeBlock 
                      code={'<Card variant="outline">\n  ...\n</Card>'} 
                      label="Outline"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CodeBlock 
                      code={'<Card variant="stat">\n  <CardHeader>\n    <CardTitle>Vendas</CardTitle>\n  </CardHeader>\n  <CardContent>\n    <div className="text-2xl font-bold">1,234</div>\n  </CardContent>\n</Card>'} 
                      label="Stat (Dashboard)"
                    />
                    <CodeBlock 
                      code={'<Card variant="premium">\n  <CardHeader>\n    <CardTitle>Premium</CardTitle>\n  </CardHeader>\n  <CardContent>\n    Conteúdo especial\n  </CardContent>\n</Card>'} 
                      label="Premium (Destaque)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dashboard Example Section */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  Exemplo de Dashboard
                </CardTitle>
                <CardDescription>
                  Layout combinando Cards stat e premium para painéis de controle
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card variant="stat" className="hover-lift-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Vendas</p>
                          <p className="text-2xl font-bold text-foreground mt-1">R$ 45.231</p>
                          <p className="text-xs text-success flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3" /> +12.5%
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="stat" className="hover-lift-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pedidos</p>
                          <p className="text-2xl font-bold text-foreground mt-1">1,234</p>
                          <p className="text-xs text-success flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3" /> +8.2%
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                          <Package className="h-5 w-5 text-success" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="stat" className="hover-lift-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Clientes</p>
                          <p className="text-2xl font-bold text-foreground mt-1">892</p>
                          <p className="text-xs text-warning flex items-center gap-1 mt-1">
                            <Activity className="h-3 w-3" /> +2.1%
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-info" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="stat" className="hover-lift-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Taxa Conversão</p>
                          <p className="text-2xl font-bold text-foreground mt-1">3.24%</p>
                          <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3 rotate-180" /> -0.8%
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                          <Target className="h-5 w-5 text-warning" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Premium Highlight + Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card variant="premium" className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-amber-500" />
                        Plano Premium Ativo
                      </CardTitle>
                      <CardDescription>Acesso completo a todas as funcionalidades</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px]">
                          <p className="text-sm text-muted-foreground mb-2">Uso do plano este mês</p>
                          <Progress value={68} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">68% de 10.000 créditos</p>
                        </div>
                        <Button variant="gradient" shimmer size="sm">
                          <Sparkles className="h-4 w-4" />
                          Upgrade
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card variant="stat">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        Top Performer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-amber-500/50">
                          <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">João Silva</p>
                          <p className="text-xs text-muted-foreground">156 vendas este mês</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Code Example */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estrutura do Layout</h5>
                  <CodeBlock 
                    code={`{/* Stats Row */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <Card variant="stat" className="hover-lift-sm">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Label</p>
          <p className="text-2xl font-bold">Valor</p>
          <p className="text-xs text-success">
            <TrendingUp /> +12.5%
          </p>
        </div>
        <div className="h-10 w-10 rounded-lg bg-primary/10">
          <Icon />
        </div>
      </div>
    </CardContent>
  </Card>
  {/* ... mais cards */}
</div>

{/* Premium + Side Card */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <Card variant="premium" className="lg:col-span-2">
    {/* Conteúdo premium */}
  </Card>
  <Card variant="stat">
    {/* Card auxiliar */}
  </Card>
</div>`}
                    label="Layout Dashboard"
                    showLineNumbers
                  />
                </div>
              </CardContent>
            </Card>

            {/* CSS Class Cards Section */}
            <Card variant="default">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Classes CSS Utilitárias
                </CardTitle>
                <CardDescription>
                  Classes adicionais para efeitos especiais via className
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Interactive + Shine */}
                  <Card className="card-interactive card-shine">
                    <CardHeader>
                      <CardTitle className="text-lg">Card Shine</CardTitle>
                      <CardDescription>Efeito de brilho passando</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">card-interactive card-shine</code>
                    </CardContent>
                  </Card>

                  {/* Float Card */}
                  <Card className="card-float">
                    <CardHeader>
                      <CardTitle className="text-lg">Card Float</CardTitle>
                      <CardDescription>Elevação suave no hover</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">card-float</code>
                    </CardContent>
                  </Card>

                  {/* Pulse Border */}
                  <Card className="card-pulse-border">
                    <CardHeader>
                      <CardTitle className="text-lg">Pulse Border</CardTitle>
                      <CardDescription>Borda pulsante animada</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">card-pulse-border</code>
                    </CardContent>
                  </Card>

                  {/* Glow Blue */}
                  <Card className="card-glow-blue">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[hsl(210,100%,55%)]" />
                        Glow Blue
                      </CardTitle>
                      <CardDescription>Glow azul no hover</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">card-glow-blue</code>
                    </CardContent>
                  </Card>

                  {/* Glow Green */}
                  <Card className="card-glow-green">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[hsl(142,70%,45%)]" />
                        Glow Green
                      </CardTitle>
                      <CardDescription>Glow verde no hover</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">card-glow-green</code>
                    </CardContent>
                  </Card>

                  {/* Glow Purple */}
                  <Card className="card-glow-purple">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[hsl(280,80%,55%)]" />
                        Glow Purple
                      </CardTitle>
                      <CardDescription>Glow roxo no hover</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">card-glow-purple</code>
                    </CardContent>
                  </Card>

                  {/* Glow Orange */}
                  <Card className="card-glow-orange">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[hsl(24,95%,50%)]" />
                        Glow Orange
                      </CardTitle>
                      <CardDescription>Glow laranja no hover</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">card-glow-orange</code>
                    </CardContent>
                  </Card>

                  {/* Glass Card */}
                  <Card className="glass-card hover-lift">
                    <CardHeader>
                      <CardTitle className="text-lg">Glass Card</CardTitle>
                      <CardDescription>Glassmorphism clássico</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">glass-card hover-lift</code>
                    </CardContent>
                  </Card>

                  {/* Hover Lift */}
                  <Card className="hover-lift">
                    <CardHeader>
                      <CardTitle className="text-lg">Hover Lift</CardTitle>
                      <CardDescription>Eleva no hover com sombra</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs text-primary">hover-lift</code>
                    </CardContent>
                  </Card>
                </div>

                {/* Code Examples for CSS Classes */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <CodeBlock 
                      code={'<Card className="card-interactive card-shine">\n  ...\n</Card>'} 
                      label="Interactive + Shine"
                    />
                    <CodeBlock 
                      code={'<Card className="card-float">\n  ...\n</Card>'} 
                      label="Float"
                    />
                    <CodeBlock 
                      code={'<Card className="card-pulse-border">\n  ...\n</Card>'} 
                      label="Pulse Border"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <CodeBlock 
                      code={'<Card className="card-glow-blue">\n  ...\n</Card>'} 
                      label="Glow Blue"
                    />
                    <CodeBlock 
                      code={'<Card className="card-glow-green">\n  ...\n</Card>'} 
                      label="Glow Green"
                    />
                    <CodeBlock 
                      code={'<Card className="card-glow-purple">\n  ...\n</Card>'} 
                      label="Glow Purple"
                    />
                    <CodeBlock 
                      code={'<Card className="card-glow-orange">\n  ...\n</Card>'} 
                      label="Glow Orange"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <CodeBlock 
                      code={'<Card className="glass-card hover-lift">\n  ...\n</Card>'} 
                      label="Glass + Hover Lift"
                    />
                    <CodeBlock 
                      code={'<Card className="hover-lift">\n  ...\n</Card>'} 
                      label="Hover Lift"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
    </>
  );
}
