import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { CardContent } from '@/components/ui/card';

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

const confettiColors = [
  'hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))',
  'hsl(var(--info))', 'hsl(var(--destructive))', '#FFD700', '#FF6B6B',
  '#4ECDC4', '#A855F7', '#F472B6',
];

const getConfettiShapeStyle = (shape: string, size: number, color: string): React.CSSProperties => {
  switch (shape) {
    case 'square': return { width: size, height: size, backgroundColor: color, borderRadius: 2 };
    case 'triangle': return { width: 0, height: 0, borderLeft: `${size/2}px solid transparent`, borderRight: `${size/2}px solid transparent`, borderBottom: `${size}px solid ${color}`, backgroundColor: 'transparent' };
    case 'star': return { width: size, height: size, backgroundColor: color, clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' };
    case 'heart': return { width: size, height: size, backgroundColor: color, clipPath: 'polygon(50% 85%, 15% 55%, 0% 35%, 5% 15%, 20% 5%, 35% 5%, 50% 20%, 65% 5%, 80% 5%, 95% 15%, 100% 35%, 85% 55%)' };
    default: return { width: size, height: size, backgroundColor: color, borderRadius: '50%' };
  }
};

const playConfettiSound = () => {
  try {
    const windowWithWebkit = window as Window & { webkitAudioContext?: typeof AudioContext };
    const AudioContextClass = window.AudioContext || windowWithWebkit.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();
    const now = audioContext.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
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
  } catch {
    if (import.meta.env.DEV) console.log('Audio not supported');
  }
};

interface OverviewStatCardProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  colorToken: string;
}

export function OverviewStatCard({ icon: Icon, value, label, colorToken }: OverviewStatCardProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const [explosionFlash, setExplosionFlash] = useState<{ id: number; x: number; y: number } | null>(null);

  const handleRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);

    const particles: ConfettiParticle[] = [];
    for (let i = 0; i < 40; i++) {
      const baseVelocity = 50 + Math.random() * 120;
      const velocityVariation = Math.random() > 0.7 ? 1.5 : 1;
      particles.push({
        id: id + i, x, y,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        angle: (Math.PI * 2 / 40) * i + (Math.random() - 0.5) * 0.8,
        velocity: baseVelocity * velocityVariation,
        size: 3 + Math.random() * 8,
        rotation: Math.random() * 360,
        shape: confettiShapes[Math.floor(Math.random() * confettiShapes.length)],
        duration: 0.8 + Math.random() * 0.8,
      });
    }
    setConfetti(prev => [...prev, ...particles]);
    setExplosionFlash({ id, x, y });
    setTimeout(() => setExplosionFlash(null), 400);
    playConfettiSound();
    setTimeout(() => setConfetti(prev => prev.filter(p => p.id < id || p.id >= id + 40)), 1600);
  };

  return (
    <Card variant="stat" className="hover-lift-sm group relative overflow-hidden cursor-pointer" onClick={handleRipple}>
      <div className={`absolute inset-0 bg-gradient-to-br from-${colorToken}/5 via-transparent to-${colorToken}/10 bg-[length:200%_200%] animate-[gradient-shift_4s_ease_infinite]`} />
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {ripples.map(ripple => (
        <span key={ripple.id} className={`absolute rounded-full bg-${colorToken}/30 animate-ripple pointer-events-none`} style={{ left: ripple.x, top: ripple.y, width: 20, height: 20, marginLeft: -10, marginTop: -10 }} />
      ))}
      {explosionFlash && (
        <>
          <span className="absolute rounded-full bg-white pointer-events-none animate-explosion-flash z-10" style={{ left: explosionFlash.x, top: explosionFlash.y, width: 20, height: 20 }} />
          <span className="absolute rounded-full border-white/60 pointer-events-none animate-shockwave z-10" style={{ left: explosionFlash.x, top: explosionFlash.y, width: 40, height: 40, borderStyle: 'solid' }} />
          <span className={`absolute rounded-full border-${colorToken}/40 pointer-events-none animate-shockwave z-10`} style={{ left: explosionFlash.x, top: explosionFlash.y, width: 60, height: 60, borderStyle: 'solid', animationDelay: '0.1s' }} />
        </>
      )}
      {confetti.map(particle => (
        <span key={particle.id} className="absolute pointer-events-none" style={{
          left: particle.x, top: particle.y, width: particle.size, height: particle.size,
          backgroundColor: particle.shape === 'star' ? 'transparent' : particle.color,
          color: particle.color, transform: `translate(-50%, -50%)`,
          animation: `confetti-burst ${particle.duration}s ease-out forwards`,
          '--confetti-x': `${Math.cos(particle.angle) * particle.velocity}px`,
          '--confetti-y': `${Math.sin(particle.angle) * particle.velocity - 50}px`,
          '--confetti-rotation': `${particle.rotation + 720}deg`,
          '--confetti-glow': particle.color,
          ...getConfettiShapeStyle(particle.shape, particle.size, particle.color),
        } as React.CSSProperties} />
      ))}
      <CardContent className="p-4 relative">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg bg-${colorToken}/10 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_hsl(var(--${colorToken})/0.4)]`}>
            <Icon className={`h-5 w-5 text-${colorToken} transition-transform duration-300 group-hover:rotate-12`} />
          </div>
          <div>
            <div className={`text-2xl font-bold text-${colorToken} tabular-nums drop-shadow-[0_0_10px_hsl(var(--${colorToken})/0.5)] animate-[glow-pulse_2s_ease-in-out_infinite]`}>{value}</div>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
