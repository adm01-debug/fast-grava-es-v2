import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Check, ChevronRight, Circle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================
// STEPPER COMPONENT
// ============================================

type StepStatus = 'pending' | 'current' | 'completed' | 'error';

interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'compact' | 'minimal';
  allowClickPast?: boolean;
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  variant = 'default',
  allowClickPast = false,
  className,
}: StepperProps) {
  const getStepStatus = (index: number): StepStatus => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  const handleClick = (index: number) => {
    if (!onStepClick) return;
    if (allowClickPast || index <= currentStep) {
      onStepClick(index);
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <motion.div
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                getStepStatus(index) === 'completed' && "bg-primary",
                getStepStatus(index) === 'current' && "bg-primary ring-4 ring-primary/20",
                getStepStatus(index) === 'pending' && "bg-muted"
              )}
              animate={{ scale: getStepStatus(index) === 'current' ? 1.2 : 1 }}
            />
          </React.Fragment>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {currentStep + 1} / {steps.length}
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center", className)}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => handleClick(index)}
              disabled={!allowClickPast && index > currentStep}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                getStepStatus(index) === 'completed' && "text-primary",
                getStepStatus(index) === 'current' && "bg-primary/10 text-primary",
                getStepStatus(index) === 'pending' && "text-muted-foreground",
                (allowClickPast || index <= currentStep) && "cursor-pointer hover:bg-muted"
              )}
            >
              <StepIcon status={getStepStatus(index)} size="sm" />
              <span className="text-sm font-medium">{step.title}</span>
            </button>
            {index < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        orientation === 'horizontal' ? "flex items-start" : "flex flex-col",
        className
      )}
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <button
            onClick={() => handleClick(index)}
            disabled={!allowClickPast && index > currentStep}
            className={cn(
              "flex gap-4",
              orientation === 'horizontal' ? "flex-col items-center text-center" : "items-start",
              (allowClickPast || index <= currentStep) && "cursor-pointer group"
            )}
          >
            {/* Step indicator */}
            <div className="relative">
              <StepIcon status={getStepStatus(index)} />
              {step.icon && getStepStatus(index) === 'current' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  {step.icon}
                </motion.div>
              )}
            </div>
            
            {/* Step content */}
            <div className={cn(
              orientation === 'horizontal' ? "max-w-[120px]" : "",
              "transition-colors group-hover:text-foreground"
            )}>
              <p className={cn(
                "font-medium text-sm",
                getStepStatus(index) === 'current' && "text-primary",
                getStepStatus(index) === 'pending' && "text-muted-foreground"
              )}>
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </p>
              )}
            </div>
          </button>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                orientation === 'horizontal'
                  ? "flex-1 h-0.5 min-w-[40px] mx-4 mt-5"
                  : "w-0.5 h-8 ml-5 my-2",
                "rounded-full transition-colors",
                index < currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Step Icon Component
function StepIcon({ status, size = 'md' }: { status: StepStatus; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'w-6 h-6' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-5 h-5';

  return (
    <motion.div
      className={cn(
        sizeClasses,
        "rounded-full flex items-center justify-center transition-colors",
        status === 'completed' && "bg-primary text-primary-foreground",
        status === 'current' && "bg-primary/10 text-primary ring-4 ring-primary/20",
        status === 'error' && "bg-destructive text-destructive-foreground",
        status === 'pending' && "bg-muted text-muted-foreground"
      )}
      animate={{ scale: status === 'current' ? 1.1 : 1 }}
    >
      {status === 'completed' && <Check className={iconSize} />}
      {status === 'current' && <Circle className={iconSize} />}
      {status === 'error' && <AlertCircle className={iconSize} />}
      {status === 'pending' && <Circle className={cn(iconSize, "opacity-50")} />}
    </motion.div>
  );
}

// ============================================
// TIMELINE COMPONENT
// ============================================

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string | Date;
  icon?: React.ReactNode;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  content?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  showConnector?: boolean;
  animated?: boolean;
}

export function Timeline({
  items,
  className,
  showConnector = true,
  animated = true,
}: TimelineProps) {
  const colorClasses = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary text-primary-foreground',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    destructive: 'bg-destructive text-destructive-foreground',
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  return (
    <div className={cn("relative", className)}>
      <LayoutGroup>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={animated ? { opacity: 0, x: -20 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {/* Connector line */}
            {showConnector && index < items.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-muted" />
            )}

            {/* Icon */}
            <div
              className={cn(
                "relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                colorClasses[item.color || 'default']
              )}
            >
              {item.icon || <Circle className="w-4 h-4" />}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-medium">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(item.timestamp)}
                </time>
              </div>
              
              {item.content && (
                <div className="mt-3">{item.content}</div>
              )}
            </div>
          </motion.div>
        ))}
      </LayoutGroup>
    </div>
  );
}

// ============================================
// PROGRESS STEPS (for multi-step forms)
// ============================================

interface ProgressStepsProps {
  totalSteps: number;
  currentStep: number;
  labels?: string[];
  className?: string;
}

export function ProgressSteps({
  totalSteps,
  currentStep,
  labels,
  className,
}: ProgressStepsProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Progress bar */}
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        />
      </div>

      {/* Labels */}
      {labels && (
        <div className="flex justify-between">
          {labels.map((label, index) => (
            <span
              key={index}
              className={cn(
                "text-xs transition-colors",
                index <= currentStep ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Step counter */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Etapa {currentStep + 1} de {totalSteps}
        </span>
        <span className="font-medium text-primary">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

// ============================================
// LOADING STEPS (for async processes)
// ============================================

interface LoadingStep {
  id: string;
  label: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  error?: string;
}

interface LoadingStepsProps {
  steps: LoadingStep[];
  className?: string;
}

export function LoadingSteps({ steps, className }: LoadingStepsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {steps.map((step) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          {/* Status icon */}
          <div className="w-6 h-6 flex items-center justify-center">
            {step.status === 'pending' && (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
            {step.status === 'loading' && (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            )}
            {step.status === 'completed' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-5 h-5 rounded-full bg-success flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}
            {step.status === 'error' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center"
              >
                <AlertCircle className="w-3 h-3 text-white" />
              </motion.div>
            )}
          </div>

          {/* Label */}
          <div className="flex-1">
            <span
              className={cn(
                "text-sm",
                step.status === 'pending' && "text-muted-foreground",
                step.status === 'loading' && "text-foreground font-medium",
                step.status === 'completed' && "text-success",
                step.status === 'error' && "text-destructive"
              )}
            >
              {step.label}
            </span>
            {step.error && (
              <p className="text-xs text-destructive mt-0.5">{step.error}</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default Stepper;
