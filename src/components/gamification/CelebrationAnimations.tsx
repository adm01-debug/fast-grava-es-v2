import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Zap, Crown, Medal, Target, Flame, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

type CelebrationType =
  | "achievement"
  | "levelUp"
  | "streak"
  | "milestone"
  | "badge"
  | "reward"
  | "xp";

interface CelebrationProps {
  type: CelebrationType;
  title: string;
  description?: string;
  value?: string | number;
  icon?: React.ReactNode;
  onComplete?: () => void;
  autoClose?: number;
}

const celebrationConfig: Record<
  CelebrationType,
  { icon: React.ReactNode; color: string; bgGradient: string }
> = {
  achievement: {
    icon: <Trophy className="h-12 w-12" />,
    color: "text-rank-gold",
    bgGradient: "from-rank-gold/20 via-rank-gold/10 to-transparent",
  },
  levelUp: {
    icon: <Zap className="h-12 w-12" />,
    color: "text-primary",
    bgGradient: "from-primary/20 via-primary/10 to-transparent",
  },
  streak: {
    icon: <Flame className="h-12 w-12" />,
    color: "text-streak",
    bgGradient: "from-streak/20 via-streak/10 to-transparent",
  },
  milestone: {
    icon: <Target className="h-12 w-12" />,
    color: "text-success",
    bgGradient: "from-success/20 via-success/10 to-transparent",
  },
  badge: {
    icon: <Medal className="h-12 w-12" />,
    color: "text-rank-silver",
    bgGradient: "from-rank-silver/20 via-rank-silver/10 to-transparent",
  },
  reward: {
    icon: <Crown className="h-12 w-12" />,
    color: "text-coins",
    bgGradient: "from-coins/20 via-coins/10 to-transparent",
  },
  xp: {
    icon: <Sparkles className="h-12 w-12" />,
    color: "text-xp",
    bgGradient: "from-xp/20 via-xp/10 to-transparent",
  },
};

export function CelebrationOverlay({
  type,
  title,
  description,
  value,
  icon,
  onComplete,
  autoClose = 4000,
}: CelebrationProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const config = celebrationConfig[type];

  React.useEffect(() => {
    // Trigger confetti on mount
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onComplete?.(), 300);
    }, autoClose);

    return () => clearTimeout(timer);
  }, [autoClose, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          onClick={() => setIsVisible(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

          {/* Radial gradient background */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 2, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`absolute w-96 h-96 rounded-full bg-gradient-radial ${config.bgGradient}`}
          />

          {/* Main content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 200,
              delay: 0.1,
            }}
            className="relative flex flex-col items-center text-center px-8"
          >
            {/* Icon with glow */}
            <motion.div
              initial={{ rotate: -15, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                type: "spring",
                damping: 10,
                stiffness: 150,
                delay: 0.2,
              }}
              className={`relative mb-6 ${config.color}`}
            >
              {/* Glow effect */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 blur-xl"
              >
                {icon || config.icon}
              </motion.div>
              {icon || config.icon}
            </motion.div>

            {/* Stars animation */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  x: Math.cos((i * Math.PI * 2) / 6) * 100,
                  y: Math.sin((i * Math.PI * 2) / 6) * 100,
                }}
                transition={{
                  duration: 1,
                  delay: 0.3 + i * 0.1,
                  ease: "easeOut",
                }}
                className={`absolute ${config.color}`}
              >
                <Star className="h-4 w-4 fill-current" />
              </motion.div>
            ))}

            {/* Value (if provided) */}
            {value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className={`text-5xl font-bold mb-2 ${config.color}`}
              >
                +{value}
              </motion.div>
            )}

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-foreground mb-2"
            >
              {title}
            </motion.h2>

            {/* Description */}
            {description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-muted-foreground max-w-sm"
              >
                {description}
              </motion.p>
            )}

            {/* Tap to dismiss hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1 }}
              className="mt-8 text-sm text-muted-foreground"
            >
              Toque para continuar
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Animated XP Bar component
interface AnimatedXPBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  className?: string;
}

export function AnimatedXPBar({ currentXP, maxXP, level, className }: AnimatedXPBarProps) {
  const progress = (currentXP / maxXP) * 100;
  const [displayProgress, setDisplayProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setDisplayProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className={`relative ${className}`}>
      {/* Level badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -left-1 -top-1 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg"
      >
        {level}
      </motion.div>

      {/* Progress bar container */}
      <div className="ml-6 h-6 rounded-full bg-muted overflow-hidden">
        {/* Animated progress */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${displayProgress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full relative overflow-hidden"
          style={{
            background: "linear-gradient(90deg, hsl(var(--xp)), hsl(var(--primary)))",
          }}
        >
          {/* Shine effect */}
          <motion.div
            animate={{
              x: ["0%", "200%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 1,
            }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>

        {/* XP text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-foreground">
            {currentXP.toLocaleString()} / {maxXP.toLocaleString()} XP
          </span>
        </div>
      </div>
    </div>
  );
}

// Mini celebration (for inline use)
export function MiniCelebration({
  type,
  value,
  show,
}: {
  type: CelebrationType;
  value?: string | number;
  show: boolean;
}) {
  const config = celebrationConfig[type];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -10 }}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${config.color} bg-current/10`}
        >
          {React.cloneElement(config.icon as React.ReactElement, {
            className: "h-4 w-4",
          })}
          {value && <span className="text-sm font-medium">+{value}</span>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
