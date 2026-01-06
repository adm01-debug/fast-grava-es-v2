import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Info,
  ChevronDown,
  ChevronUp,
  LucideIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Types
type TimelineItemStatus = 'completed' | 'current' | 'pending' | 'error' | 'warning' | 'info';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: Date;
  status: TimelineItemStatus;
  icon?: LucideIcon;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, string>;
  children?: TimelineItem[];
}

interface TimelineProps {
  items: TimelineItem[];
  orientation?: 'vertical' | 'horizontal';
  showConnector?: boolean;
  animated?: boolean;
  collapsible?: boolean;
  className?: string;
}

// Status configurations
const statusConfig: Record<TimelineItemStatus, { icon: LucideIcon; color: string; bgColor: string }> = {
  completed: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500' },
  current: { icon: Clock, color: 'text-primary', bgColor: 'bg-primary' },
  pending: { icon: Circle, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  error: { icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive' },
  warning: { icon: AlertCircle, color: 'text-yellow-500', bgColor: 'bg-yellow-500' },
  info: { icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-500' },
};

// Single Timeline Item
interface TimelineItemComponentProps {
  item: TimelineItem;
  isLast: boolean;
  animated?: boolean;
  index: number;
  collapsible?: boolean;
}

const TimelineItemComponent: React.FC<TimelineItemComponentProps> = ({
  item,
  isLast,
  animated,
  index,
  collapsible,
}) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const config = statusConfig[item.status];
  const Icon = item.icon || config.icon;

  const content = (
    <motion.div
      initial={animated ? { opacity: 0, x: -20 } : undefined}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="relative flex gap-4 pb-8 last:pb-0"
    >
      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-border" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-background',
          config.bgColor
        )}
      >
        <Icon className="h-4 w-4 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium text-foreground">{item.title}</h4>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
            )}
          </div>
          <time className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(item.date, { addSuffix: true, locale: ptBR })}
          </time>
        </div>

        {/* User */}
        {item.user && (
          <div className="flex items-center gap-2 mt-2">
            {item.user.avatar ? (
              <img
                src={item.user.avatar}
                alt={item.user.name}
                className="h-5 w-5 rounded-full"
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                {item.user.name[0]}
              </div>
            )}
            <span className="text-xs text-muted-foreground">{item.user.name}</span>
          </div>
        )}

        {/* Metadata */}
        {item.metadata && Object.keys(item.metadata).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(item.metadata).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="text-xs">
                {key}: {value}
              </Badge>
            ))}
          </div>
        )}

        {/* Children */}
        {item.children && item.children.length > 0 && collapsible && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                {isOpen ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Ocultar detalhes
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Ver {item.children.length} detalhes
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 pl-4 border-l-2 border-muted space-y-2">
              {item.children.map((child, i) => (
                <div key={child.id} className="text-sm">
                  <span className="font-medium">{child.title}</span>
                  {child.description && (
                    <span className="text-muted-foreground"> - {child.description}</span>
                  )}
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </motion.div>
  );

  return content;
};

// Main Timeline Component
export const Timeline: React.FC<TimelineProps> = ({
  items,
  orientation = 'vertical',
  showConnector = true,
  animated = true,
  collapsible = false,
  className,
}) => {
  if (orientation === 'horizontal') {
    return (
      <div className={cn('flex overflow-x-auto gap-4 pb-4', className)}>
        {items.map((item, index) => {
          const config = statusConfig[item.status];
          const Icon = item.icon || config.icon;

          return (
            <motion.div
              key={item.id}
              initial={animated ? { opacity: 0, y: 20 } : undefined}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center min-w-[150px]"
            >
              {/* Icon */}
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-background',
                  config.bgColor
                )}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>

              {/* Connector */}
              {showConnector && index < items.length - 1 && (
                <div className="absolute left-full top-1/2 w-full h-0.5 bg-border" />
              )}

              {/* Content */}
              <div className="mt-3 text-center">
                <h4 className="font-medium text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(item.date, "dd MMM", { locale: ptBR })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('space-y-0', className)}>
      {items.map((item, index) => (
        <TimelineItemComponent
          key={item.id}
          item={item}
          isLast={index === items.length - 1}
          animated={animated}
          index={index}
          collapsible={collapsible}
        />
      ))}
    </div>
  );
};

// Activity Timeline - Simplified for activity feeds
interface Activity {
  id: string;
  action: string;
  target?: string;
  user: {
    name: string;
    avatar?: string;
  };
  date: Date;
  type?: 'create' | 'update' | 'delete' | 'comment' | 'assign' | 'complete';
}

interface ActivityTimelineProps {
  activities: Activity[];
  maxItems?: number;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

const activityTypeConfig: Record<string, { icon: LucideIcon; color: string }> = {
  create: { icon: Circle, color: 'text-green-500' },
  update: { icon: Clock, color: 'text-blue-500' },
  delete: { icon: XCircle, color: 'text-destructive' },
  comment: { icon: Info, color: 'text-muted-foreground' },
  assign: { icon: CheckCircle, color: 'text-primary' },
  complete: { icon: CheckCircle, color: 'text-green-500' },
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  maxItems = 10,
  showLoadMore = true,
  onLoadMore,
  className,
}) => {
  const visibleActivities = activities.slice(0, maxItems);

  return (
    <div className={cn('space-y-4', className)}>
      {visibleActivities.map((activity, index) => {
        const config = activityTypeConfig[activity.type || 'update'];
        const Icon = config.icon;

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-start gap-3"
          >
            {/* User avatar */}
            <div className="relative">
              {activity.user.avatar ? (
                <img
                  src={activity.user.avatar}
                  alt={activity.user.name}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                  {activity.user.name[0]}
                </div>
              )}
              <div className={cn('absolute -bottom-1 -right-1', config.color)}>
                <Icon className="h-3 w-3" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{activity.user.name}</span>{' '}
                <span className="text-muted-foreground">{activity.action}</span>
                {activity.target && (
                  <>
                    {' '}
                    <span className="font-medium">{activity.target}</span>
                  </>
                )}
              </p>
              <time className="text-xs text-muted-foreground">
                {formatDistanceToNow(activity.date, { addSuffix: true, locale: ptBR })}
              </time>
            </div>
          </motion.div>
        );
      })}

      {showLoadMore && activities.length > maxItems && (
        <Button variant="ghost" className="w-full" onClick={onLoadMore}>
          Ver mais atividades
        </Button>
      )}
    </div>
  );
};

// Process Timeline - For showing step-by-step processes
interface ProcessStep {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'pending';
  estimatedTime?: string;
  actualTime?: string;
}

interface ProcessTimelineProps {
  steps: ProcessStep[];
  currentStep?: number;
  className?: string;
}

export const ProcessTimeline: React.FC<ProcessTimelineProps> = ({
  steps,
  currentStep,
  className,
}) => {
  return (
    <div className={cn('space-y-0', className)}>
      {steps.map((step, index) => {
        const isCompleted = step.status === 'completed';
        const isCurrent = step.status === 'current';
        const isPending = step.status === 'pending';

        return (
          <div key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Connector */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'absolute left-4 top-8 bottom-0 w-0.5',
                  isCompleted ? 'bg-green-500' : 'bg-border'
                )}
              />
            )}

            {/* Step indicator */}
            <div
              className={cn(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ring-4 ring-background',
                isCompleted && 'bg-green-500 text-white',
                isCurrent && 'bg-primary text-primary-foreground animate-pulse',
                isPending && 'bg-muted text-muted-foreground'
              )}
            >
              {isCompleted ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h4 className={cn(
                'font-medium',
                isPending && 'text-muted-foreground'
              )}>
                {step.title}
              </h4>
              {step.description && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              )}
              {(step.estimatedTime || step.actualTime) && (
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  {step.estimatedTime && (
                    <span>Estimado: {step.estimatedTime}</span>
                  )}
                  {step.actualTime && (
                    <span>Realizado: {step.actualTime}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
