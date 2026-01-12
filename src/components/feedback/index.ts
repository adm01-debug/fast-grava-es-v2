// ============= FEEDBACK & MICRO-INTERACTIONS - CENTRALIZED EXPORTS =============

// Micro-interactions
export {
  useRipple,
  InteractiveButton,
  PulseDot,
  FeedbackToast,
  SuccessCheck,
  HoverCardEffect,
  AnimatedCounter,
  ShakeContainer,
} from './MicroInteractions';

// Feedback provider and hook
export { FeedbackProvider, useFeedback } from './FeedbackProvider';

// Re-export celebration components
export {
  Confetti,
  CelebrationToast,
  CelebrationProvider,
  useCelebration,
  AchievementBadge,
  ProgressMilestone,
} from '@/components/ui/celebration';
