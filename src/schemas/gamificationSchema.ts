import { z } from 'zod';

export const achievementCategorySchema = z.enum(['productivity', 'quality', 'attendance', 'teamwork', 'special']);
export const badgeTierSchema = z.enum(['bronze', 'silver', 'gold', 'platinum', 'diamond']);

export const achievementSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  category: achievementCategorySchema,
  points: z.number().int().min(0),
  icon: z.string().max(50),
  criteria: z.record(z.unknown()),
  tier: badgeTierSchema.optional(),
  hidden: z.boolean().default(false),
  created_at: z.string().datetime(),
});

export const operatorAchievementSchema = z.object({
  id: z.string().uuid(),
  operator_id: z.string().uuid(),
  achievement_id: z.string().uuid(),
  earned_at: z.string().datetime(),
  points_awarded: z.number().int().min(0),
});

export const leaderboardEntrySchema = z.object({
  operator_id: z.string().uuid(),
  operator_name: z.string(),
  total_points: z.number().int().min(0),
  rank: z.number().int().min(1),
  achievements_count: z.number().int().min(0),
  level: z.number().int().min(1),
  streak_days: z.number().int().min(0),
});

export const streakSchema = z.object({
  id: z.string().uuid(),
  operator_id: z.string().uuid(),
  streak_type: z.enum(['daily', 'weekly', 'perfect_week']),
  current_streak: z.number().int().min(0),
  best_streak: z.number().int().min(0),
  last_activity: z.string().datetime(),
});

export const challengeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  target: z.number().min(0),
  reward_points: z.number().int().min(0),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  participants: z.array(z.string().uuid()).optional(),
});

export type AchievementCategory = z.infer<typeof achievementCategorySchema>;
export type BadgeTier = z.infer<typeof badgeTierSchema>;
export type Achievement = z.infer<typeof achievementSchema>;
export type OperatorAchievement = z.infer<typeof operatorAchievementSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;
export type Streak = z.infer<typeof streakSchema>;
export type Challenge = z.infer<typeof challengeSchema>;
