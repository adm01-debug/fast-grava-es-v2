// ============= COMPONENT SHOWCASE - DEMO PAGE =============

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Empty States
import { EmptyState, SearchEmptyState, FilterEmptyState, ErrorEmptyState } from '@/components/empty-states/EmptyState';

// Polish Components
import {
  HeroGradient,
  ElevatedCard,
  GlassCard,
  ShimmerText,
  GradientBorder,
  FloatingElement,
  PulseGlow,
  StaggerChildren,
} from '@/components/polish/VisualPolish';

// Data Visualization
import {
  Sparkline,
  TrendIndicator,
  StatCardEnhanced,
  MiniProgress,
  GaugeChart,
  StatusIndicator,
} from '@/components/data-viz/DataVisualization';

// Micro Interactions
import {
  Pressable,
  HoverLift,
  Pulse,
  Shake,
  Bounce,
  FadeSlide,
  ScalePop,
} from '@/components/ui/micro-interactions';

// Advanced Interactions
import {
  MagneticButton,
  TiltCard,
  CopyButton,
  ExpandableText,
  MorphingNumber,
  Typewriter,
} from '@/components/ui/advanced-interactions';

// Celebrations
import {
  Confetti,
  CelebrationToast,
  AchievementBadge,
  ProgressMilestone,
} from '@/components/ui/celebration';

// Loading States
import {
  Shimmer,
  StatsCardSkeleton,
  TableSkeleton,
  CardSkeleton,
  ChartSkeleton,
} from '@/components/loading/SkeletonLibrary';

import {
  Sparkles,
  Zap,
  Trophy,
  Star,
  Heart,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// ============= SHOWCASE SECTIONS =============

function EmptyStatesShowcase() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Empty States</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <EmptyState 
              variant="search" 
              size="sm"
              action={{ label: 'Limpar', onClick: () => {} }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <EmptyState 
              variant="noJobs" 
              size="sm"
              action={{ label: 'Criar Trabalho', onClick: () => {} }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <EmptyState 
              variant="offline" 
              size="sm"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <EmptyState 
              variant="noNotifications" 
              size="sm"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PolishShowcase() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Visual Polish</h3>
      
      {/* Shimmer Text */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Shimmer Text</p>
        <div className="text-2xl font-bold">
          <ShimmerText text="Texto Brilhante Animado" speed="normal" />
        </div>
      </div>

      {/* Pulse Glow */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Pulse Glow (Status Indicators)</p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <PulseGlow color="success" size="md" />
            <span className="text-sm">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <PulseGlow color="warning" size="md" />
            <span className="text-sm">Em Pausa</span>
          </div>
          <div className="flex items-center gap-2">
            <PulseGlow color="destructive" size="md" />
            <span className="text-sm">Erro</span>
          </div>
        </div>
      </div>

      {/* Elevated Cards */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Elevated Cards</p>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((level) => (
            <ElevatedCard key={level} elevation={level as 1 | 2 | 3 | 4} className="p-4">
              <p className="text-sm font-medium">Elevação {level}</p>
            </ElevatedCard>
          ))}
        </div>
      </div>

      {/* Glass Card */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Glass Card</p>
        <HeroGradient variant="primary" className="p-8 rounded-lg">
          <GlassCard blur="lg" className="p-6">
            <p className="font-medium">Efeito Glass Morphism</p>
            <p className="text-sm text-muted-foreground">Com blur de fundo</p>
          </GlassCard>
        </HeroGradient>
      </div>

      {/* Gradient Border */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Gradient Border</p>
        <div className="flex gap-4">
          <GradientBorder gradient="primary" className="w-fit">
            <div className="p-4">Primary</div>
          </GradientBorder>
          <GradientBorder gradient="success" className="w-fit">
            <div className="p-4">Success</div>
          </GradientBorder>
          <GradientBorder gradient="rainbow" animate className="w-fit">
            <div className="p-4">Rainbow ✨</div>
          </GradientBorder>
        </div>
      </div>
    </div>
  );
}

function DataVizShowcase() {
  // Simple number array for Sparkline
  const sparklineData = [10, 25, 18, 32, 28, 45, 38, 52];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Data Visualization</h3>
      
      {/* Sparklines */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Sparklines</p>
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <span className="text-sm">Vendas</span>
            <Sparkline data={sparklineData} strokeColor="hsl(var(--primary))" />
            <TrendIndicator value={112.5} previousValue={100} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Custos</span>
            <Sparkline data={[...sparklineData].reverse()} strokeColor="hsl(var(--destructive))" />
            <TrendIndicator value={91.7} previousValue={100} />
          </div>
        </div>
      </div>

      {/* Gauge Charts */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Gauge Charts</p>
        <div className="flex gap-6">
          <div className="text-center">
            <GaugeChart value={85} max={100} size="md" />
            <p className="text-sm mt-2">Eficiência</p>
          </div>
          <div className="text-center">
            <GaugeChart value={62} max={100} size="md" />
            <p className="text-sm mt-2">Qualidade</p>
          </div>
          <div className="text-center">
            <GaugeChart value={25} max={100} size="md" />
            <p className="text-sm mt-2">Perdas</p>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Status Indicators</p>
        <div className="flex gap-4">
          <StatusIndicator status="online" label="Produzindo" />
          <StatusIndicator status="warning" label="Manutenção" />
          <StatusIndicator status="error" label="Parada" />
          <StatusIndicator status="idle" label="Setup" pulse />
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Mini Progress</p>
        <div className="space-y-3 max-w-md">
          <MiniProgress value={75} max={100} label="Progresso" showValue />
          <MiniProgress value={45} max={100} label="Qualidade" color="warning" showValue />
          <MiniProgress value={90} max={100} label="OEE" color="success" showValue />
        </div>
      </div>
    </div>
  );
}

function InteractionsShowcase() {
  const [shakeTriggered, setShakeTriggered] = useState(false);
  const [bounceTriggered, setBounceTriggered] = useState(false);
  const [scaleTriggered, setScaleTriggered] = useState(false);
  const [showFadeSlide, setShowFadeSlide] = useState(true);
  const [morphValue, setMorphValue] = useState(1234);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Micro Interactions</h3>
      
      {/* Pressable & Hover */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Pressable & Hover Lift</p>
        <div className="flex gap-4">
          <Pressable onPress={() => {}} className="p-4 bg-primary/10 rounded-lg">
            <span>Pressione-me</span>
          </Pressable>
          <HoverLift shadow className="p-4 bg-primary/10 rounded-lg">
            <span>Passe o mouse</span>
          </HoverLift>
        </div>
      </div>

      {/* Trigger Animations */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Trigger Animations</p>
        <div className="flex gap-4 items-center">
          <Shake trigger={shakeTriggered}>
            <Button 
              variant="destructive" 
              onClick={() => { setShakeTriggered(true); setTimeout(() => setShakeTriggered(false), 500); }}
            >
              Shake
            </Button>
          </Shake>
          
          <Bounce trigger={bounceTriggered}>
            <Button 
              variant="outline"
              onClick={() => { setBounceTriggered(true); setTimeout(() => setBounceTriggered(false), 600); }}
            >
              Bounce
            </Button>
          </Bounce>
          
          <ScalePop trigger={scaleTriggered}>
            <Button 
              onClick={() => { setScaleTriggered(true); setTimeout(() => setScaleTriggered(false), 300); }}
            >
              Pop!
            </Button>
          </ScalePop>
        </div>
      </div>

      {/* Fade Slide */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Fade Slide</p>
        <div className="flex gap-4 items-center">
          <Button variant="outline" onClick={() => setShowFadeSlide(!showFadeSlide)}>
            Toggle
          </Button>
          <FadeSlide isVisible={showFadeSlide} direction="left">
            <Badge>Apareço suavemente!</Badge>
          </FadeSlide>
        </div>
      </div>

      {/* Advanced */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Advanced Interactions</p>
        <div className="flex gap-4 flex-wrap items-center">
          <MagneticButton strength={20}>
            <Button>Botão Magnético</Button>
          </MagneticButton>

          <TiltCard maxTilt={15} className="p-4 bg-card border rounded-lg">
            <p>Card com Tilt 3D</p>
          </TiltCard>

          <CopyButton text="Texto copiado!" />
        </div>
      </div>

      {/* Morphing Number */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Morphing Number</p>
        <div className="flex gap-4 items-center">
          <div className="text-3xl font-bold">
            <MorphingNumber value={morphValue} />
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setMorphValue(prev => prev + Math.floor(Math.random() * 500))}
          >
            Incrementar
          </Button>
        </div>
      </div>

      {/* Typewriter */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Typewriter</p>
        <div className="text-lg">
          <Typewriter text="Este texto aparece como se estivesse sendo digitado..." speed={50} />
        </div>
      </div>
    </div>
  );
}

function CelebrationShowcase() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showAchievement1, setShowAchievement1] = useState(false);
  const [showAchievement2, setShowAchievement2] = useState(false);
  const [showAchievement3, setShowAchievement3] = useState(false);
  const [progress, setProgress] = useState(45);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Celebrations & Achievements</h3>
      
      {/* Confetti & Toast */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Confetti & Toast</p>
        <div className="flex gap-4">
          <Button onClick={() => { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); }}>
            <Sparkles className="w-4 h-4 mr-2" />
            Celebrar!
          </Button>
          <Button variant="outline" onClick={() => { setShowToast(true); setTimeout(() => setShowToast(false), 3000); }}>
            <Trophy className="w-4 h-4 mr-2" />
            Toast
          </Button>
        </div>
        <Confetti isActive={showConfetti} />
        <CelebrationToast 
          isVisible={showToast} 
          title="Conquista Desbloqueada!" 
          message="Você completou sua primeira meta."
          icon="trophy"
          onClose={() => setShowToast(false)}
        />
      </div>

      {/* Achievement Badges */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Achievement Badges</p>
        <div className="flex gap-4 flex-wrap">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => { setShowAchievement1(true); setTimeout(() => setShowAchievement1(false), 3000); }}
          >
            Mostrar Badge 1
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => { setShowAchievement2(true); setTimeout(() => setShowAchievement2(false), 3000); }}
          >
            Mostrar Badge 2
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => { setShowAchievement3(true); setTimeout(() => setShowAchievement3(false), 3000); }}
          >
            Mostrar Badge 3
          </Button>
        </div>
        <AchievementBadge
          isVisible={showAchievement1}
          title="Primeira Produção"
          subtitle="Complete 1 trabalho"
          icon={<Star className="w-6 h-6" />}
          color="from-yellow-400 to-orange-500"
        />
        <AchievementBadge
          isVisible={showAchievement2}
          title="Eficiência Master"
          subtitle="90%+ OEE"
          icon={<Zap className="w-6 h-6" />}
          color="from-blue-400 to-purple-500"
        />
        <AchievementBadge
          isVisible={showAchievement3}
          title="Zero Defeitos"
          subtitle="100% qualidade"
          icon={<Heart className="w-6 h-6" />}
          color="from-pink-400 to-red-500"
        />
      </div>

      {/* Progress Milestones */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Progress Milestones</p>
        <div className="max-w-md space-y-3">
          <ProgressMilestone 
            current={progress}
            total={100}
            milestones={[25, 50, 75, 100]}
            onMilestone={(m) => console.log('Milestone reached:', m)}
          />
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setProgress(Math.max(0, progress - 10))}>
              -10%
            </Button>
            <Button size="sm" variant="outline" onClick={() => setProgress(Math.min(100, progress + 10))}>
              +10%
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingShowcase() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Loading States</h3>
      
      {/* Shimmer */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Shimmer Effect</p>
        <Shimmer className="h-8 w-48" />
      </div>

      {/* Skeleton Components */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Stats Card Skeleton</p>
        <div className="grid grid-cols-3 gap-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Card Skeleton</p>
        <div className="grid grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Chart Skeleton</p>
        <ChartSkeleton />
      </div>
    </div>
  );
}

// ============= MAIN SHOWCASE COMPONENT =============

export function ComponentShowcase() {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          <ShimmerText text="Component Showcase" speed="slow" />
        </h1>
        <p className="text-muted-foreground">
          Biblioteca completa de componentes UI/UX avançados
        </p>
      </div>

      <Tabs defaultValue="empty" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="empty">Empty States</TabsTrigger>
          <TabsTrigger value="polish">Visual Polish</TabsTrigger>
          <TabsTrigger value="dataviz">Data Viz</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="celebrations">Celebrations</TabsTrigger>
          <TabsTrigger value="loading">Loading</TabsTrigger>
        </TabsList>

        <TabsContent value="empty" className="mt-6">
          <EmptyStatesShowcase />
        </TabsContent>

        <TabsContent value="polish" className="mt-6">
          <PolishShowcase />
        </TabsContent>

        <TabsContent value="dataviz" className="mt-6">
          <DataVizShowcase />
        </TabsContent>

        <TabsContent value="interactions" className="mt-6">
          <InteractionsShowcase />
        </TabsContent>

        <TabsContent value="celebrations" className="mt-6">
          <CelebrationShowcase />
        </TabsContent>

        <TabsContent value="loading" className="mt-6">
          <LoadingShowcase />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ComponentShowcase;
