import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CodeBlock } from '@/components/ui/code-block';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Check, ChevronRight, Coins, Copy, Layers, LayoutGrid, Play, Plus, Sparkles, Square, Star, TrendingUp, Wand2, Zap, Edit, MessageSquare, TableIcon, Tag, Activity, Type, Ruler, Palette, Bell, Loader2, Package, AlertCircle, Sun, Navigation as NavigationIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

interface OverviewSectionProps {
  onNavigate: (tabId: string) => void;
}

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  velocity: number;
  size: number;
  rotation: number;
  shape: string;
  duration: number;
}

const confettiShapes = ['circle', 'square', 'triangle', 'star', 'heart'];

const getConfettiShapeStyle = (shape: string, size: number, color: string): React.CSSProperties => {
  switch (shape) {
    case 'square':
      return { width: size, height: size, backgroundColor: color, borderRadius: 2 };
    case 'triangle':
      return { width: 0, height: 0, borderLeft: `${size/2}px solid transparent`, borderRight: `${size/2}px solid transparent`, borderBottom: `${size}px solid ${color}`, backgroundColor: 'transparent' };
    case 'star':
      return { width: size, height: size, backgroundColor: color, clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' };
    case 'heart':
      return { width: size, height: size, backgroundColor: color, clipPath: 'polygon(50% 85%, 15% 55%, 0% 35%, 5% 15%, 20% 5%, 35% 5%, 50% 20%, 65% 5%, 80% 5%, 95% 15%, 100% 35%, 85% 55%)' };
    default:
      return { width: size, height: size, backgroundColor: color, borderRadius: '50%' };
  }
};

export function OverviewSection({ onNavigate }: OverviewSectionProps) {
  const [animatedValues, setAnimatedValues] = useState({ categories: 0, components: 0, variants: 0, copiable: 0 });
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const [explosionFlash, setExplosionFlash] = useState<{ id: number; x: number; y: number } | null>(null);

  const confettiColors = [
    'hsl(var(--primary))',
    'hsl(var(--success))',
    'hsl(var(--warning))',
    'hsl(var(--info))',
    'hsl(var(--destructive))',
    '#FFD700',
    '#FF6B6B',
    '#4ECDC4',
    '#A855F7',
    '#F472B6',
  ];

  const handleRipple = (e: React.MouseEvent<HTMLDivElement>, color: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { id, x, y, color }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);

    // Generate confetti particles
    const particles: ConfettiParticle[] = [];
    const particleCount = 40;
    
    for (let i = 0; i < particleCount; i++) {
      // Vary velocity more dramatically for organic movement
      const baseVelocity = 50 + Math.random() * 120;
      const velocityVariation = Math.random() > 0.7 ? 1.5 : 1; // Some particles go faster
      
      particles.push({
        id: id + i,
        x,
        y,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        angle: (Math.PI * 2 / particleCount) * i + (Math.random() - 0.5) * 0.8,
        velocity: baseVelocity * velocityVariation,
        size: 3 + Math.random() * 8,
        rotation: Math.random() * 360,
        shape: confettiShapes[Math.floor(Math.random() * confettiShapes.length)],
        duration: 0.8 + Math.random() * 0.8, // 0.8s to 1.6s
      });
    }
    
    setConfetti(prev => [...prev, ...particles]);
    
    // Trigger explosion flash
    setExplosionFlash({ id, x, y });
    setTimeout(() => setExplosionFlash(null), 400);
    
    // Play confetti sound
    playConfettiSound();
    
    setTimeout(() => {
      setConfetti(prev => prev.filter(p => p.id < id || p.id >= id + particleCount));
    }, 1600);
  };

  const playConfettiSound = () => {
    try {
      const windowWithWebkit = window as Window & { webkitAudioContext?: typeof AudioContext };
      const AudioContextClass = window.AudioContext || windowWithWebkit.webkitAudioContext;
      if (!AudioContextClass) return;
      
      const audioContext = new AudioContextClass();
      const now = audioContext.currentTime;
      
      // Create multiple quick ascending notes for celebration effect
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      
      notes.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(freq, now + i * 0.04);
        
        gainNode.gain.setValueAtTime(0, now + i * 0.04);
        gainNode.gain.linearRampToValueAtTime(0.15, now + i * 0.04 + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.2);
        
        oscillator.start(now + i * 0.04);
        oscillator.stop(now + i * 0.04 + 0.25);
      });
      
      // Add a sparkle effect with high frequency
      for (let i = 0; i < 6; i++) {
        const sparkle = audioContext.createOscillator();
        const sparkleGain = audioContext.createGain();
        
        sparkle.connect(sparkleGain);
        sparkleGain.connect(audioContext.destination);
        
        sparkle.type = 'sine';
        sparkle.frequency.setValueAtTime(2000 + Math.random() * 2000, now + i * 0.05);
        
        sparkleGain.gain.setValueAtTime(0, now + i * 0.05);
        sparkleGain.gain.linearRampToValueAtTime(0.05, now + i * 0.05 + 0.01);
        sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.15);
        
        sparkle.start(now + i * 0.05);
        sparkle.stop(now + i * 0.05 + 0.2);
      }
    } catch (e) {
      if (import.meta.env.DEV) console.log('Audio not supported');
    }
  };

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    
    const targets = { categories: 20, components: 150, variants: 50, copiable: 100 };
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Bounce easing function
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      // Add overshoot for bounce effect at the end
      const bounceProgress = progress >= 0.8 
        ? 1 + Math.sin((progress - 0.8) * 5 * Math.PI) * 0.1 * (1 - progress) * 5
        : eased;
      
      const finalProgress = Math.min(1, Math.max(0, progress >= 0.95 ? 1 : bounceProgress));
      
      setAnimatedValues({
        categories: Math.round(targets.categories * finalProgress),
        components: Math.round(targets.components * finalProgress),
        variants: Math.round(targets.variants * finalProgress),
        copiable: Math.round(targets.copiable * finalProgress),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const categories = [
    { id: 'buttons', icon: Zap, title: 'Botões', description: '12 variantes de botões incluindo gradient, glow e premium', count: 12 },
    { id: 'forms', icon: Edit, title: 'Formulários', description: 'Inputs, selects, checkboxes, radio buttons e mais', count: 8 },
    { id: 'modals', icon: Layers, title: 'Modais', description: 'Dialog, AlertDialog, Sheet e Drawer', count: 4 },
    { id: 'tooltips', icon: MessageSquare, title: 'Tooltips', description: 'Tooltips, Popovers e HoverCards', count: 3 },
    { id: 'tables', icon: TableIcon, title: 'Tabelas', description: 'Tabelas com zebra, badges, ações e paginação', count: 5 },
    { id: 'navigation', icon: NavigationIcon, title: 'Navegação', description: 'Breadcrumbs, Tabs, Navigation Menu', count: 4 },
    { id: 'cards', icon: Square, title: 'Cards', description: '8 variantes incluindo stat, premium e glass', count: 8 },
    { id: 'badges', icon: Tag, title: 'Badges', description: 'Status badges com variantes coloridas', count: 6 },
    { id: 'progress', icon: Activity, title: 'Progress', description: 'Barras de progresso com variantes', count: 4 },
    { id: 'icons', icon: Sparkles, title: 'Ícones', description: 'Biblioteca completa de ícones Lucide', count: 150 },
    { id: 'typography', icon: Type, title: 'Tipografia', description: 'Hierarquia tipográfica e fontes', count: 6 },
    { id: 'spacing', icon: Ruler, title: 'Spacing', description: 'Escala de espaçamentos e gaps', count: 12 },
    { id: 'shadows', icon: Layers, title: 'Sombras', description: 'Sombras e elevações para cards', count: 5 },
    { id: 'animations', icon: Play, title: 'Animações', description: 'Entry, hover, stagger, glow e interativas', count: 26 },
    { id: 'colors', icon: Palette, title: 'Cores', description: 'Paleta de cores semânticas do sistema', count: 16 },
    { id: 'feedback', icon: Bell, title: 'Feedback', description: 'Alerts, Toasts e Skeletons', count: 6 },
    { id: 'loading', icon: Loader2, title: 'Loading', description: 'Spinners, progress e estados de loading', count: 5 },
    { id: 'empty', icon: Package, title: 'Empty States', description: 'Estados vazios com CTAs e ilustrações', count: 8 },
    { id: 'errors', icon: AlertCircle, title: 'Error States', description: 'Páginas de erro HTTP e inline', count: 10 },
    { id: 'theme', icon: Sun, title: 'Theme Toggle', description: 'Alternador de tema com animações', count: 2 },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${Math.random() * 12 + 6}px`,
              height: `${Math.random() * 12 + 6}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `hsl(var(--${['primary', 'success', 'warning', 'info'][i % 4]}))`,
              opacity: 0.15 + Math.random() * 0.15,
              filter: `blur(${Math.random() * 2 + 1}px)`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="stat" className="hover-lift-sm group relative overflow-hidden cursor-pointer" onClick={(e) => handleRipple(e, 'primary')}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 bg-[length:200%_200%] animate-[gradient-shift_4s_ease_infinite]" />
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {ripples.filter(r => r.color === 'primary').map(ripple => (
            <span
              key={ripple.id}
              className="absolute rounded-full bg-primary/30 animate-ripple pointer-events-none"
              style={{ left: ripple.x, top: ripple.y, width: 20, height: 20, marginLeft: -10, marginTop: -10 }}
            />
          ))}
          {explosionFlash && (
            <>
              <span
                className="absolute rounded-full bg-white pointer-events-none animate-explosion-flash z-10"
                style={{ left: explosionFlash.x, top: explosionFlash.y, width: 20, height: 20 }}
              />
              <span
                className="absolute rounded-full border-white/60 pointer-events-none animate-shockwave z-10"
                style={{ left: explosionFlash.x, top: explosionFlash.y, width: 40, height: 40, borderStyle: 'solid' }}
              />
              <span
                className="absolute rounded-full border-primary/40 pointer-events-none animate-shockwave z-10"
                style={{ left: explosionFlash.x, top: explosionFlash.y, width: 60, height: 60, borderStyle: 'solid', animationDelay: '0.1s' }}
              />
            </>
          )}
          {confetti.map(particle => (
            <span
              key={particle.id}
              className="absolute pointer-events-none"
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.shape === 'star' ? 'transparent' : particle.color,
                color: particle.color,
                transform: `translate(-50%, -50%)`,
                animation: `confetti-burst ${particle.duration}s ease-out forwards`,
                '--confetti-x': `${Math.cos(particle.angle) * particle.velocity}px`,
                '--confetti-y': `${Math.sin(particle.angle) * particle.velocity - 50}px`,
                '--confetti-rotation': `${particle.rotation + 720}deg`,
                '--confetti-glow': particle.color,
                ...getConfettiShapeStyle(particle.shape, particle.size, particle.color),
              } as React.CSSProperties}
            />
          ))}
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
                <LayoutGrid className="h-5 w-5 text-primary transition-transform duration-300 group-hover:rotate-12" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary tabular-nums drop-shadow-[0_0_10px_hsl(var(--primary)/0.5)] animate-[glow-pulse_2s_ease-in-out_infinite]">{animatedValues.categories}</div>
                <p className="text-xs text-muted-foreground">Categorias</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stat" className="hover-lift-sm group relative overflow-hidden cursor-pointer" onClick={(e) => handleRipple(e, 'success')}>
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-success/10 bg-[length:200%_200%] animate-[gradient-shift_4s_ease_infinite]" />
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {ripples.filter(r => r.color === 'success').map(ripple => (
            <span
              key={ripple.id}
              className="absolute rounded-full bg-success/30 animate-ripple pointer-events-none"
              style={{ left: ripple.x, top: ripple.y, width: 20, height: 20, marginLeft: -10, marginTop: -10 }}
            />
          ))}
          {explosionFlash && (
            <>
              <span
                className="absolute rounded-full bg-white pointer-events-none animate-explosion-flash z-10"
                style={{ left: explosionFlash.x, top: explosionFlash.y, width: 20, height: 20 }}
              />
              <span
                className="absolute rounded-full border-white/60 pointer-events-none animate-shockwave z-10"
                style={{ left: explosionFlash.x, top: explosionFlash.y, width: 40, height: 40, borderStyle: 'solid' }}
              />
              <span
                className="absolute rounded-full border-success/40 pointer-events-none animate-shockwave z-10"
                style={{ left: explosionFlash.x, top: explosionFlash.y, width: 60, height: 60, borderStyle: 'solid', animationDelay: '0.1s' }}
              />
            </>
          )}
          {confetti.map(particle => (
            <span
              key={particle.id}
              className="absolute pointer-events-none"
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.shape === 'star' ? 'transparent' : particle.color,
                color: particle.color,
                transform: `translate(-50%, -50%)`,
                animation: `confetti-burst ${particle.duration}s ease-out forwards`,
                '--confetti-x': `${Math.cos(particle.angle) * particle.velocity}px`,
                '--confetti-y': `${Math.sin(particle.angle) * particle.velocity - 50}px`,
                '--confetti-rotation': `${particle.rotation + 720}deg`,
                '--confetti-glow': particle.color,
                ...getConfettiShapeStyle(particle.shape, particle.size, particle.color),
              } as React.CSSProperties}
            />
          ))}
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_hsl(var(--success)/0.4)]">
                <Layers className="h-5 w-5 text-success transition-transform duration-300 group-hover:rotate-12" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success tabular-nums drop-shadow-[0_0_10px_hsl(var(--success)/0.5)] animate-[glow-pulse_2s_ease-in-out_infinite]">{animatedValues.components}+</div>
                <p className="text-xs text-muted-foreground">Componentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stat" className="hover-lift-sm group relative overflow-hidden cursor-pointer" onClick={(e) => handleRipple(e, 'warning')}>
          <div className="absolute inset-0 bg-gradient-to-br from-warning/5 via-transparent to-warning/10 bg-[length:200%_200%] animate-[gradient-shift_4s_ease_infinite]" />
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {ripples.filter(r => r.color === 'warning').map(ripple => (
            <span
              key={ripple.id}
              className="absolute rounded-full bg-warning/30 animate-ripple pointer-events-none"
              style={{ left: ripple.x, top: ripple.y, width: 20, height: 20, marginLeft: -10, marginTop: -10 }}
            />
          ))}
          {explosionFlash && (
            <>
              <span
                className="absolute rounded-full bg-white pointer-events-none animate-explosion-flash z-10"
                style={{ left: explosionFlash.x, top: explosionFlash.y, width: 20, height: 20 }}
              />
              <span
                className="absolute rounded-full border-white/60 pointer-events-none animate-shockwave z-10"
                style={{ left: explosionFlash.x, top: explosionFlash.y, width: 40, height: 40, borderStyle: 'solid' }}
              />
              <span
                className="absolute rounded-full border-warning/40 pointer-events-none animate-shockwave z-10"
                style={{ left: explosionFlash.x, top: explosionFlash.y, width: 60, height: 60, borderStyle: 'solid', animationDelay: '0.1s' }}
              />
            </>
          )}
          {explosionFlash && (
            <>
              <span
                className="absolute rounded-full bg-white pointer-events-none animate-explosion-flash z-10"
                style={{ left: explosionFlash.x, top: explosionFlash.y, width: 20, height: 20 }}
              />
              <span
                className="absolute rounded-full border-white/60 pointer-events-none animate-shockwave z-10"
                style={{ left: explosionFlash.x, top: explosionFlash.y, width: 40, height: 40, borderStyle: 'solid' }}
              />
              <span
                className="absolute rounded-full border-info/40 pointer-events-none animate-shockwave z-10"
                style={{ left: explosionFlash.x, top: explosionFlash.y, width: 60, height: 60, borderStyle: 'solid', animationDelay: '0.1s' }}
              />
            </>
          )}
          {confetti.map(particle => (
            <span
              key={particle.id}
              className="absolute pointer-events-none"
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.shape === 'star' ? 'transparent' : particle.color,
                color: particle.color,
                transform: `translate(-50%, -50%)`,
                animation: `confetti-burst ${particle.duration}s ease-out forwards`,
                '--confetti-x': `${Math.cos(particle.angle) * particle.velocity}px`,
                '--confetti-y': `${Math.sin(particle.angle) * particle.velocity - 50}px`,
                '--confetti-rotation': `${particle.rotation + 720}deg`,
                '--confetti-glow': particle.color,
                ...getConfettiShapeStyle(particle.shape, particle.size, particle.color),
              } as React.CSSProperties}
            />
          ))}
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_hsl(var(--warning)/0.4)]">
                <Sparkles className="h-5 w-5 text-warning transition-transform duration-300 group-hover:rotate-12" />
              </div>
              <div>
                <div className="text-2xl font-bold text-warning tabular-nums drop-shadow-[0_0_10px_hsl(var(--warning)/0.5)] animate-[glow-pulse_2s_ease-in-out_infinite]">{animatedValues.variants}+</div>
                <p className="text-xs text-muted-foreground">Variantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="stat" className="hover-lift-sm group relative overflow-hidden cursor-pointer" onClick={(e) => handleRipple(e, 'info')}>
          <div className="absolute inset-0 bg-gradient-to-br from-info/5 via-transparent to-info/10 bg-[length:200%_200%] animate-[gradient-shift_4s_ease_infinite]" />
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {ripples.filter(r => r.color === 'info').map(ripple => (
            <span
              key={ripple.id}
              className="absolute rounded-full bg-info/30 animate-ripple pointer-events-none"
              style={{ left: ripple.x, top: ripple.y, width: 20, height: 20, marginLeft: -10, marginTop: -10 }}
            />
          ))}
          {confetti.map(particle => (
            <span
              key={particle.id}
              className="absolute pointer-events-none"
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.shape === 'star' ? 'transparent' : particle.color,
                color: particle.color,
                transform: `translate(-50%, -50%)`,
                animation: `confetti-burst ${particle.duration}s ease-out forwards`,
                '--confetti-x': `${Math.cos(particle.angle) * particle.velocity}px`,
                '--confetti-y': `${Math.sin(particle.angle) * particle.velocity - 50}px`,
                '--confetti-rotation': `${particle.rotation + 720}deg`,
                '--confetti-glow': particle.color,
                ...getConfettiShapeStyle(particle.shape, particle.size, particle.color),
              } as React.CSSProperties}
            />
          ))}
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-info/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_hsl(var(--info)/0.4)]">
                <Copy className="h-5 w-5 text-info transition-transform duration-300 group-hover:rotate-12" />
              </div>
              <div>
                <div className="text-2xl font-bold text-info tabular-nums drop-shadow-[0_0_10px_hsl(var(--info)/0.5)] animate-[glow-pulse_2s_ease-in-out_infinite]">{animatedValues.copiable}%</div>
                <p className="text-xs text-muted-foreground">Copiável</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* What's New Section */}
      <Card variant="glass" className="border-primary/20 relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-success/10 to-transparent rounded-tr-full" />
        <CardHeader className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              Novidades
              <Badge 
                variant="default" 
                className="ml-2 text-xs animate-scale-in relative overflow-hidden group/badge" 
                style={{ animationDelay: '300ms' }}
              >
                {/* Shimmer effect */}
                <span className="absolute inset-0 -translate-x-full group-hover/badge:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                {/* Glow pulse animation */}
                <span className="absolute inset-0 rounded-md animate-[glow-pulse_2s_ease-in-out_infinite] opacity-60" style={{ boxShadow: '0 0 12px hsl(var(--primary) / 0.6)' }} />
                <span className="relative z-10">v2.0</span>
              </Badge>
            </CardTitle>
            <span className="text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '400ms' }}>Dezembro 2024</span>
          </div>
          <CardDescription className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            Últimas adições e melhorias no Design System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative">
          {/* New Variants */}
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-success" />
              Novas Variantes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Card Variants */}
              <div className="p-3 rounded-lg bg-card/50 border border-border/50 space-y-2 animate-fade-in hover-lift-sm transition-all" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center gap-2">
                  <Square className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Cards</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs animate-scale-in" style={{ animationDelay: '500ms' }}>
                    <code>stat</code> - KPIs e dashboards
                  </Badge>
                  <Badge variant="outline" className="text-xs animate-scale-in" style={{ animationDelay: '550ms' }}>
                    <code>premium</code> - Destaque dourado
                  </Badge>
                </div>
              </div>
              
              {/* Button Variants */}
              <div className="p-3 rounded-lg bg-card/50 border border-border/50 space-y-2 animate-fade-in hover-lift-sm transition-all" style={{ animationDelay: '450ms' }}>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-warning" />
                  <span className="text-sm font-medium">Botões</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs animate-scale-in" style={{ animationDelay: '600ms' }}>
                    <code>warning</code> - Alertas
                  </Badge>
                  <Badge variant="outline" className="text-xs animate-scale-in" style={{ animationDelay: '650ms' }}>
                    <code>subtle</code> - Discreto
                  </Badge>
                  <Badge variant="outline" className="text-xs animate-scale-in" style={{ animationDelay: '700ms' }}>
                    <code>icon-xs</code> - Ícone mini
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Animation Variants */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 space-y-2 animate-fade-in hover-lift-sm transition-all" style={{ animationDelay: '500ms' }}>
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-primary animate-bounce-attention" />
                <span className="text-sm font-medium">Novas Animações</span>
                <Badge className="text-xs bg-primary/20 text-primary border-primary/30 wiggle-infinite">TASK GIFTS</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs animate-scale-in" style={{ animationDelay: '600ms' }}>
                  <code>bounce-in</code>
                </Badge>
                <Badge variant="outline" className="text-xs animate-scale-in" style={{ animationDelay: '650ms' }}>
                  <code>wiggle</code>
                </Badge>
                <Badge variant="outline" className="text-xs animate-scale-in" style={{ animationDelay: '700ms' }}>
                  <code>pulse-ring</code>
                </Badge>
                <Badge variant="outline" className="text-xs animate-scale-in" style={{ animationDelay: '750ms' }}>
                  <code>bounce-attention</code>
                </Badge>
                <Badge variant="outline" className="text-xs animate-scale-in" style={{ animationDelay: '800ms' }}>
                  <code>pop</code>
                </Badge>
                <Badge variant="outline" className="text-xs animate-scale-in" style={{ animationDelay: '850ms' }}>
                  <code>press-scale</code>
                </Badge>
              </div>
            </div>
          </div>

          {/* Design Improvements */}
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-info" />
              Melhorias de Design
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                'Light mode com tons mais quentes',
                'Dark mode refinado com glows',
                'Transições de tema cinematográficas',
                'Typography com Outfit para headers',
                'Focus states elegantes com glow',
                'Melhor contraste de texto secundário',
              ].map((item, index) => (
                <div 
                  key={item}
                  className="flex items-center gap-2 text-xs text-muted-foreground animate-fade-in"
                  style={{ animationDelay: `${600 + index * 80}ms` }}
                >
                  <Check className="h-3 w-3 text-success shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* New Utilities */}
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: '800ms' }}>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-accent" />
              Novas Utilities
            </h4>
            <div className="flex flex-wrap gap-2">
              {[
                '.animate-bounce-in',
                '.wiggle-infinite',
                '.pulse-ring',
                '.animate-bounce-attention',
                '.animate-pop',
                '.press-scale',
                '.hover-lift-sm',
                '.hover-scale',
                '.gradient-text-success',
              ].map((utility, index) => (
                <code 
                  key={utility}
                  className="text-xs bg-muted px-2 py-1 rounded animate-scale-in hover:bg-primary/20 transition-colors cursor-default"
                  style={{ animationDelay: `${900 + index * 60}ms` }}
                >
                  {utility}
                </code>
              ))}
            </div>
          </div>

          {/* Quick Preview */}
          <div className="pt-3 border-t border-border/50 animate-fade-in" style={{ animationDelay: '1100ms' }}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-muted-foreground">Preview:</span>
              <Card variant="stat" className="p-2 inline-flex items-center gap-2 animate-bounce-in hover-lift-sm" style={{ animationDelay: '1200ms' }}>
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-xs font-medium">Stat Card</span>
              </Card>
              <Card variant="premium" className="p-2 inline-flex items-center gap-2 animate-bounce-in hover-lift-sm" style={{ animationDelay: '1250ms' }}>
                <Coins className="h-3 w-3 text-amber-500" />
                <span className="text-xs font-medium">Premium</span>
              </Card>
              <div className="flex items-center gap-1.5 animate-fade-in" style={{ animationDelay: '1300ms' }}>
                <span className="h-2 w-2 rounded-full bg-success pulse-ring" />
                <span className="text-xs text-success">Online</span>
              </div>
              <Badge className="animate-pop wiggle-infinite bg-warning/20 text-warning border-warning/30" style={{ animationDelay: '1350ms' }}>Urgente</Badge>
              <Button variant="warning" size="sm" className="animate-scale-in" style={{ animationDelay: '1400ms' }}>Warning</Button>
              <Button size="icon-xs" variant="outline" className="animate-scale-in" style={{ animationDelay: '1450ms' }}><Star className="h-3 w-3" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Categorias do Design System
          </CardTitle>
          <CardDescription>
            Clique em qualquer card abaixo para navegar diretamente para a categoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  onClick={() => onNavigate(category.id)}
                  className="group relative p-4 rounded-xl bg-card/50 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer hover-lift-sm animate-fade-in before:absolute before:inset-0 before:rounded-xl before:p-[1px] before:bg-border before:transition-all before:duration-300 hover:before:bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--accent)),hsl(var(--primary)))] hover:before:bg-[length:200%_200%] hover:before:animate-[gradient-shift_2s_ease_infinite] before:-z-10 after:absolute after:inset-[1px] after:rounded-[11px] after:bg-card/50 group-hover:after:bg-primary/5 after:transition-all after:duration-300 after:-z-10"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-300">
                      <Icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-125 group-hover:animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium text-sm truncate">{category.title}</h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            {category.count}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Start */}
      <Card variant="premium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-amber-500" />
            Como Usar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">1</div>
              <div>
                <h4 className="font-medium text-sm">Navegue pelas abas</h4>
                <p className="text-xs text-muted-foreground mt-1">Explore cada categoria usando o menu de abas acima</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">2</div>
              <div>
                <h4 className="font-medium text-sm">Visualize exemplos</h4>
                <p className="text-xs text-muted-foreground mt-1">Veja os componentes renderizados com suas variantes</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">3</div>
              <div>
                <h4 className="font-medium text-sm">Copie o código</h4>
                <p className="text-xs text-muted-foreground mt-1">Use os CodeBlocks para copiar e colar no seu projeto</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
