import React from 'react';
import { cn } from '@/lib/utils';
import { formatRelative } from '@/utils/date-utils';
import { Check, Circle, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

// Timeline vertical
interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date: Date | string;
  icon?: React.ReactNode;
  status?: 'completed' | 'current' | 'pending' | 'error';
  metadata?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  variant?: 'default' | 'compact' | 'alternating';
  showConnectors?: boolean;
  className?: string;
}

export function Timeline({ 
  items, 
  variant = 'default',
  showConnectors = true,
  className 
}: TimelineProps) {
  const statusIcons = {
    completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    current: <Circle className="h-4 w-4 text-primary fill-primary" />,
    pending: <Clock className="h-4 w-4 text-muted-foreground" />,
    error: <XCircle className="h-4 w-4 text-destructive" />
  };

  const statusColors = {
    completed: 'bg-green-500',
    current: 'bg-primary',
    pending: 'bg-muted',
    error: 'bg-destructive'
  };

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        {items.map((item, index) => (
          <div key={item.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                'h-2 w-2 rounded-full',
                statusColors[item.status || 'pending']
              )} />
              {showConnectors && index < items.length - 1 && (
                <div className="w-px h-full bg-border flex-1 min-h-[1rem]" />
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground">
                  {formatRelative(item.date)}
                </span>
              </div>
              {item.description && (
                <p className="text-xs text-muted-foreground">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'alternating') {
    return (
      <div className={cn('relative', className)}>
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
        
        {items.map((item, index) => {
          const isLeft = index % 2 === 0;
          return (
            <div 
              key={item.id}
              className={cn(
                'relative flex items-center mb-8',
                isLeft ? 'justify-start' : 'justify-end'
              )}
            >
              {/* Content */}
              <div className={cn(
                'w-5/12 p-4 bg-card border rounded-lg',
                isLeft ? 'mr-auto text-right' : 'ml-auto text-left'
              )}>
                <h4 className="font-medium">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatRelative(item.date)}
                </span>
              </div>
              
              {/* Center dot */}
              <div className={cn(
                'absolute left-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-2 border-background',
                statusColors[item.status || 'pending']
              )} />
            </div>
          );
        })}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          {/* Left: Icon and connector */}
          <div className="flex flex-col items-center">
            <div className={cn(
              'flex items-center justify-center h-8 w-8 rounded-full border-2',
              item.status === 'completed' && 'border-green-500 bg-green-500/10',
              item.status === 'current' && 'border-primary bg-primary/10',
              item.status === 'error' && 'border-destructive bg-destructive/10',
              (!item.status || item.status === 'pending') && 'border-muted bg-muted'
            )}>
              {item.icon || statusIcons[item.status || 'pending']}
            </div>
            {showConnectors && index < items.length - 1 && (
              <div className={cn(
                'w-px flex-1 min-h-[2rem]',
                item.status === 'completed' ? 'bg-green-500' : 'bg-border'
              )} />
            )}
          </div>
          
          {/* Right: Content */}
          <div className="flex-1 pb-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatRelative(item.date)}
              </span>
            </div>
            {item.metadata && (
              <div className="mt-2">{item.metadata}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Activity feed
interface Activity {
  id: string;
  actor: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  date: Date | string;
  icon?: React.ReactNode;
  metadata?: Record<string, string>;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

export function ActivityFeed({ 
  activities, 
  maxItems,
  showLoadMore,
  onLoadMore,
  className 
}: ActivityFeedProps) {
  const displayedActivities = maxItems ? activities.slice(0, maxItems) : activities;

  return (
    <div className={cn('space-y-4', className)}>
      {displayedActivities.map((activity) => (
        <div key={activity.id} className="flex gap-3">
          <div className="flex-shrink-0">
            {activity.actor.avatar ? (
              <img 
                src={activity.actor.avatar} 
                alt={activity.actor.name}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                {activity.icon || activity.actor.name[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{activity.actor.name}</span>
              {' '}{activity.action}
              {activity.target && (
                <span className="font-medium"> {activity.target}</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatRelative(activity.date)}
            </p>
            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
              <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                {Object.entries(activity.metadata).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-muted-foreground">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {showLoadMore && activities.length > (maxItems || 0) && (
        <button 
          onClick={onLoadMore}
          className="w-full text-sm text-primary hover:underline py-2"
        >
          Carregar mais
        </button>
      )}
    </div>
  );
}

// Stepper horizontal
interface Step {
  id: string;
  label: string;
  description?: string;
}

interface HorizontalStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  variant?: 'circles' | 'arrows' | 'dots';
  className?: string;
}

export function HorizontalStepper({
  steps,
  currentStep,
  onStepClick,
  variant = 'circles',
  className
}: HorizontalStepperProps) {
  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center gap-2', className)}>
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => onStepClick?.(index)}
            className={cn(
              'h-2 rounded-full transition-all',
              index === currentStep 
                ? 'w-6 bg-primary' 
                : index < currentStep 
                  ? 'w-2 bg-primary/50' 
                  : 'w-2 bg-muted'
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === 'arrows') {
    return (
      <div className={cn('flex items-center', className)}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => onStepClick?.(index)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded',
                index === currentStep && 'bg-primary text-primary-foreground',
                index < currentStep && 'text-primary',
                index > currentStep && 'text-muted-foreground'
              )}
            >
              {index < currentStep && <Check className="h-4 w-4" />}
              <span className="text-sm font-medium">{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <div className="flex-1 h-px bg-border mx-2" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Default circles variant
  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <button
            onClick={() => onStepClick?.(index)}
            className="flex flex-col items-center gap-2"
          >
            <div className={cn(
              'h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors',
              index === currentStep && 'border-primary bg-primary text-primary-foreground',
              index < currentStep && 'border-primary bg-primary text-primary-foreground',
              index > currentStep && 'border-muted bg-background text-muted-foreground'
            )}>
              {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
            </div>
            <div className="text-center">
              <p className={cn(
                'text-sm font-medium',
                index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground">{step.description}</p>
              )}
            </div>
          </button>
          {index < steps.length - 1 && (
            <div className={cn(
              'flex-1 h-0.5 mx-4 mt-[-2rem]',
              index < currentStep ? 'bg-primary' : 'bg-muted'
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Progress timeline (para processos)
interface ProcessStep {
  id: string;
  label: string;
  status: 'completed' | 'in-progress' | 'pending' | 'error';
  startedAt?: Date | string;
  completedAt?: Date | string;
}

interface ProcessTimelineProps {
  steps: ProcessStep[];
  className?: string;
}

export function ProcessTimeline({ steps, className }: ProcessTimelineProps) {
  const statusStyles = {
    completed: { bg: 'bg-green-500', text: 'text-green-700', icon: CheckCircle2 },
    'in-progress': { bg: 'bg-primary', text: 'text-primary', icon: Clock },
    pending: { bg: 'bg-muted', text: 'text-muted-foreground', icon: Circle },
    error: { bg: 'bg-destructive', text: 'text-destructive', icon: AlertCircle }
  };

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => {
        const style = statusStyles[step.status];
        const Icon = style.icon;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center',
                step.status === 'in-progress' ? 'animate-pulse' : '',
                style.bg
              )}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <span className={cn('text-xs font-medium text-center', style.text)}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-1 mx-2 rounded-full',
                steps[index].status === 'completed' ? 'bg-green-500' : 'bg-muted'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
