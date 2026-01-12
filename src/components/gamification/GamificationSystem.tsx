import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Award,
  TrendingUp,
  Crown,
  Medal,
  Flame,
  Gift,
  Sparkles,
  Heart,
  Shield,
  Rocket,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

// ============= TYPES =============

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'production' | 'quality' | 'efficiency' | 'streak' | 'milestone';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  points: number;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  rarity?: AchievementRarity;
  category?: BadgeCategory;
}

interface Level {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  icon: React.ElementType;
  color: string;
}

interface UserStats {
  totalPoints: number;
  level: Level;
  streak: number;
  achievements: Achievement[];
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  action: string;
  points: number;
  timestamp: Date;
}

// ============= RARITY CONFIGS =============

const rarityConfig: Record<AchievementRarity, { 
  gradient: string; 
  border: string; 
  glow: string;
  textColor: string;
}> = {
  common: {
    gradient: 'from-slate-400 to-slate-500',
    border: 'border-slate-400/50',
    glow: 'shadow-slate-400/20',
    textColor: 'text-slate-400',
  },
  rare: {
    gradient: 'from-blue-400 to-blue-600',
    border: 'border-blue-400/50',
    glow: 'shadow-blue-400/30',
    textColor: 'text-blue-400',
  },
  epic: {
    gradient: 'from-purple-400 to-purple-600',
    border: 'border-purple-400/50',
    glow: 'shadow-purple-400/40',
    textColor: 'text-purple-400',
  },
  legendary: {
    gradient: 'from-amber-400 via-orange-400 to-amber-500',
    border: 'border-amber-400/60',
    glow: 'shadow-amber-400/50',
    textColor: 'text-amber-400',
  },
};

// Levels configuration
const LEVELS: Level[] = [
  { level: 1, name: 'Iniciante', minPoints: 0, maxPoints: 100, icon: Star, color: 'text-gray-500' },
  { level: 2, name: 'Aprendiz', minPoints: 100, maxPoints: 300, icon: Zap, color: 'text-blue-500' },
  { level: 3, name: 'Competente', minPoints: 300, maxPoints: 600, icon: Target, color: 'text-green-500' },
  { level: 4, name: 'Proficiente', minPoints: 600, maxPoints: 1000, icon: Award, color: 'text-purple-500' },
  { level: 5, name: 'Especialista', minPoints: 1000, maxPoints: 1500, icon: Trophy, color: 'text-yellow-500' },
  { level: 6, name: 'Mestre', minPoints: 1500, maxPoints: 2500, icon: Crown, color: 'text-orange-500' },
  { level: 7, name: 'Lenda', minPoints: 2500, maxPoints: Infinity, icon: Flame, color: 'text-red-500' },
];

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  { id: 'first_job', name: 'Primeira Ordem', description: 'Complete sua primeira ordem de produção', icon: Star, color: 'bg-blue-500', points: 10, rarity: 'common', category: 'production' },
  { id: 'streak_7', name: 'Semana Perfeita', description: '7 dias consecutivos de produtividade', icon: Flame, color: 'bg-orange-500', points: 50, rarity: 'rare', category: 'streak' },
  { id: 'streak_30', name: 'Mês Imbatível', description: '30 dias consecutivos de atividade', icon: Flame, color: 'bg-red-500', points: 200, rarity: 'epic', category: 'streak' },
  { id: 'efficiency_90', name: 'Alta Eficiência', description: 'Mantenha eficiência acima de 90%', icon: TrendingUp, color: 'bg-green-500', points: 75, rarity: 'rare', category: 'efficiency' },
  { id: 'zero_defects', name: 'Perfeição', description: 'Complete 10 ordens sem defeitos', icon: Target, color: 'bg-purple-500', points: 100, rarity: 'epic', category: 'quality' },
  { id: 'team_leader', name: 'Líder de Equipe', description: 'Seja o mais produtivo da semana', icon: Crown, color: 'bg-yellow-500', points: 150, rarity: 'legendary', category: 'milestone' },
  { id: 'problem_solver', name: 'Solucionador', description: 'Resolva 5 alertas de manutenção', icon: Award, color: 'bg-teal-500', points: 60, rarity: 'rare', category: 'production' },
  { id: 'mentor', name: 'Mentor', description: 'Ajude 3 novos operadores', icon: Medal, color: 'bg-indigo-500', points: 80, rarity: 'rare', category: 'milestone' },
];

// ============= CONTEXT =============

interface GamificationContextType {
  stats: UserStats;
  addPoints: (points: number, reason: string) => void;
  unlockAchievement: (achievementId: string) => void;
  getLevel: (points: number) => Level;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
}

// ============= PROVIDER =============

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('gamification_stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        recentActivity: parsed.recentActivity?.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        })) || [],
        achievements: parsed.achievements?.map((a: any) => ({
          ...a,
          unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined
        })) || []
      };
    }
    return {
      totalPoints: 0,
      level: LEVELS[0],
      streak: 0,
      achievements: [],
      recentActivity: []
    };
  });

  const [notification, setNotification] = useState<{
    type: 'points' | 'achievement' | 'levelUp';
    data: any;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem('gamification_stats', JSON.stringify(stats));
  }, [stats]);

  const getLevel = useCallback((points: number): Level => {
    return [...LEVELS].reverse().find(l => points >= l.minPoints) || LEVELS[0];
  }, []);

  const addPoints = useCallback((points: number, reason: string) => {
    setStats(prev => {
      const newPoints = prev.totalPoints + points;
      const oldLevel = getLevel(prev.totalPoints);
      const newLevel = getLevel(newPoints);

      if (newLevel.level > oldLevel.level) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setNotification({ type: 'levelUp', data: newLevel });
      } else {
        setNotification({ type: 'points', data: { points, reason } });
      }

      return {
        ...prev,
        totalPoints: newPoints,
        level: newLevel,
        recentActivity: [
          {
            id: Date.now().toString(),
            action: reason,
            points,
            timestamp: new Date()
          },
          ...prev.recentActivity.slice(0, 19)
        ]
      };
    });
  }, [getLevel]);

  const unlockAchievement = useCallback((achievementId: string) => {
    const definition = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId);
    if (!definition) return;

    setStats(prev => {
      const alreadyUnlocked = prev.achievements.some(a => a.id === achievementId);
      if (alreadyUnlocked) return prev;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347']
      });

      const newAchievement: Achievement = {
        ...definition,
        unlockedAt: new Date()
      };

      setNotification({ type: 'achievement', data: newAchievement });

      return {
        ...prev,
        totalPoints: prev.totalPoints + definition.points,
        achievements: [...prev.achievements, newAchievement]
      };
    });
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <GamificationContext.Provider value={{ stats, addPoints, unlockAchievement, getLevel }}>
      {children}
      <NotificationPopup notification={notification} onClose={() => setNotification(null)} />
    </GamificationContext.Provider>
  );
}

// ============= NOTIFICATION POPUP =============

function NotificationPopup({ 
  notification, 
  onClose 
}: { 
  notification: { type: string; data: any } | null;
  onClose: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  
  if (!notification) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -50, scale: 0.9 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        onClick={onClose}
      >
        {notification.type === 'points' && (
          <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl shadow-2xl backdrop-blur-sm">
            <motion.div 
              animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3 }}
              className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <Zap className="h-5 w-5 text-primary" />
            </motion.div>
            <div>
              <p className="text-sm font-medium">+{notification.data.points} pontos</p>
              <p className="text-xs text-muted-foreground">{notification.data.reason}</p>
            </div>
          </div>
        )}

        {notification.type === 'achievement' && (
          <motion.div 
            initial={prefersReducedMotion ? {} : { scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl shadow-2xl backdrop-blur-sm"
          >
            <motion.div 
              animate={prefersReducedMotion ? {} : { rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className={cn("h-12 w-12 rounded-full flex items-center justify-center", notification.data.color)}
            >
              <notification.data.icon className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <p className="text-sm font-bold flex items-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Conquista Desbloqueada!
              </p>
              <p className="text-sm font-medium">{notification.data.name}</p>
              <p className="text-xs text-muted-foreground">+{notification.data.points} pontos</p>
            </div>
          </motion.div>
        )}

        {notification.type === 'levelUp' && (
          <motion.div 
            initial={prefersReducedMotion ? {} : { scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl shadow-2xl backdrop-blur-sm"
          >
            <motion.div 
              animate={prefersReducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
            >
              <notification.data.icon className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <p className="text-lg font-bold">🎉 Level Up!</p>
              <p className="text-sm">Você alcançou nível {notification.data.level}</p>
              <p className={cn("text-sm font-semibold", notification.data.color)}>
                {notification.data.name}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ============= COMPONENTS =============

export function LevelBadge({ level, size = 'md' }: { level: Level; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-12 w-12 text-lg'
  };

  return (
    <div className={cn(
      "rounded-full bg-gradient-to-br from-card to-muted flex items-center justify-center border-2 border-primary/20",
      sizes[size]
    )}>
      <level.icon className={cn("h-1/2 w-1/2", level.color)} />
    </div>
  );
}

export function PointsDisplay({ points, showAnimation = true }: { points: number; showAnimation?: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div 
      key={points}
      initial={showAnimation && !prefersReducedMotion ? { scale: 1.2 } : false}
      animate={{ scale: 1 }}
      className="flex items-center gap-1 text-sm font-semibold"
    >
      <Star className="h-4 w-4 text-yellow-500" />
      <span>{points.toLocaleString()}</span>
    </motion.div>
  );
}

export function ProgressBar({ current, max, className }: { current: number; max: number; className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const percentage = Math.min((current / max) * 100, 100);
  
  return (
    <div className={cn("h-2 bg-muted rounded-full overflow-hidden", className)}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
      />
    </div>
  );
}

export function AchievementCard({ achievement, locked = false }: { achievement: Achievement; locked?: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  const rarity = achievement.rarity || 'common';
  const config = rarityConfig[rarity];
  
  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      className={cn(
        "p-4 rounded-xl border transition-all",
        locked 
          ? "bg-muted/50 border-border opacity-50" 
          : "bg-card border-primary/20 shadow-sm",
        !locked && rarity === 'legendary' && 'border-amber-400/30 shadow-amber-400/10'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center relative",
          locked ? "bg-muted" : achievement.color
        )}>
          <achievement.icon className={cn("h-6 w-6", locked ? "text-muted-foreground" : "text-white")} />
          {!locked && rarity !== 'common' && (
            <div className={cn(
              "absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold",
              `bg-gradient-to-br ${config.gradient} text-white`
            )}>
              {rarity === 'legendary' ? '★' : rarity === 'epic' ? '◆' : '●'}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{achievement.name}</h4>
          <p className="text-xs text-muted-foreground">{achievement.description}</p>
          {!locked && (
            <div className="flex items-center gap-1 mt-1">
              <Gift className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">+{achievement.points} pts</span>
            </div>
          )}
        </div>
      </div>
      {achievement.progress !== undefined && achievement.maxProgress && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progresso</span>
            <span>{achievement.progress}/{achievement.maxProgress}</span>
          </div>
          <ProgressBar current={achievement.progress} max={achievement.maxProgress} />
        </div>
      )}
    </motion.div>
  );
}

export function LeaderboardItem({ 
  rank, 
  name, 
  points, 
  isCurrentUser = false,
  trend
}: { 
  rank: number; 
  name: string; 
  points: number; 
  isCurrentUser?: boolean;
  trend?: 'up' | 'down' | 'same';
}) {
  const prefersReducedMotion = useReducedMotion();
  
  const getRankIcon = () => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-medium text-muted-foreground">{rank}</span>;
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={prefersReducedMotion ? {} : { x: 4 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg",
        isCurrentUser ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
      )}
    >
      <div className="w-8 flex justify-center">{getRankIcon()}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className={cn("font-medium", isCurrentUser && "text-primary")}>{name}</p>
          {isCurrentUser && (
            <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-full">
              Você
            </span>
          )}
        </div>
      </div>
      {trend && (
        <div className={cn(
          'flex items-center',
          trend === 'up' && 'text-success',
          trend === 'down' && 'text-destructive',
          trend === 'same' && 'text-muted-foreground',
        )}>
          {trend === 'up' && <TrendingUp className="w-4 h-4" />}
          {trend === 'down' && <TrendingUp className="w-4 h-4 rotate-180" />}
          {trend === 'same' && <span className="text-xs">—</span>}
        </div>
      )}
      <PointsDisplay points={points} showAnimation={false} />
    </motion.div>
  );
}

export function StreakDisplay({ streak }: { streak: number }) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div 
      animate={streak > 0 && !prefersReducedMotion ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
      className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 rounded-full"
    >
      <Flame className={cn("h-4 w-4", streak > 0 ? "text-orange-500" : "text-muted-foreground")} />
      <span className="text-sm font-semibold">{streak} dias</span>
    </motion.div>
  );
}

// ============= DAILY CHALLENGE CARD =============

interface DailyChallengeProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  reward: number;
  progress: number;
  maxProgress: number;
  timeRemaining?: string;
  onClaim?: () => void;
}

export function DailyChallengeCard({
  title,
  description,
  icon = <Target className="w-5 h-5" />,
  reward,
  progress,
  maxProgress,
  timeRemaining,
  onClaim,
}: DailyChallengeProps) {
  const prefersReducedMotion = useReducedMotion();
  const isComplete = progress >= maxProgress;
  const progressPercent = Math.min(100, (progress / maxProgress) * 100);

  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      className={cn(
        "relative p-4 rounded-xl border transition-all",
        isComplete 
          ? "bg-success/10 border-success/30" 
          : "bg-card border-border hover:border-primary/30",
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'p-2 rounded-lg',
          isComplete ? 'bg-success/20 text-success' : 'bg-primary/10 text-primary',
        )}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-foreground truncate">{title}</h4>
            <div className="flex items-center gap-1 text-coins font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              +{reward}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {description}
          </p>

          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {progress} / {maxProgress}
              </span>
              {timeRemaining && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {timeRemaining}
                </span>
              )}
            </div>
            <ProgressBar current={progress} max={maxProgress} />
          </div>
        </div>
      </div>

      {isComplete && onClaim && (
        <motion.button
          initial={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          onClick={onClaim}
          className="absolute -top-2 -right-2 px-3 py-1 bg-success text-success-foreground text-xs font-bold rounded-full shadow-lg animate-pulse"
        >
          Coletar!
        </motion.button>
      )}
    </motion.div>
  );
}

// ============= COMBO COUNTER =============

interface ComboCounterProps {
  count: number;
  maxCombo?: number;
}

export function ComboCounter({ count, maxCombo = 10 }: ComboCounterProps) {
  const prefersReducedMotion = useReducedMotion();
  
  if (count <= 0) return null;

  const intensity = Math.min(count / maxCombo, 1);
  
  return (
    <motion.div
      key={count}
      initial={prefersReducedMotion ? {} : { scale: 1.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-sm',
        'transition-all duration-300',
        intensity < 0.3 && 'bg-primary/20 text-primary',
        intensity >= 0.3 && intensity < 0.6 && 'bg-warning/20 text-warning',
        intensity >= 0.6 && intensity < 0.9 && 'bg-streak/20 text-streak',
        intensity >= 0.9 && 'bg-gradient-to-r from-rank-gold to-amber-500 text-white shadow-lg shadow-amber-500/30',
      )}
    >
      <Flame className={cn(
        'w-4 h-4',
        intensity >= 0.6 && !prefersReducedMotion && 'animate-pulse',
      )} />
      <span>×{count}</span>
      <span className="text-xs opacity-75">COMBO</span>
    </motion.div>
  );
}

// ============= GAMIFICATION ICONS EXPORT =============

export const GamificationIcons = {
  Trophy,
  Star,
  Zap,
  Crown,
  Medal,
  Target,
  Flame,
  Sparkles,
  TrendingUp,
  Award,
  Heart,
  Shield,
  Rocket,
  Gift,
  Clock,
};
