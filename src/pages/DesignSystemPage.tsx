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
  Info,
  Play,
  MousePointer2,
  Wand2,
  RefreshCw,
  Type
} from 'lucide-react';
import { useState } from 'react';

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
          <TabsList className="grid grid-cols-3 md:grid-cols-7 gap-2 h-auto p-1">
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
            <TabsTrigger value="typography" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Tipografia
            </TabsTrigger>
            <TabsTrigger value="animations" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              Animações
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

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-6">
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5 text-primary" />
                  Família de Fontes
                </CardTitle>
                <CardDescription>Plus Jakarta Sans - fonte principal do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Display / Títulos</h4>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="font-display text-2xl font-bold">Plus Jakarta Sans</p>
                      <p className="text-sm text-muted-foreground">font-family: Plus Jakarta Sans, system-ui, sans-serif</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-display</code></p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Body / Texto</h4>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="font-sans text-2xl">Plus Jakarta Sans</p>
                      <p className="text-sm text-muted-foreground">font-family: Plus Jakarta Sans, system-ui, sans-serif</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-sans</code></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Font Weights */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Pesos de Fonte</CardTitle>
                <CardDescription>Variações de peso disponíveis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-2xl font-normal">Regular</p>
                      <p className="text-xs text-muted-foreground">font-weight: 400</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-normal</code></p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-2xl font-medium">Medium</p>
                      <p className="text-xs text-muted-foreground">font-weight: 500</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-medium</code></p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-2xl font-semibold">Semibold</p>
                      <p className="text-xs text-muted-foreground">font-weight: 600</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-semibold</code></p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-2xl font-bold">Bold</p>
                      <p className="text-xs text-muted-foreground">font-weight: 700</p>
                      <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-bold</code></p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <p className="text-2xl font-extrabold">Extra Bold</p>
                    <p className="text-xs text-muted-foreground">font-weight: 800</p>
                    <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">font-extrabold</code></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Font Sizes */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Tamanhos de Fonte</CardTitle>
                <CardDescription>Escala tipográfica do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Classe</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Tamanho</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Exemplo</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-xs</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">12px / 0.75rem</td>
                          <td className="py-3 px-4 text-xs">Texto extra pequeno</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-sm</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">14px / 0.875rem</td>
                          <td className="py-3 px-4 text-sm">Texto pequeno</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-base</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">16px / 1rem</td>
                          <td className="py-3 px-4 text-base">Texto base (padrão)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-lg</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">18px / 1.125rem</td>
                          <td className="py-3 px-4 text-lg">Texto grande</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-xl</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">20px / 1.25rem</td>
                          <td className="py-3 px-4 text-xl">Texto XL</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-2xl</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">24px / 1.5rem</td>
                          <td className="py-3 px-4 text-2xl">Título 2XL</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-3xl</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">30px / 1.875rem</td>
                          <td className="py-3 px-4 text-3xl">Título 3XL</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-4xl</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">36px / 2.25rem</td>
                          <td className="py-3 px-4 text-4xl">Título 4XL</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4"><code className="text-primary text-sm">text-5xl</code></td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">48px / 3rem</td>
                          <td className="py-3 px-4 text-5xl">Título 5XL</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Headings */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Hierarquia de Títulos</CardTitle>
                <CardDescription>Estrutura semântica de headings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight">Heading 1 - Principal</h1>
                    <p className="text-xs text-muted-foreground">text-4xl font-bold tracking-tight</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h2 className="text-3xl font-semibold tracking-tight">Heading 2 - Seção</h2>
                    <p className="text-xs text-muted-foreground">text-3xl font-semibold tracking-tight</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h3 className="text-2xl font-semibold">Heading 3 - Subseção</h3>
                    <p className="text-xs text-muted-foreground">text-2xl font-semibold</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h4 className="text-xl font-medium">Heading 4 - Card Title</h4>
                    <p className="text-xs text-muted-foreground">text-xl font-medium</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h5 className="text-lg font-medium">Heading 5 - Item Title</h5>
                    <p className="text-xs text-muted-foreground">text-lg font-medium</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                    <h6 className="text-base font-medium">Heading 6 - Label</h6>
                    <p className="text-xs text-muted-foreground">text-base font-medium</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Text Styles */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Estilos de Texto</CardTitle>
                <CardDescription>Variações e efeitos especiais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Estilos Básicos</h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-foreground">Texto padrão (foreground)</p>
                        <p className="text-xs text-muted-foreground mt-1">text-foreground</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-muted-foreground">Texto secundário (muted)</p>
                        <p className="text-xs text-muted-foreground mt-1">text-muted-foreground</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-primary font-medium">Texto primário (destaque)</p>
                        <p className="text-xs text-muted-foreground mt-1">text-primary</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="italic">Texto em itálico</p>
                        <p className="text-xs text-muted-foreground mt-1">italic</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="underline underline-offset-4">Texto sublinhado</p>
                        <p className="text-xs text-muted-foreground mt-1">underline underline-offset-4</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="line-through text-muted-foreground">Texto riscado</p>
                        <p className="text-xs text-muted-foreground mt-1">line-through</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Efeitos Especiais</h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold gradient-text">Texto com Gradiente</p>
                        <p className="text-xs text-muted-foreground mt-1">gradient-text</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="uppercase tracking-widest text-sm font-semibold">Texto Uppercase</p>
                        <p className="text-xs text-muted-foreground mt-1">uppercase tracking-widest</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="tracking-tight text-xl font-bold">Tracking Tight</p>
                        <p className="text-xs text-muted-foreground mt-1">tracking-tight</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="tracking-wide">Tracking Wide</p>
                        <p className="text-xs text-muted-foreground mt-1">tracking-wide</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="leading-relaxed">Texto com line-height relaxado para melhor legibilidade em parágrafos longos.</p>
                        <p className="text-xs text-muted-foreground mt-1">leading-relaxed</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="truncate w-48">Texto muito longo que será truncado com ellipsis no final</p>
                        <p className="text-xs text-muted-foreground mt-1">truncate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code & Mono */}
            <Card className="card-interactive">
              <CardHeader>
                <CardTitle>Código e Monospace</CardTitle>
                <CardDescription>Estilos para código e dados técnicos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Inline code:</p>
                      <p>Use a classe <code className="px-1.5 py-0.5 rounded bg-muted text-primary text-sm font-mono">.gradient-primary</code> para gradientes.</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Code block:</p>
                      <pre className="p-4 rounded-lg bg-card border text-sm font-mono overflow-x-auto">
{`const theme = {
  primary: "hsl(24, 95%, 48%)",
  secondary: "hsl(210, 100%, 50%)",
  accent: "hsl(280, 80%, 50%)"
};`}
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Animations Tab */}
          <TabsContent value="animations" className="space-y-6">
            <AnimationsSection />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

function AnimationsSection() {
  const [animationKey, setAnimationKey] = useState(0);
  
  const replayAnimations = () => {
    setAnimationKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Replay Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={replayAnimations} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Replay Animações
        </Button>
      </div>

      {/* Entry Animations */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Animações de Entrada
          </CardTitle>
          <CardDescription>Animações para elementos que aparecem na tela</CardDescription>
        </CardHeader>
        <CardContent>
          <div key={animationKey} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-muted flex items-center justify-center animate-fade-in opacity-0 [animation-fill-mode:forwards]">
                <span className="text-sm font-medium">Fade In</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.animate-fade-in</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-muted flex items-center justify-center animate-scale-in opacity-0 [animation-fill-mode:forwards] [animation-delay:0.1s]">
                <span className="text-sm font-medium">Scale In</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.animate-scale-in</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-muted flex items-center justify-center animate-slide-in-right opacity-0 [animation-fill-mode:forwards] [animation-delay:0.2s]">
                <span className="text-sm font-medium">Slide Right</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.animate-slide-in-right</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-muted flex items-center justify-center animate-enter opacity-0 [animation-fill-mode:forwards] [animation-delay:0.3s]">
                <span className="text-sm font-medium">Enter (Combined)</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.animate-enter</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stagger Animations */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Animações Stagger (Escalonadas)
          </CardTitle>
          <CardDescription>Delays sequenciais para listas de elementos</CardDescription>
        </CardHeader>
        <CardContent>
          <div key={animationKey + 1} className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className={`h-16 w-16 rounded-lg gradient-primary flex items-center justify-center text-white font-bold animate-fade-in opacity-0 [animation-fill-mode:forwards] stagger-${num}`}
              >
                {num}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Classes: <code className="text-primary">.stagger-1</code> até <code className="text-primary">.stagger-6</code>
          </p>
        </CardContent>
      </Card>

      {/* Hover Effects */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer2 className="h-5 w-5 text-primary" />
            Efeitos de Hover
          </CardTitle>
          <CardDescription>Interações visuais ao passar o mouse</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-muted flex items-center justify-center hover-lift cursor-pointer">
                <span className="text-sm font-medium">Hover Lift</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.hover-lift</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-muted flex items-center justify-center hover-scale cursor-pointer">
                <span className="text-sm font-medium">Hover Scale</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.hover-scale</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-primary/20 flex items-center justify-center hover-glow cursor-pointer">
                <span className="text-sm font-medium">Hover Glow</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.hover-glow</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-muted flex items-center justify-center card-interactive cursor-pointer border">
                <span className="text-sm font-medium">Card Interactive</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.card-interactive</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Glow Effects */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Efeitos de Glow (Brilho)
          </CardTitle>
          <CardDescription>Efeitos de brilho e neon para destaque</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-primary flex items-center justify-center glow-primary">
                <span className="text-sm font-medium text-primary-foreground">Primary</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.glow-primary</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-secondary flex items-center justify-center glow-secondary">
                <span className="text-sm font-medium text-secondary-foreground">Secondary</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.glow-secondary</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-[hsl(var(--success))] flex items-center justify-center glow-success">
                <span className="text-sm font-medium text-white">Success</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.glow-success</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-accent flex items-center justify-center glow-accent">
                <span className="text-sm font-medium text-accent-foreground">Accent</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.glow-accent</p>
            </div>
            
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-[hsl(var(--warning))] flex items-center justify-center glow-warning">
                <span className="text-sm font-medium text-foreground">Warning</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">.glow-warning</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gamification Animations */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Animações de Gamificação
          </CardTitle>
          <CardDescription>Animações especiais para elementos de gamificação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* XP Bar */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">XP Bar Shimmer</h4>
            <div className="space-y-2">
              <div className="h-4 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-3/4 rounded-full xp-bar xp-bar-glow" />
              </div>
              <p className="text-xs text-muted-foreground">Classes: <code className="text-primary">.xp-bar .xp-bar-glow</code></p>
            </div>
          </div>

          {/* Fire Pulse */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Streak Fire Pulse</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 streak-fire">
                <Flame className="h-8 w-8 text-orange-500" />
                <span className="text-2xl font-bold">7</span>
              </div>
              <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.streak-fire</code></p>
            </div>
          </div>

          {/* Coin Shine */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Coin Shine</h4>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--coins))] flex items-center justify-center coin-shine">
                <Coins className="h-6 w-6 text-yellow-900" />
              </div>
              <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.coin-shine</code></p>
            </div>
          </div>

          {/* Level Up */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Level Up Flash</h4>
            <div key={animationKey + 2} className="flex gap-4">
              <div className="px-6 py-3 rounded-lg bg-[hsl(var(--xp))] text-white font-bold animate-level-up">
                LEVEL UP!
              </div>
              <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.animate-level-up</code></p>
            </div>
          </div>

          {/* Achievement Unlock */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Achievement Unlock</h4>
            <div key={animationKey + 3} className="flex gap-4">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[hsl(var(--gold))] text-yellow-900 achievement-unlock">
                <Trophy className="h-6 w-6" />
                <span className="font-bold">Conquista Desbloqueada!</span>
              </div>
              <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.achievement-unlock</code></p>
            </div>
          </div>

          {/* Points Pop */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Points Pop</h4>
            <div key={animationKey + 4} className="flex gap-4">
              <div className="text-2xl font-bold text-[hsl(var(--xp))] points-pop">
                +100
              </div>
              <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.points-pop</code></p>
            </div>
          </div>

          {/* Badge Ranks */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Ranking Badges</h4>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center rank-gold">
                  <Trophy className="h-8 w-8 text-yellow-900" />
                </div>
                <p className="text-xs text-muted-foreground">.rank-gold</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center rank-silver">
                  <Award className="h-8 w-8 text-gray-700" />
                </div>
                <p className="text-xs text-muted-foreground">.rank-silver</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center rank-bronze">
                  <Star className="h-8 w-8 text-orange-900" />
                </div>
                <p className="text-xs text-muted-foreground">.rank-bronze</p>
              </div>
            </div>
          </div>

          {/* Floating Animation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Floating Icon</h4>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center animate-float">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <p className="text-xs text-muted-foreground self-center">Classe: <code className="text-primary">.animate-float</code></p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pulse Animation */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Animação Pulse Glow
          </CardTitle>
          <CardDescription>Pulsação contínua com glow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="w-20 h-20 rounded-xl bg-primary flex items-center justify-center pulse-glow">
              <Zap className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="space-y-2 self-center">
              <p className="text-sm font-medium">Pulse Glow</p>
              <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">.pulse-glow</code></p>
              <p className="text-xs text-muted-foreground">Efeito de pulsação contínua ideal para CTAs e notificações</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
