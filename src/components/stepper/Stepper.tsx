import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  isOptional?: boolean;
  isDisabled?: boolean;
  validate?: () => boolean | Promise<boolean>;
}

export type StepStatus = 'pending' | 'current' | 'completed' | 'error';

// ============================================
// STEPPER HOOK
// ============================================

interface UseStepperOptions {
  steps: Step[];
  initialStep?: number;
  onComplete?: () => void;
  onStepChange?: (step: number) => void;
}

export function useStepper({
  steps,
  initialStep = 0,
  onComplete,
  onStepChange
}: UseStepperOptions) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [errorSteps, setErrorSteps] = useState<Set<number>>(new Set());
  const [isValidating, setIsValidating] = useState(false);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length && !steps[step].isDisabled) {
      setCurrentStep(step);
      onStepChange?.(step);
    }
  }, [steps, onStepChange]);

  const nextStep = useCallback(async () => {
    const step = steps[currentStep];
    
    if (step.validate) {
      setIsValidating(true);
      try {
        const isValid = await step.validate();
        if (!isValid) {
          setErrorSteps(prev => new Set([...prev, currentStep]));
          setIsValidating(false);
          return false;
        }
      } catch {
        setErrorSteps(prev => new Set([...prev, currentStep]));
        setIsValidating(false);
        return false;
      }
      setIsValidating(false);
    }

    setCompletedSteps(prev => new Set([...prev, currentStep]));
    setErrorSteps(prev => {
      const newSet = new Set(prev);
      newSet.delete(currentStep);
      return newSet;
    });

    if (isLastStep) {
      onComplete?.();
      return true;
    }

    setCurrentStep(prev => prev + 1);
    onStepChange?.(currentStep + 1);
    return true;
  }, [currentStep, steps, isLastStep, onComplete, onStepChange]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
      onStepChange?.(currentStep - 1);
    }
  }, [isFirstStep, currentStep, onStepChange]);

  const reset = useCallback(() => {
    setCurrentStep(initialStep);
    setCompletedSteps(new Set());
    setErrorSteps(new Set());
  }, [initialStep]);

  const getStepStatus = useCallback((index: number): StepStatus => {
    if (errorSteps.has(index)) return 'error';
    if (completedSteps.has(index)) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  }, [currentStep, completedSteps, errorSteps]);

  return {
    currentStep,
    steps,
    isFirstStep,
    isLastStep,
    progress,
    isValidating,
    goToStep,
    nextStep,
    prevStep,
    reset,
    getStepStatus,
    completedSteps,
    errorSteps
  };
}

// ============================================
// HORIZONTAL STEPPER
// ============================================

interface StepperProps {
  steps: Step[];
  currentStep: number;
  getStepStatus: (index: number) => StepStatus;
  onStepClick?: (index: number) => void;
  className?: string;
  showLabels?: boolean;
}

export function Stepper({
  steps,
  currentStep,
  getStepStatus,
  onStepClick,
  className,
  showLabels = true
}: StepperProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;
          const isClickable = onStepClick && !step.isDisabled;

          return (
            <React.Fragment key={step.id}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={step.isDisabled}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all',
                    'border-2',
                    status === 'completed' && 'bg-primary border-primary text-primary-foreground',
                    status === 'current' && 'border-primary text-primary ring-4 ring-primary/20',
                    status === 'error' && 'border-destructive text-destructive bg-destructive/10',
                    status === 'pending' && 'border-muted-foreground/30 text-muted-foreground',
                    isClickable && 'cursor-pointer hover:border-primary/50',
                    step.isDisabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    index + 1
                  )}
                </button>

                {/* Label */}
                {showLabels && (
                  <div className="mt-2 text-center max-w-[100px]">
                    <p className={cn(
                      'text-sm font-medium truncate',
                      status === 'current' && 'text-primary',
                      status === 'completed' && 'text-foreground',
                      status === 'error' && 'text-destructive',
                      status === 'pending' && 'text-muted-foreground'
                    )}>
                      {step.title}
                    </p>
                    {step.isOptional && (
                      <p className="text-xs text-muted-foreground">Opcional</p>
                    )}
                  </div>
                )}
              </div>

              {/* Connector */}
              {!isLast && (
                <div className="flex-1 mx-2 h-0.5 min-w-[40px]">
                  <div 
                    className={cn(
                      'h-full transition-all duration-300',
                      status === 'completed' ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// VERTICAL STEPPER
// ============================================

interface VerticalStepperProps {
  steps: Step[];
  currentStep: number;
  getStepStatus: (index: number) => StepStatus;
  onStepClick?: (index: number) => void;
  className?: string;
}

export function VerticalStepper({
  steps,
  currentStep,
  getStepStatus,
  onStepClick,
  className
}: VerticalStepperProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isLast = index === steps.length - 1;
        const isClickable = onStepClick && !step.isDisabled;

        return (
          <div key={step.id} className="flex">
            {/* Step indicator column */}
            <div className="flex flex-col items-center mr-4">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(index)}
                disabled={step.isDisabled}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all shrink-0',
                  'border-2',
                  status === 'completed' && 'bg-primary border-primary text-primary-foreground',
                  status === 'current' && 'border-primary text-primary ring-4 ring-primary/20',
                  status === 'error' && 'border-destructive text-destructive bg-destructive/10',
                  status === 'pending' && 'border-muted-foreground/30 text-muted-foreground',
                  isClickable && 'cursor-pointer hover:border-primary/50'
                )}
              >
                {status === 'completed' ? (
                  <Check className="w-5 h-5" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  index + 1
                )}
              </button>
              
              {!isLast && (
                <div 
                  className={cn(
                    'w-0.5 flex-1 min-h-[40px] my-2',
                    status === 'completed' ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>

            {/* Content column */}
            <div className={cn('pb-8 flex-1', isLast && 'pb-0')}>
              <div className="pt-2">
                <h4 className={cn(
                  'font-medium',
                  status === 'current' && 'text-primary',
                  status === 'error' && 'text-destructive'
                )}>
                  {step.title}
                  {step.isOptional && (
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      (Opcional)
                    </span>
                  )}
                </h4>
                {step.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                )}
              </div>

              <AnimatePresence mode="wait">
                {status === 'current' && step.content && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4"
                  >
                    {step.content}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// STEPPER WITH CONTENT
// ============================================

interface StepperWithContentProps {
  steps: Step[];
  onComplete?: () => void;
  orientation?: 'horizontal' | 'vertical';
  showNavigation?: boolean;
  nextLabel?: string;
  prevLabel?: string;
  completeLabel?: string;
  className?: string;
}

export function StepperWithContent({
  steps,
  onComplete,
  orientation = 'horizontal',
  showNavigation = true,
  nextLabel = 'Próximo',
  prevLabel = 'Anterior',
  completeLabel = 'Concluir',
  className
}: StepperWithContentProps) {
  const {
    currentStep,
    isFirstStep,
    isLastStep,
    progress,
    isValidating,
    nextStep,
    prevStep,
    goToStep,
    getStepStatus
  } = useStepper({ steps, onComplete });

  const currentStepData = steps[currentStep];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress bar */}
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Stepper */}
      {orientation === 'horizontal' ? (
        <Stepper
          steps={steps}
          currentStep={currentStep}
          getStepStatus={getStepStatus}
          onStepClick={goToStep}
        />
      ) : (
        <VerticalStepper
          steps={steps}
          currentStep={currentStep}
          getStepStatus={getStepStatus}
          onStepClick={goToStep}
        />
      )}

      {/* Content */}
      {orientation === 'horizontal' && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[200px]"
          >
            {currentStepData.content}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Navigation */}
      {showNavigation && (
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={isFirstStep || isValidating}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {prevLabel}
          </Button>

          <div className="text-sm text-muted-foreground">
            Passo {currentStep + 1} de {steps.length}
          </div>

          <Button
            type="button"
            onClick={nextStep}
            disabled={isValidating}
          >
            {isValidating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLastStep ? completeLabel : nextLabel}
            {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================
// MINIMAL STEPPER (dots only)
// ============================================

interface MinimalStepperProps {
  totalSteps: number;
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function MinimalStepper({
  totalSteps,
  currentStep,
  onStepClick,
  className
}: MinimalStepperProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onStepClick?.(index)}
          className={cn(
            'w-2 h-2 rounded-full transition-all',
            index === currentStep 
              ? 'w-6 bg-primary' 
              : index < currentStep 
                ? 'bg-primary/50' 
                : 'bg-muted',
            onStepClick && 'cursor-pointer hover:bg-primary/70'
          )}
        />
      ))}
    </div>
  );
}
