// ============= GAMIFICATION - CENTRALIZED EXPORTS =============

// Celebration animations
export {
  CelebrationOverlay,
  AnimatedXPBar,
  MiniCelebration,
} from './CelebrationAnimations';

// Gamification widgets
export {
  XPHeaderBar,
  StreakBadge,
  AchievementNotification,
  XPGainPopup,
  RankBadge,
} from './GamificationWidgets';

// Re-export from GamificationSystem if exists
export * from './GamificationSystem';
