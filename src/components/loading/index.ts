// ============= LOADING SYSTEM - CENTRALIZED EXPORTS =============

// Skeleton components
export {
  Shimmer,
  StatsCardSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  CardSkeleton,
  ChartSkeleton,
  FormSkeleton,
  ListSkeleton,
  KanbanSkeleton,
  DashboardSkeleton,
  ProgressiveSkeleton,
} from './SkeletonLibrary';

// Spinner and loader components
export {
  Spinner,
  DotsLoader,
  PulseLoader,
  ProgressLoader,
  PageLoader,
  InlineLoader,
  ButtonLoader,
  ShimmerSkeleton,
  AvatarSkeleton,
  TextSkeleton,
} from './LoadingSpinner';

// Transition components
export {
  ContentTransition,
  StaggeredList,
  FadeTransition,
  ScaleFade,
  SlideTransition,
  LoadingOverlay,
} from './ContentTransition';

// Re-export base Skeleton from shadcn
export { Skeleton } from '@/components/ui/skeleton';
