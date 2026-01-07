import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, TrendingUp, TrendingDown, Award, 
  Star, Zap, Trophy, Medal, Crown, Flame
} from 'lucide-react';

// #51 - Componentes de Gamificação e Progresso

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
  color?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className,
  children,
  color = 'hsl(var(--primary))'
}: ProgressRingProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
        )}
      </div>
    </div>
  );
}

// Achievement badge
interface AchievementProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: { current: number; total: number };
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  onClick?: () => void;
}

export function Achievement({
  title,
  description,
  icon,
  unlocked,
  progress,
  rarity = 'common',
  onClick
}: AchievementProps) {
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  };

  const rarityBorder = {
    common: 'border-gray-300',
    rare: 'border-blue-400',
    epic: 'border-purple-400',
    legendary: 'border-yellow-400'
  };

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border-2 transition-all cursor-pointer',
        unlocked 
          ? `${rarityBorder[rarity]} bg-gradient-to-br ${rarityColors[rarity]} text-white` 
          : 'border-muted bg-muted/50 grayscale opacity-60',
        onClick && 'hover:scale-105'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'h-12 w-12 rounded-full flex items-center justify-center',
          unlocked ? 'bg-white/20' : 'bg-muted'
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          {description && (
            <p className={cn(
              'text-sm',
              unlocked ? 'text-white/80' : 'text-muted-foreground'
            )}>
              {description}
            </p>
          )}
          {progress && !unlocked && (
            <div className="mt-2">
              <Progress 
                value={(progress.current / progress.total) * 100} 
                className="h-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {progress.current} / {progress.total}
              </p>
            </div>
          )}
        </div>
      </div>
      {unlocked && (
        <Star className="absolute top-2 right-2 h-4 w-4 text-white fill-white" />
      )}
    </div>
  );
}

// Level progress
export function LevelProgress({
  level,
  currentXP,
  requiredXP,
  title,
  className
}: {
  level: number;
  currentXP: number;
  requiredXP: number;
  title?: string;
  className?: string;
}) {
  const percentage = (currentXP / requiredXP) * 100;

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">{level}</span>
            </div>
            <Zap className="absolute -bottom-1 -right-1 h-6 w-6 text-yellow-500 fill-yellow-500" />
          </div>
          <div className="flex-1">
            {title && <p className="text-sm text-muted-foreground">{title}</p>}
            <p className="font-semibold">Nível {level}</p>
            <div className="mt-2">
              <Progress value={percentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {currentXP.toLocaleString()} / {requiredXP.toLocaleString()} XP
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Streak counter
export function StreakCounter({
  streak,
  label = 'dias consecutivos',
  icon = <Flame className="h-6 w-6" />,
  className
}: {
  streak: number;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  const getStreakColor = () => {
    if (streak >= 30) return 'text-red-500';
    if (streak >= 7) return 'text-orange-500';
    return 'text-yellow-500';
  };

  return (
    <div className={cn(
      'flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border',
      className
    )}>
      <div className={cn('animate-pulse', getStreakColor())}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{streak}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// Leaderboard
export function Leaderboard({
  entries,
  currentUserId,
  title = 'Ranking',
  className
}: {
  entries: { id: string; name: string; score: number; avatar?: string }[];
  currentUserId?: string;
  title?: string;
  className?: string;
}) {
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-medium">{position}</span>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry, index) => {
            const isCurrentUser = entry.id === currentUserId;
            return (
              <div
                key={entry.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg',
                  isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                )}
              >
                <div className="w-8 flex justify-center">
                  {getRankIcon(index + 1)}
                </div>
                {entry.avatar ? (
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    {entry.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className={cn('font-medium', isCurrentUser && 'text-primary')}>
                    {entry.name}
                    {isCurrentUser && <span className="text-xs ml-1">(você)</span>}
                  </p>
                </div>
                <Badge variant={isCurrentUser ? 'default' : 'secondary'}>
                  {entry.score.toLocaleString()} pts
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Points display
export function PointsDisplay({
  points,
  label = 'Pontos',
  trend,
  className
}: {
  points: number;
  label?: string;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}) {
  return (
    <div className={cn(
      'flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5',
      className
    )}>
      <Star className="h-5 w-5 text-primary fill-primary" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{points.toLocaleString()}</p>
      </div>
      {trend && (
        <div className={cn(
          'flex items-center gap-1 text-sm',
          trend.isPositive ? 'text-green-600' : 'text-red-600'
        )}>
          {trend.isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          {trend.value > 0 && '+'}{trend.value}
        </div>
      )}
    </div>
  );
}
