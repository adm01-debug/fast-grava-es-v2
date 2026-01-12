import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Flame, 
  Zap, 
  Trophy, 
  Star,
  TrendingUp,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// ============= XP HEADER BAR =============

interface XPHeaderBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  streak?: number;
  coins?: number;
  className?: string;
  onLevelUp?: () => void;
}

export function XPHeaderBar({
  currentXP,
  maxXP,
  level,
  streak = 0,
  coins = 0,
  className,
  onLevelUp,
}: XPHeaderBarProps) {
  const progress = (currentXP / maxXP) * 100;
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  useEffect(() => {
    if (progress >= 100) {
      setShowLevelUp(true);
      onLevelUp?.();
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  }, [progress, onLevelUp]);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Level Badge */}
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            className="relative"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25">
              {level}
            </div>
            <AnimatePresence>
              {showLevelUp && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.5 }}
                  animate={{ opacity: 1, y: -20, scale: 1 }}
                  exit={{ opacity: 0, y: -30 }}
                  className="absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
                >
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <ChevronUp className="h-3 w-3" />
                    Level Up!
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Nível {level}</p>
        </TooltipContent>
      </Tooltip>

      {/* XP Progress Bar */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex-1 max-w-32 h-2.5 rounded-full bg-muted overflow-hidden cursor-pointer">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${animatedProgress}%` }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.8, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-xp to-primary"
            />
            {/* Shimmer effect */}
            {!prefersReducedMotion && (
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">{currentXP.toLocaleString('pt-BR')} / {maxXP.toLocaleString('pt-BR')} XP</p>
            <p className="text-xs text-muted-foreground">{maxXP - currentXP} XP para o próximo nível</p>
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Streak Counter */}
      {streak > 0 && (
        <StreakBadge streak={streak} />
      )}

      {/* Coins */}
      {coins > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-coins/10 text-coins"
            >
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-semibold">{coins.toLocaleString('pt-BR')}</span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{coins} moedas</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

// ============= STREAK BADGE =============

interface StreakBadgeProps {
  streak: number;
  showLabel?: boolean;
  className?: string;
}

export function StreakBadge({ streak, showLabel = false, className }: StreakBadgeProps) {
  const prefersReducedMotion = useReducedMotion();
  const isHotStreak = streak >= 7;
  const isOnFire = streak >= 14;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full',
            isOnFire 
              ? 'bg-gradient-to-r from-streak to-destructive text-white' 
              : isHotStreak 
                ? 'bg-streak/20 text-streak'
                : 'bg-muted text-muted-foreground',
            className
          )}
        >
          <motion.div
            animate={!prefersReducedMotion && isHotStreak ? {
              scale: [1, 1.2, 1],
              rotate: [0, -5, 5, 0],
            } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Flame className={cn(
              'h-3.5 w-3.5',
              isOnFire && 'fill-current'
            )} />
          </motion.div>
          <span className="text-xs font-bold">{streak}</span>
          {showLabel && <span className="text-xs">dias</span>}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-center">
          <p className="font-semibold">{streak} dias consecutivos!</p>
          {isOnFire && <p className="text-xs text-streak">🔥 Em chamas!</p>}
          {isHotStreak && !isOnFire && <p className="text-xs text-muted-foreground">Continue assim!</p>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// ============= ACHIEVEMENT NOTIFICATION =============

interface AchievementNotificationProps {
  isVisible: boolean;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  xpReward?: number;
  onClose: () => void;
}

export function AchievementNotification({
  isVisible,
  title,
  description,
  icon,
  xpReward,
  onClose,
}: AchievementNotificationProps) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 50, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-20 right-4 z-50 max-w-sm"
        >
          <div className="relative overflow-hidden rounded-xl border border-rank-gold/30 bg-gradient-to-r from-rank-gold/10 via-card to-card shadow-xl shadow-rank-gold/10">
            {/* Shimmer effect */}
            {!prefersReducedMotion && (
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: 2 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-rank-gold/20 to-transparent"
              />
            )}

            <div className="relative p-4 flex items-center gap-4">
              {/* Icon */}
              <motion.div
                initial={prefersReducedMotion ? {} : { rotate: -15, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-rank-gold to-rank-gold/70 text-rank-gold-foreground shadow-lg"
              >
                {icon || <Trophy className="h-6 w-6" />}
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-rank-gold" />
                  <span className="text-xs font-medium text-rank-gold uppercase tracking-wide">
                    Conquista Desbloqueada
                  </span>
                </div>
                <h4 className="font-bold text-foreground mt-0.5">{title}</h4>
                {description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
                )}
              </div>

              {/* XP Reward */}
              {xpReward && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-xp/20 text-xp"
                >
                  <Zap className="h-3 w-3" />
                  <span className="text-xs font-bold">+{xpReward}</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============= XP GAIN POPUP =============

interface XPGainPopupProps {
  amount: number;
  isVisible: boolean;
  position?: { x: number; y: number };
}

export function XPGainPopup({ amount, isVisible, position }: XPGainPopupProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 1, y: 0, scale: 1 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { y: -40, opacity: 0, scale: 1.2 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={position ? { left: position.x, top: position.y } : undefined}
          className={cn(
            'pointer-events-none z-50',
            position ? 'fixed' : 'absolute top-0 left-1/2 -translate-x-1/2'
          )}
        >
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-xp text-xp-foreground shadow-lg">
            <Zap className="h-3 w-3" />
            <span className="text-sm font-bold">+{amount} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============= RANK BADGE =============

type RankType = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface RankBadgeProps {
  rank: RankType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const rankConfig: Record<RankType, { label: string; gradient: string; icon: React.ReactNode }> = {
  bronze: {
    label: 'Bronze',
    gradient: 'from-rank-bronze to-rank-bronze/70',
    icon: <Star className="h-4 w-4" />,
  },
  silver: {
    label: 'Prata',
    gradient: 'from-rank-silver to-rank-silver/70',
    icon: <Star className="h-4 w-4 fill-current" />,
  },
  gold: {
    label: 'Ouro',
    gradient: 'from-rank-gold to-rank-gold/70',
    icon: <Trophy className="h-4 w-4" />,
  },
  platinum: {
    label: 'Platina',
    gradient: 'from-slate-300 to-slate-400',
    icon: <Trophy className="h-4 w-4 fill-current" />,
  },
  diamond: {
    label: 'Diamante',
    gradient: 'from-cyan-300 to-blue-400',
    icon: <Sparkles className="h-4 w-4" />,
  },
};

export function RankBadge({ rank, size = 'md', showLabel = true, className }: RankBadgeProps) {
  const config = rankConfig[rank];
  const prefersReducedMotion = useReducedMotion();

  const sizes = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <motion.div
        whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 5 }}
        className={cn(
          'flex items-center justify-center rounded-full shadow-lg',
          `bg-gradient-to-br ${config.gradient}`,
          sizes[size]
        )}
      >
        {config.icon}
      </motion.div>
      {showLabel && (
        <span className="text-sm font-semibold text-foreground">{config.label}</span>
      )}
    </div>
  );
}

export default {
  XPHeaderBar,
  StreakBadge,
  AchievementNotification,
  XPGainPopup,
  RankBadge,
};
