import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Zap, 
  Sparkles, 
  Trophy, 
  Flame, 
  Coins,
  Star,
  Award,
  Target,
  TrendingUp,
  Check,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function DesignSystemPage() {
  return (
    <MainLayout>
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-display font-bold gradient-text">Design System</h1>
          <p className="text-muted-foreground">
            Biblioteca completa de componentes, variantes e animações do sistema.
          </p>
        </div>

        <Tabs defaultValue="buttons" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 h-auto p-1">
            <TabsTrigger value="buttons" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Botões
            </TabsTrigger>
            <TabsTrigger value="cards" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Cards
            </TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Badges
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Progress
            </TabsTrigger>
            <TabsTrigger value="colors" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Cores
            </TabsTrigger>
          </TabsList>

          {/* Buttons Tab */}
          <TabsContent value="buttons" className="space-y-6">
            <Card className="card-interactive card-shine">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Variantes de Botões
                </CardTitle>
                <CardDescription>Todas as variantes disponíveis para o componente Button</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Standard Variants */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variantes Padrão</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default">Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                    <Button variant="destructive">Destructive</Button>
                  </div>
                </div>

                {/* Gaming/Gradient Variants */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variantes Gaming/Gradiente</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="gradient">Gradient</Button>
                    <Button variant="gradient-secondary">Gradient Secondary</Button>
                    <Button variant="gradient-success">Gradient Success</Button>
                    <Button variant="glow">Glow</Button>
                    <Button variant="glass">Glass</Button>
                  </div>
                </div>

                {/* With Shimmer */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Com Efeito Shimmer</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="gradient" shimmer>Gradient + Shimmer</Button>
                    <Button variant="default" shimmer>Default + Shimmer</Button>
                    <Button variant="gradient-success" shimmer>Success + Shimmer</Button>
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tamanhos</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="xl">Extra Large</Button>
                    <Button size="icon"><Star className="h-4 w-4" /></Button>
                  </div>
                </div>

                {/* With Icons */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Com Ícones</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="gradient"><Trophy className="h-4 w-4" /> Conquista</Button>
                    <Button variant="gradient-success"><Check className="h-4 w-4" /> Confirmar</Button>
                    <Button variant="destructive"><X className="h-4 w-4" /> Cancelar</Button>
                    <Button variant="outline"><Target className="h-4 w-4" /> Meta</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Interactive Card */}
              <Card className="card-interactive card-shine">
                <CardHeader>
                  <CardTitle className="text-lg">Card Interactive + Shine</CardTitle>
                  <CardDescription>Hover para ver o efeito de brilho passando</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Classes: <code className="text-primary">card-interactive card-shine</code>
                  </p>
                </CardContent>
              </Card>

              {/* Float Card */}
              <Card className="card-float">
                <CardHeader>
                  <CardTitle className="text-lg">Card Float</CardTitle>
                  <CardDescription>Elevação suave no hover</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Classe: <code className="text-primary">card-float</code>
                  </p>
                </CardContent>
              </Card>

              {/* Pulse Border Card */}
              <Card className="card-pulse-border">
                <CardHeader>
                  <CardTitle className="text-lg">Card Pulse Border</CardTitle>
                  <CardDescription>Borda com animação pulsante</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Classe: <code className="text-primary">card-pulse-border</code>
                  </p>
                </CardContent>
              </Card>

              {/* Glow Blue */}
              <Card className="card-glow-blue">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(210,100%,55%)]" />
                    Card Glow Blue
                  </CardTitle>
                  <CardDescription>Glow azul no hover</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Classe: <code className="text-primary">card-glow-blue</code>
                  </p>
                </CardContent>
              </Card>

              {/* Glow Green */}
              <Card className="card-glow-green">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(142,70%,45%)]" />
                    Card Glow Green
                  </CardTitle>
                  <CardDescription>Glow verde no hover</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Classe: <code className="text-primary">card-glow-green</code>
                  </p>
                </CardContent>
              </Card>

              {/* Glow Purple */}
              <Card className="card-glow-purple">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(280,80%,55%)]" />
                    Card Glow Purple
                  </CardTitle>
                  <CardDescription>Glow roxo no hover</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Classe: <code className="text-primary">card-glow-purple</code>
                  </p>
                </CardContent>
              </Card>

              {/* Glow Orange */}
              <Card className="card-glow-orange">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(24,95%,50%)]" />
                    Card Glow Orange
                  </CardTitle>
                  <CardDescription>Glow laranja no hover</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Classe: <code className="text-primary">card-glow-orange</code>
                  </p>
                </CardContent>
              </Card>

              {/* Glow Yellow */}
              <Card className="card-glow-yellow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(45,100%,50%)]" />
                    Card Glow Yellow
                  </CardTitle>
                  <CardDescription>Glow amarelo no hover</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Classe: <code className="text-primary">card-glow-yellow</code>
                  </p>
                </CardContent>
              </Card>

              {/* Glass Card */}
              <Card className="glass-card hover-lift">
                <CardHeader>
                  <CardTitle className="text-lg">Glass Card</CardTitle>
                  <CardDescription>Efeito glassmorphism</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Classe: <code className="text-primary">glass-card hover-lift</code>
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Variantes de Badges
                </CardTitle>
                <CardDescription>Todas as variantes incluindo gamificação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Standard Variants */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variantes Padrão</h4>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                  </div>
                </div>

                {/* Gamification Variants */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Variantes Gamificação</h4>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="xp" animated><Sparkles className="h-3 w-3" /> +150 XP</Badge>
                    <Badge variant="coins" animated><Coins className="h-3 w-3" /> 500 Coins</Badge>
                    <Badge variant="streak" animated><Flame className="h-3 w-3" /> 7 Dias</Badge>
                    <Badge variant="gold" animated><Trophy className="h-3 w-3" /> Ouro</Badge>
                    <Badge variant="silver" animated><Award className="h-3 w-3" /> Prata</Badge>
                    <Badge variant="bronze" animated><Star className="h-3 w-3" /> Bronze</Badge>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Status Badges</h4>
                  <div className="flex flex-wrap gap-3">
                    <StatusBadge status="queue" />
                    <StatusBadge status="ready" />
                    <StatusBadge status="scheduled" />
                    <StatusBadge status="production" />
                    <StatusBadge status="finished" />
                    <StatusBadge status="paused" />
                    <StatusBadge status="cancelled" />
                    <StatusBadge status="delayed" />
                    <StatusBadge status="rework" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Barras de Progresso
                </CardTitle>
                <CardDescription>Variantes com animações de gamificação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Standard Progress */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Padrão</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Default</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} />
                    </div>
                  </div>
                </div>

                {/* XP Progress */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">XP (Experiência)</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-[hsl(var(--xp))]" />
                          Nível 12
                        </span>
                        <span>2,450 / 3,000 XP</span>
                      </div>
                      <Progress value={82} variant="xp" animated showGlow />
                    </div>
                  </div>
                </div>

                {/* Success Progress */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sucesso</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-[hsl(var(--success))]" />
                          Concluído
                        </span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} variant="success" animated showGlow />
                    </div>
                  </div>
                </div>

                {/* Warning Progress */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Atenção</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-[hsl(var(--warning))]" />
                          Prazo próximo
                        </span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} variant="warning" animated />
                    </div>
                  </div>
                </div>

                {/* Destructive Progress */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Crítico</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <X className="h-4 w-4 text-destructive" />
                          Capacidade excedida
                        </span>
                        <span>95%</span>
                      </div>
                      <Progress value={95} variant="destructive" animated showGlow />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Paleta de Cores
                </CardTitle>
                <CardDescription>Tokens de cores do design system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Primary Colors */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cores Principais</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-primary glow-primary" />
                      <p className="text-sm font-medium">Primary</p>
                      <p className="text-xs text-muted-foreground">--primary</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-secondary glow-secondary" />
                      <p className="text-sm font-medium">Secondary</p>
                      <p className="text-xs text-muted-foreground">--secondary</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-accent glow-accent" />
                      <p className="text-sm font-medium">Accent</p>
                      <p className="text-xs text-muted-foreground">--accent</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-muted border" />
                      <p className="text-sm font-medium">Muted</p>
                      <p className="text-xs text-muted-foreground">--muted</p>
                    </div>
                  </div>
                </div>

                {/* Semantic Colors */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cores Semânticas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-[hsl(var(--success))] glow-success" />
                      <p className="text-sm font-medium">Success</p>
                      <p className="text-xs text-muted-foreground">--success</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-[hsl(var(--warning))] glow-warning" />
                      <p className="text-sm font-medium">Warning</p>
                      <p className="text-xs text-muted-foreground">--warning</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg bg-destructive" />
                      <p className="text-sm font-medium">Destructive</p>
                      <p className="text-xs text-muted-foreground">--destructive</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg gradient-primary" />
                      <p className="text-sm font-medium">Gradient Primary</p>
                      <p className="text-xs text-muted-foreground">.gradient-primary</p>
                    </div>
                  </div>
                </div>

                {/* Gamification Colors */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cores Gamificação</h4>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-[hsl(var(--xp))]" />
                      <p className="text-sm font-medium">XP</p>
                      <p className="text-xs text-muted-foreground">--xp</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-[hsl(var(--coins))]" />
                      <p className="text-sm font-medium">Coins</p>
                      <p className="text-xs text-muted-foreground">--coins</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-[hsl(var(--streak))]" />
                      <p className="text-sm font-medium">Streak</p>
                      <p className="text-xs text-muted-foreground">--streak</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-[hsl(var(--gold))]" />
                      <p className="text-sm font-medium">Gold</p>
                      <p className="text-xs text-muted-foreground">--gold</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-[hsl(var(--silver))]" />
                      <p className="text-sm font-medium">Silver</p>
                      <p className="text-xs text-muted-foreground">--silver</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-16 rounded-lg bg-[hsl(var(--bronze))]" />
                      <p className="text-sm font-medium">Bronze</p>
                      <p className="text-xs text-muted-foreground">--bronze</p>
                    </div>
                  </div>
                </div>

                {/* Gradients */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Gradientes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg gradient-primary" />
                      <p className="text-sm font-medium">Gradient Primary</p>
                      <p className="text-xs text-muted-foreground">.gradient-primary</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg gradient-secondary" />
                      <p className="text-sm font-medium">Gradient Secondary</p>
                      <p className="text-xs text-muted-foreground">.gradient-secondary</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-20 rounded-lg gradient-success" />
                      <p className="text-sm font-medium">Gradient Success</p>
                      <p className="text-xs text-muted-foreground">.gradient-success</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
