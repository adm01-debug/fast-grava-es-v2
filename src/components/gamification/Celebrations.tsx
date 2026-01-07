import React, { useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Sparkles, PartyPopper, Zap, Award, Crown, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// CONFETTI EFFECTS
// ============================================

type ConfettiPreset = 'default' | 'fireworks' | 'stars' | 'celebration' | 'achievement' | 'subtle';

interface ConfettiOptions {
  preset?: ConfettiPreset;
  colors?: string[];
  duration?: number;
  particleCount?: number;
}

export function useConfetti() {
  const fire = useCallback((options: ConfettiOptions = {}) => {
    const {
      preset = 'default',
      colors = ['#6366f1', '#8b5cf6', '#a855f7', '#22c55e', '#eab308'],
      duration = 3000,
      particleCount = 100,
    } = options;

    switch (preset) {
      case 'fireworks':
        fireFireworks(colors, duration);
        break;
      case 'stars':
        fireStars(colors);
        break;
      case 'celebration':
        fireCelebration(colors, duration);
        break;
      case 'achievement':
        fireAchievement(colors);
        break;
      case 'subtle':
        fireSubtle(colors);
        break;
      default:
        fireDefault(colors, particleCount);
    }
  }, []);

  return { fire };
}

// Default burst
function fireDefault(colors: string[], particleCount: number) {
  confetti({
    particleCount,
    spread: 70,
    origin: { y: 0.6 },
    colors,
  });
}

// Fireworks effect
function fireFireworks(colors: string[], duration: number) {
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random() * 0.4 + 0.1, y: Math.random() - 0.2 },
      colors,
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: Math.random() * 0.4 + 0.5, y: Math.random() - 0.2 },
      colors,
    });
  }, 250);
}

// Stars effect
function fireStars(colors: string[]) {
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    shapes: ['star'] as confetti.Shape[],
    colors,
  };

  confetti({ ...defaults, particleCount: 40, scalar: 1.2 });
  confetti({ ...defaults, particleCount: 10, scalar: 0.75 });
}

// Big celebration
function fireCelebration(colors: string[], duration: number) {
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// Achievement unlock
function fireAchievement(colors: string[]) {
  const count = 200;
  const defaults = { origin: { y: 0.7 } };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      colors,
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

// Subtle effect
function fireSubtle(colors: string[]) {
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { y: 0.7 },
    colors,
    scalar: 0.8,
    gravity: 1.2,
  });
}

// ============================================
// CELEBRATION OVERLAY COMPONENT
// ============================================

interface CelebrationOverlayProps {
  isVisible: boolean;
  onComplete?: () => void;
  type?: 'achievement' | 'levelUp' | 'milestone' | 'streak';
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  points?: number;
}

export function CelebrationOverlay({
  isVisible,
  onComplete,
  type = 'achievement',
  title,
  subtitle,
  icon,
  points,
}: CelebrationOverlayProps) {
  const { fire } = useConfetti();

  useEffect(() => {
    if (isVisible) {
      const preset = type === 'levelUp' ? 'fireworks' : type === 'streak' ? 'celebration' : 'achievement';
      fire({ preset });
      
      const timer = setTimeout(() => {
        onComplete?.();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, type, fire, onComplete]);

  const typeConfig = {
    achievement: {
      icon: <Trophy className="w-12 h-12" />,
      gradient: 'from-yellow-400 to-orange-500',
      bgGlow: 'bg-yellow-500/20',
    },
    levelUp: {
      icon: <Crown className="w-12 h-12" />,
      gradient: 'from-purple-400 to-pink-500',
      bgGlow: 'bg-purple-500/20',
    },
    milestone: {
      icon: <Target className="w-12 h-12" />,
      gradient: 'from-blue-400 to-cyan-500',
      bgGlow: 'bg-blue-500/20',
    },
    streak: {
      icon: <Zap className="w-12 h-12" />,
      gradient: 'from-orange-400 to-red-500',
      bgGlow: 'bg-orange-500/20',
    },
  };

  const config = typeConfig[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onComplete}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className={cn(
              "absolute inset-0 blur-3xl rounded-full scale-150",
              config.bgGlow
            )} />

            {/* Card */}
            <div className="relative bg-card/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 text-center max-w-sm">
              {/* Icon */}
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className={cn(
                  "w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center",
                  `bg-gradient-to-br ${config.gradient} text-white shadow-lg`
                )}
              >
                {icon || config.icon}
              </motion.div>

              {/* Points badge */}
              {points && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="absolute -top-4 -right-4 px-4 py-2 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg"
                >
                  +{points}
                </motion.div>
              )}

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                {subtitle && (
                  <p className="text-muted-foreground">{subtitle}</p>
                )}
              </motion.div>

              {/* Sparkles animation */}
              <motion.div
                className="absolute -top-2 -left-2"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              >
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </motion.div>
              <motion.div
                className="absolute -bottom-2 -right-2"
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              >
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// ACHIEVEMENT BADGE
// ============================================

interface AchievementBadgeProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  unlocked?: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export function AchievementBadge({
  icon,
  title,
  description,
  unlocked = true,
  rarity = 'common',
  size = 'md',
  onClick,
  className,
}: AchievementBadgeProps) {
  const rarityConfig = {
    common: {
      gradient: 'from-gray-400 to-gray-500',
      glow: 'shadow-gray-500/30',
      border: 'border-gray-400/30',
    },
    rare: {
      gradient: 'from-blue-400 to-blue-600',
      glow: 'shadow-blue-500/30',
      border: 'border-blue-400/30',
    },
    epic: {
      gradient: 'from-purple-400 to-purple-600',
      glow: 'shadow-purple-500/30',
      border: 'border-purple-400/30',
    },
    legendary: {
      gradient: 'from-yellow-400 to-orange-500',
      glow: 'shadow-yellow-500/30',
      border: 'border-yellow-400/30',
    },
  };

  const sizeConfig = {
    sm: { container: 'w-12 h-12', icon: 'w-6 h-6' },
    md: { container: 'w-16 h-16', icon: 'w-8 h-8' },
    lg: { container: 'w-24 h-24', icon: 'w-12 h-12' },
  };

  const config = rarityConfig[rarity];
  const sizes = sizeConfig[size];

  return (
    <motion.button
      onClick={onClick}
      whileHover={unlocked ? { scale: 1.05 } : {}}
      whileTap={unlocked ? { scale: 0.95 } : {}}
      className={cn(
        "relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
        unlocked ? "cursor-pointer" : "cursor-default opacity-50 grayscale",
        className
      )}
    >
      {/* Badge icon */}
      <div
        className={cn(
          sizes.container,
          "rounded-full flex items-center justify-center",
          unlocked
            ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg ${config.glow}`
            : "bg-muted text-muted-foreground"
        )}
      >
        <div className={sizes.icon}>{icon}</div>
      </div>

      {/* Title */}
      <span className="text-xs font-medium text-center max-w-[80px] truncate">
        {title}
      </span>

      {/* Rarity indicator */}
      {unlocked && rarity !== 'common' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "absolute -top-1 -right-1 w-4 h-4 rounded-full",
            `bg-gradient-to-br ${config.gradient}`
          )}
        >
          <Star className="w-full h-full p-0.5 text-white" />
        </motion.div>
      )}
    </motion.button>
  );
}

// ============================================
// STREAK COUNTER
// ============================================

interface StreakCounterProps {
  count: number;
  label?: string;
  isActive?: boolean;
  className?: string;
}

export function StreakCounter({
  count,
  label = 'dias seguidos',
  isActive = true,
  className,
}: StreakCounterProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl",
        isActive 
          ? "bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20"
          : "bg-muted",
        className
      )}
    >
      <motion.div
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          isActive
            ? "bg-gradient-to-br from-orange-400 to-red-500 text-white"
            : "bg-muted-foreground/20 text-muted-foreground"
        )}
      >
        <Zap className="w-6 h-6" />
      </motion.div>
      
      <div>
        <div className="flex items-baseline gap-1">
          <motion.span
            key={count}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-bold"
          >
            {count}
          </motion.span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        {isActive && (
          <p className="text-xs text-orange-500 font-medium">
            🔥 Continue assim!
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default useConfetti;
