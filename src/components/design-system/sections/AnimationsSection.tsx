import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/ui/code-block';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { RefreshCw, Play, Sparkles, MousePointer2, Wand2, Trophy, Flame, Coins, Award, Star, Zap, AlertTriangle, AlertCircle, CheckCircle, Layers, Info, Square, Eye, MessageSquare, HelpCircle, Menu, ChevronUp, ChevronDown, MoreHorizontal, Settings, Check, X, Pause, Navigation as NavigationIcon } from 'lucide-react';

export function AnimationsSection() {
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
          
          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="animate-fade-in">\n  Conteúdo com fade in\n</div>'} 
                label="Fade In"
              />
              <CodeBlock 
                code={'<div className="animate-scale-in">\n  Conteúdo com scale in\n</div>'} 
                label="Scale In"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="animate-slide-in-right">\n  Slide da direita\n</div>'} 
                label="Slide In Right"
              />
              <CodeBlock 
                code={'<div className="animate-enter">\n  Fade + Scale combinados\n</div>'} 
                label="Enter (Combined)"
              />
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
          
          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <CodeBlock 
              code={'{items.map((item, index) => (\n  <div \n    key={item.id}\n    className={`animate-fade-in stagger-${index + 1}`}\n  >\n    {item.content}\n  </div>\n))}'} 
              label="Lista com Stagger"
            />
          </div>
          
          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="hover-lift">\n  Eleva no hover\n</div>'} 
                label="Hover Lift"
              />
              <CodeBlock 
                code={'<div className="hover-scale">\n  Escala no hover\n</div>'} 
                label="Hover Scale"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="hover-glow">\n  Brilha no hover\n</div>'} 
                label="Hover Glow"
              />
              <CodeBlock 
                code={'<Card className="card-interactive">\n  Card interativo\n</Card>'} 
                label="Card Interactive"
              />
            </div>
          </div>
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
          
          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="bg-primary glow-primary">\n  Glow Primary\n</div>'} 
                label="Glow Primary"
              />
              <CodeBlock 
                code={'<div className="bg-success glow-success">\n  Glow Success\n</div>'} 
                label="Glow Success"
              />
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
          
          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="xp-bar xp-bar-glow">\n  Barra de XP\n</div>'} 
                label="XP Bar"
              />
              <CodeBlock 
                code={'<div className="streak-fire">\n  <Flame /> 7\n</div>'} 
                label="Streak Fire"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="coin-shine">\n  <Coins />\n</div>'} 
                label="Coin Shine"
              />
              <CodeBlock 
                code={'<div className="animate-level-up">\n  LEVEL UP!\n</div>'} 
                label="Level Up"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="achievement-unlock">\n  <Trophy /> Conquista!\n</div>'} 
                label="Achievement Unlock"
              />
              <CodeBlock 
                code={'<div className="points-pop">\n  +100\n</div>'} 
                label="Points Pop"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <CodeBlock 
                code={'<div className="rank-gold">\n  <Trophy />\n</div>'} 
                label="Rank Gold"
              />
              <CodeBlock 
                code={'<div className="animate-float">\n  <Sparkles />\n</div>'} 
                label="Float Animation"
              />
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
          
          {/* Code Examples */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exemplos de Código</h5>
            <CodeBlock 
              code={'<div className="pulse-glow">\n  <Zap /> Ação importante\n</div>'} 
              label="Pulse Glow"
            />
          </div>
        </CardContent>
      </Card>

      {/* New Interactive Animations */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Novas Animações Interativas
            <Badge className="ml-2 bg-primary/20 text-primary border-primary/30">Novo</Badge>
          </CardTitle>
          <CardDescription>Animações importadas do projeto TASK GIFTS - clique para testar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Bounce In */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Bounce In</h4>
            <div className="flex items-center gap-6">
              <div key={animationKey + 10} className="h-20 w-20 rounded-xl bg-primary flex items-center justify-center animate-bounce-in text-primary-foreground font-bold">
                Bounce
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Entrada com efeito elástico</p>
                <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">.animate-bounce-in</code></p>
                <p className="text-xs text-muted-foreground">Ideal para cards e modais aparecendo</p>
              </div>
            </div>
            <CodeBlock 
              code={'<div className="animate-bounce-in">\n  Conteúdo com bounce\n</div>'} 
              label="Bounce In"
            />
          </div>

          {/* Wiggle */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Wiggle</h4>
            <div className="flex items-center gap-6">
              <Button 
                variant="outline" 
                className="wiggle-infinite border-warning text-warning hover:bg-warning/10"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Atenção!
              </Button>
              <div className="space-y-1">
                <p className="text-sm font-medium">Balanço para chamar atenção</p>
                <p className="text-xs text-muted-foreground">Classes: <code className="text-primary">.wiggle</code> (único) ou <code className="text-primary">.wiggle-infinite</code></p>
                <p className="text-xs text-muted-foreground">Ideal para alertas e badges urgentes</p>
              </div>
            </div>
            <CodeBlock 
              code={'<Badge className="wiggle-infinite">\n  Urgente\n</Badge>'} 
              label="Wiggle Infinite"
            />
          </div>

          {/* Pulse Ring */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pulse Ring</h4>
            <div className="flex items-center gap-6">
              <div className="relative flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-success pulse-ring" />
                <span className="text-sm font-medium text-success">Online</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Anel pulsante com ondas</p>
                <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">.pulse-ring</code></p>
                <p className="text-xs text-muted-foreground">Ideal para indicadores de status online/conectado</p>
              </div>
            </div>
            <CodeBlock 
              code={'<span className="h-3 w-3 rounded-full bg-success pulse-ring" />'} 
              label="Pulse Ring"
            />
          </div>

          {/* Bounce Attention */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Bounce Attention</h4>
            <div className="flex items-center gap-6">
              <div className="p-3 rounded-xl bg-destructive/20 animate-bounce-attention">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Pulo suave para atenção</p>
                <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">.animate-bounce-attention</code></p>
                <p className="text-xs text-muted-foreground">Ideal para ícones de alertas críticos</p>
              </div>
            </div>
            <CodeBlock 
              code={'<div className="animate-bounce-attention">\n  <AlertIcon />\n</div>'} 
              label="Bounce Attention"
            />
          </div>

          {/* Pop */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pop</h4>
            <div className="flex items-center gap-6">
              <div key={animationKey + 11} className="animate-pop">
                <Badge className="bg-success text-success-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Sucesso
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Entrada com elasticidade rápida</p>
                <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">.animate-pop</code></p>
                <p className="text-xs text-muted-foreground">Ideal para badges e notificações que mudam</p>
              </div>
            </div>
            <CodeBlock 
              code={'<Badge className="animate-pop">\n  Novo!\n</Badge>'} 
              label="Pop"
            />
          </div>

          {/* Press Scale */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Press Scale (Feedback Tátil)</h4>
            <div className="flex items-center gap-6">
              <Button className="press-scale">
                Clique e segure
              </Button>
              <div className="space-y-1">
                <p className="text-sm font-medium">Escala ao pressionar</p>
                <p className="text-xs text-muted-foreground">Classe: <code className="text-primary">.press-scale</code></p>
                <p className="text-xs text-muted-foreground">Já aplicado em todos os botões por padrão</p>
              </div>
            </div>
            <CodeBlock 
              code={'<button className="press-scale">\n  Botão com feedback\n</button>'} 
              label="Press Scale"
            />
          </div>

          {/* Interactive Demo */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Demo Interativo</h4>
            <p className="text-xs text-muted-foreground mb-4">Clique no botão "Replay Animações" acima para ver todas as animações novamente</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div key={animationKey + 20} className="h-16 rounded-lg bg-primary/20 flex items-center justify-center animate-bounce-in text-xs font-medium" style={{ animationDelay: '0s' }}>
                bounce-in
              </div>
              <div className="h-16 rounded-lg bg-warning/20 flex items-center justify-center text-xs font-medium wiggle-infinite">
                wiggle
              </div>
              <div className="h-16 rounded-lg bg-success/20 flex items-center justify-center text-xs font-medium">
                <span className="h-2 w-2 rounded-full bg-success pulse-ring mr-2" />
                pulse-ring
              </div>
              <div className="h-16 rounded-lg bg-destructive/20 flex items-center justify-center text-xs font-medium animate-bounce-attention">
                bounce-att
              </div>
              <div key={animationKey + 21} className="h-16 rounded-lg bg-info/20 flex items-center justify-center text-xs font-medium animate-pop" style={{ animationDelay: '0.2s' }}>
                pop
              </div>
              <div className="h-16 rounded-lg bg-muted flex items-center justify-center text-xs font-medium press-scale cursor-pointer hover:bg-muted/80 active:scale-95">
                press-scale
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Componentes com animate-bounce-in */}
      <Card className="card-interactive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Componentes com Bounce-In
            <Badge className="ml-2 bg-success/20 text-success border-success/30">Integrado</Badge>
          </CardTitle>
          <CardDescription>16 componentes UI com bounce-in + 3 sub-menus + Collapsible com accordion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-info bg-info/10">
            <Info className="h-4 w-4 text-info" />
            <AlertTitle className="text-info">Animação Automática</AlertTitle>
            <AlertDescription>
              Os componentes abaixo já possuem <code className="text-primary">.animate-bounce-in</code> aplicado automaticamente ao abrir.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Dialog */}
            <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-primary/20 flex items-center justify-center">
                  <Square className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Dialog</h4>
                  <p className="text-xs text-muted-foreground">Modais e diálogos</p>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-3 w-3 mr-2" />
                    Testar Dialog
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog com Bounce-In</DialogTitle>
                    <DialogDescription>
                      Este modal aparece com animação elástica suave.
                    </DialogDescription>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground">
                    A animação <code className="text-primary">animate-bounce-in</code> é aplicada automaticamente.
                  </p>
                </DialogContent>
              </Dialog>
            </div>

            {/* Popover */}
            <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-info/20 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-info" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Popover</h4>
                  <p className="text-xs text-muted-foreground">Painéis flutuantes</p>
                </div>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-3 w-3 mr-2" />
                    Testar Popover
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <p className="text-sm">Popover com bounce-in!</p>
                </PopoverContent>
              </Popover>
            </div>

            {/* Tooltip */}
            <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-warning/20 flex items-center justify-center">
                  <HelpCircle className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Tooltip</h4>
                  <p className="text-xs text-muted-foreground">Dicas de contexto</p>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-3 w-3 mr-2" />
                      Passe o mouse
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tooltip com bounce-in!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Dropdown Menu */}
            <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-success/20 flex items-center justify-center">
                  <Menu className="h-4 w-4 text-success" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Dropdown Menu</h4>
                  <p className="text-xs text-muted-foreground">Menus suspensos</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Abra qualquer dropdown para ver a animação bounce-in.
              </p>
            </div>

            {/* Hover Card */}
            <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-destructive/20 flex items-center justify-center">
                  <MousePointer2 className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Hover Card</h4>
                  <p className="text-xs text-muted-foreground">Cards ao passar o mouse</p>
                </div>
              </div>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-3 w-3 mr-2" />
                    Hover aqui
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent>
                  <p className="text-sm font-medium">Hover Card</p>
                  <p className="text-xs text-muted-foreground">Com bounce-in suave!</p>
                </HoverCardContent>
              </HoverCard>
            </div>

            {/* Drawer */}
            <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                  <ChevronUp className="h-4 w-4 text-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Drawer</h4>
                  <p className="text-xs text-muted-foreground">Painéis deslizantes</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Drawer bottom sheet também usa bounce-in.
              </p>
            </div>

            {/* Alert */}
            <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-warning/20 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Alert</h4>
                  <p className="text-xs text-muted-foreground">Mensagens de alerta</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Alertas aparecem com bounce-in para chamar atenção.
              </p>
            </div>

            {/* Alert Dialog */}
            <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Alert Dialog</h4>
                  <p className="text-xs text-muted-foreground">Confirmações críticas</p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-3 w-3 mr-2" />
                    Testar AlertDialog
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>AlertDialog com Bounce-In</AlertDialogTitle>
                    <AlertDialogDescription>
                      Este diálogo de confirmação aparece com animação elástica.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction>Confirmar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Sheet */}
            <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-info/20 flex items-center justify-center">
                  <Layers className="h-4 w-4 text-info" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Sheet</h4>
                  <p className="text-xs text-muted-foreground">Painéis laterais</p>
                </div>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-3 w-3 mr-2" />
                    Testar Sheet
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Sheet com Bounce-In</SheetTitle>
                    <SheetDescription>
                      Painel lateral com animação elástica ao abrir.
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </div>

            {/* Context Menu */}
            <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-primary/20 flex items-center justify-center">
                  <MoreHorizontal className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Context Menu</h4>
                  <p className="text-xs text-muted-foreground">Menu de contexto</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Clique direito em elementos para ver o bounce-in no menu.
              </p>
            </div>

            {/* Menubar */}
            <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-info/20 flex items-center justify-center">
                  <Menu className="h-4 w-4 text-info" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Menubar</h4>
                  <p className="text-xs text-muted-foreground">Barra de menu</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Menus e sub-menus com bounce-in.
              </p>
            </div>

            {/* NavigationMenu */}
            <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-success/20 flex items-center justify-center">
                  <Navigation className="h-4 w-4 text-success" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">NavigationMenu</h4>
                  <p className="text-xs text-muted-foreground">Menu de navegação</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Conteúdo de navegação com bounce-in.
              </p>
            </div>

            {/* Select */}
            <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-warning/20 flex items-center justify-center">
                  <ChevronDown className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Select</h4>
                  <p className="text-xs text-muted-foreground">Dropdown de seleção</p>
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Testar Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Opção 1</SelectItem>
                  <SelectItem value="2">Opção 2</SelectItem>
                  <SelectItem value="3">Opção 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sub-menus section */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Sub-menus (também com bounce-in)</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">MenubarSubContent</Badge>
              <Badge variant="outline" className="text-xs">DropdownMenuSubContent</Badge>
              <Badge variant="outline" className="text-xs">ContextMenuSubContent</Badge>
            </div>
          </div>

          {/* Collapsible section */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Animação de Expansão (Accordion)</h4>
            <div className="flex items-center gap-4">
              <Badge className="bg-secondary text-secondary-foreground">Collapsible</Badge>
              <Badge className="bg-secondary text-secondary-foreground">Accordion</Badge>
              <span className="text-xs text-muted-foreground">Usam animate-accordion-down/up</span>
            </div>
          </div>

          {/* Code Example */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Como foi implementado</h4>
            <CodeBlock 
              code={`// Componentes flutuantes (16 total)
// Dialog, AlertDialog, Popover, Tooltip, DropdownMenu,
// HoverCard, Drawer, Alert, Sheet, ContextMenu,
// Menubar, NavigationMenu, Select

// Padrão: data-[state=open]:animate-bounce-in
<DialogContent className={cn(
  "... data-[state=open]:animate-bounce-in ...",
  className
)}>

// Sub-menus (3 total)
// MenubarSubContent, DropdownMenuSubContent, ContextMenuSubContent
<DropdownMenuSubContent className={cn(
  "... data-[state=open]:animate-bounce-in ...",
  className
)}>

// Componentes de expansão
// Collapsible, Accordion
<CollapsibleContent className={cn(
  "... data-[state=open]:animate-accordion-down ...",
  "... data-[state=closed]:animate-accordion-up ...",
  className
)}>`} 
              label="Implementação - 16 bounce-in + 3 sub-menus + 2 accordion"
            />
          </div>

          {/* Benefits */}
          <div className="grid gap-3 md:grid-cols-3 pt-4 border-t border-border">
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-success" />
                <h5 className="text-sm font-medium text-success">Feedback Visual</h5>
              </div>
              <p className="text-xs text-muted-foreground">Entradas dinâmicas criam sensação de responsividade</p>
            </div>
            <div className="p-3 rounded-lg bg-info/10 border border-info/20">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-info" />
                <h5 className="text-sm font-medium text-info">Performance</h5>
              </div>
              <p className="text-xs text-muted-foreground">Animação leve usando transforms e opacity</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <h5 className="text-sm font-medium text-primary">Consistência</h5>
              </div>
              <p className="text-xs text-muted-foreground">Mesma animação em todos os componentes flutuantes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility - Reduced Motion */}
      <Card className="card-interactive border-warning/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pause className="h-5 w-5 text-warning" />
            Acessibilidade - Reduced Motion
            <Badge className="ml-2 bg-warning/20 text-warning border-warning/30">A11y</Badge>
          </CardTitle>
          <CardDescription>Suporte a usuários que preferem menos movimento nas animações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-warning bg-warning/10">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <AlertTitle className="text-warning">Importante para Acessibilidade</AlertTitle>
            <AlertDescription>
              Algumas pessoas têm sensibilidade a animações e podem experienciar náuseas, tonturas ou desconforto. 
              O sistema respeita automaticamente a preferência <code className="text-primary">prefers-reduced-motion</code>.
            </AlertDescription>
          </Alert>

          {/* Como funciona */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Como Funciona</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
                <h5 className="text-sm font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Preferência do Sistema
                </h5>
                <p className="text-xs text-muted-foreground">
                  Quando o usuário ativa "Reduzir Movimento" nas configurações do sistema operacional, 
                  todas as animações são automaticamente desabilitadas via CSS media query.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
                <h5 className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  Toggle de Simulação
                </h5>
                <p className="text-xs text-muted-foreground">
                  Use o toggle "Simular Reduced Motion" no topo desta página para testar 
                  como a interface se comporta sem animações.
                </p>
              </div>
            </div>
          </div>

          {/* Classes Utilitárias */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Classes Utilitárias</h4>
            <div className="grid gap-3">
              <CodeBlock 
                code={'/* Aplicar apenas quando motion é seguro */\n.motion-safe-only {\n  @media (prefers-reduced-motion: reduce) {\n    animation: none !important;\n    transition: none !important;\n  }\n}'} 
                label=".motion-safe-only"
              />
              <CodeBlock 
                code={'/* Forçar animação mesmo com reduced-motion */\n.motion-reduce-override {\n  animation-duration: inherit !important;\n  transition-duration: inherit !important;\n}'} 
                label=".motion-reduce-override (usar com cuidado)"
              />
              <CodeBlock 
                code={'/* Estilos alternativos quando motion é reduzido */\n.reduced-motion-visible {\n  /* Garante visibilidade sem animação */\n  opacity: 1 !important;\n  visibility: visible !important;\n}\n\n.reduced-motion-border {\n  /* Destaque via borda ao invés de animação */\n  border: 2px solid hsl(var(--primary)) !important;\n}'} 
                label="Estilos Alternativos"
              />
            </div>
          </div>

          {/* O que é desabilitado */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">O que é Desabilitado</h4>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <h5 className="text-xs font-semibold text-destructive mb-2">Animações de Entrada</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• animate-fade-in</li>
                  <li>• animate-scale-in</li>
                  <li>• animate-bounce-in</li>
                  <li>• animate-slide-in-*</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <h5 className="text-xs font-semibold text-destructive mb-2">Animações Contínuas</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• animate-pulse</li>
                  <li>• animate-float</li>
                  <li>• pulse-ring</li>
                  <li>• wiggle-infinite</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <h5 className="text-xs font-semibold text-destructive mb-2">Efeitos Hover</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• hover-lift</li>
                  <li>• hover-scale</li>
                  <li>• hover-glow</li>
                  <li>• glow-* effects</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Boas Práticas */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Boas Práticas</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-success" />
                  <h5 className="text-sm font-medium text-success">Fazer</h5>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Usar CSS transforms (performático)</li>
                  <li>• Manter animações opcionais</li>
                  <li>• Fornecer alternativas estáticas</li>
                  <li>• Testar com reduced-motion ativo</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 mb-2">
                  <X className="h-4 w-4 text-destructive" />
                  <h5 className="text-sm font-medium text-destructive">Evitar</h5>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Animações que obscurecem conteúdo</li>
                  <li>• Flashings rápidos (&lt; 3 por segundo)</li>
                  <li>• Movimento parallax intenso</li>
                  <li>• Animações obrigatórias para funcionalidade</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Implementação */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Implementação no Código</h4>
            <CodeBlock 
              code={'// Detectar preferência do sistema em React\nconst [prefersReducedMotion, setPrefersReducedMotion] = useState(false);\n\nuseEffect(() => {\n  const mediaQuery = window.matchMedia(\'(prefers-reduced-motion: reduce)\');\n  setPrefersReducedMotion(mediaQuery.matches);\n  \n  const handler = (e) => setPrefersReducedMotion(e.matches);\n  mediaQuery.addEventListener(\'change\', handler);\n  return () => mediaQuery.removeEventListener(\'change\', handler);\n}, []);\n\n// Uso condicional\n<div className={prefersReducedMotion ? \'\' : \'animate-bounce-in\'}>\n  Conteúdo\n</div>'} 
              label="Detecção em React"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
