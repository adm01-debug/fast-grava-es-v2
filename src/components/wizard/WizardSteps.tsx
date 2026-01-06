import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Loader2,
  CircleDot,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  isOptional?: boolean;
  validate?: () => boolean | Promise<boolean>;
  onEnter?: () => void | Promise<void>;
  onLeave?: () => void | Promise<void>;
}

interface WizardContextType {
  steps: WizardStep[];
  currentStepIndex: number;
  currentStep: WizardStep;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
  goToStep: (index: number) => void;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  reset: () => void;
  isLoading: boolean;
  errors: Record<string, string>;
  setError: (stepId: string, error: string) => void;
  clearError: (stepId: string) => void;
  completedSteps: Set<string>;
  data: Record<string, unknown>;
  setData: (key: string, value: unknown) => void;
}

interface WizardProviderProps {
  steps: WizardStep[];
  onComplete?: (data: Record<string, unknown>) => void | Promise<void>;
  children: React.ReactNode;
}

// Context
const WizardContext = createContext<WizardContextType | null>(null);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within WizardProvider');
  }
  return context;
}

// Provider
export function WizardProvider({ steps, onComplete, children }: WizardProviderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [data, setDataState] = useState<Record<string, unknown>>({});

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const setData = useCallback((key: string, value: unknown) => {
    setDataState(prev => ({ ...prev, [key]: value }));
  }, []);

  const setError = useCallback((stepId: string, error: string) => {
    setErrors(prev => ({ ...prev, [stepId]: error }));
  }, []);

  const clearError = useCallback((stepId: string) => {
    setErrors(prev => {
      const next = { ...prev };
      delete next[stepId];
      return next;
    });
  }, []);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
    }
  }, [steps.length]);

  const nextStep = useCallback(async () => {
    setIsLoading(true);
    clearError(currentStep.id);

    try {
      // Run validation if exists
      if (currentStep.validate) {
        const isValid = await currentStep.validate();
        if (!isValid) {
          setIsLoading(false);
          return;
        }
      }

      // Run onLeave callback
      if (currentStep.onLeave) {
        await currentStep.onLeave();
      }

      // Mark step as completed
      setCompletedSteps(prev => new Set([...prev, currentStep.id]));

      if (isLastStep) {
        // Complete wizard
        if (onComplete) {
          await onComplete(data);
        }
      } else {
        // Go to next step
        const nextIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextIndex);
        
        // Run onEnter callback for next step
        const nextStepData = steps[nextIndex];
        if (nextStepData.onEnter) {
          await nextStepData.onEnter();
        }
      }
    } catch (error) {
      setError(currentStep.id, error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, currentStepIndex, isLastStep, onComplete, data, steps, clearError, setError]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [isFirstStep]);

  const reset = useCallback(() => {
    setCurrentStepIndex(0);
    setErrors({});
    setCompletedSteps(new Set());
    setDataState({});
  }, []);

  const value = useMemo<WizardContextType>(() => ({
    steps,
    currentStepIndex,
    currentStep,
    isFirstStep,
    isLastStep,
    progress,
    goToStep,
    nextStep,
    prevStep,
    reset,
    isLoading,
    errors,
    setError,
    clearError,
    completedSteps,
    data,
    setData,
  }), [
    steps,
    currentStepIndex,
    currentStep,
    isFirstStep,
    isLastStep,
    progress,
    goToStep,
    nextStep,
    prevStep,
    reset,
    isLoading,
    errors,
    setError,
    clearError,
    completedSteps,
    data,
    setData,
  ]);

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

// Step Indicator Variants
interface StepIndicatorProps {
  variant?: 'dots' | 'numbers' | 'icons' | 'progress';
  className?: string;
}

export function StepIndicator({ variant = 'dots', className }: StepIndicatorProps) {
  const { steps, currentStepIndex, completedSteps, goToStep } = useWizard();

  if (variant === 'progress') {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Passo {currentStepIndex + 1} de {steps.length}
          </span>
          <span className="font-medium">{steps[currentStepIndex].title}</span>
        </div>
        <Progress value={((currentStepIndex + 1) / steps.length) * 100} />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {steps.map((step, index) => {
        const isCompleted = completedSteps.has(step.id);
        const isCurrent = index === currentStepIndex;
        const isClickable = isCompleted || index <= currentStepIndex;

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isClickable && goToStep(index)}
              disabled={!isClickable}
              className={cn(
                'flex items-center justify-center transition-all',
                isClickable && 'cursor-pointer hover:scale-110',
                !isClickable && 'cursor-not-allowed opacity-50'
              )}
            >
              {variant === 'dots' && (
                <div
                  className={cn(
                    'w-3 h-3 rounded-full transition-colors',
                    isCompleted && 'bg-primary',
                    isCurrent && !isCompleted && 'bg-primary/50 ring-2 ring-primary ring-offset-2',
                    !isCurrent && !isCompleted && 'bg-muted'
                  )}
                />
              )}

              {variant === 'numbers' && (
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isCurrent && !isCompleted && 'bg-primary/20 text-primary border-2 border-primary',
                    !isCurrent && !isCompleted && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                </div>
              )}

              {variant === 'icons' && (
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isCurrent && !isCompleted && 'bg-primary/20 text-primary border-2 border-primary',
                    !isCurrent && !isCompleted && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.icon || <CircleDot className="w-5 h-5" />}
                </div>
              )}
            </button>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-8 transition-colors',
                  isCompleted ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Horizontal Stepper
export function HorizontalStepper({ className }: { className?: string }) {
  const { steps, currentStepIndex, completedSteps, goToStep } = useWizard();

  return (
    <div className={cn('flex items-start', className)}>
      {steps.map((step, index) => {
        const isCompleted = completedSteps.has(step.id);
        const isCurrent = index === currentStepIndex;
        const isClickable = isCompleted || index <= currentStepIndex;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center flex-1">
              <button
                onClick={() => isClickable && goToStep(index)}
                disabled={!isClickable}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && !isCompleted && 'bg-primary/20 text-primary border-2 border-primary',
                  !isCurrent && !isCompleted && 'bg-muted text-muted-foreground',
                  isClickable && 'cursor-pointer hover:scale-105'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
              </button>
              <span
                className={cn(
                  'text-sm text-center max-w-[100px]',
                  isCurrent && 'font-medium text-foreground',
                  !isCurrent && 'text-muted-foreground'
                )}
              >
                {step.title}
              </span>
              {step.isOptional && (
                <span className="text-xs text-muted-foreground">(Opcional)</span>
              )}
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 mt-5 mx-2',
                  isCompleted ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Vertical Stepper
export function VerticalStepper({ className }: { className?: string }) {
  const { steps, currentStepIndex, completedSteps, goToStep } = useWizard();

  return (
    <div className={cn('space-y-0', className)}>
      {steps.map((step, index) => {
        const isCompleted = completedSteps.has(step.id);
        const isCurrent = index === currentStepIndex;
        const isClickable = isCompleted || index <= currentStepIndex;

        return (
          <div key={step.id} className="flex">
            <div className="flex flex-col items-center mr-4">
              <button
                onClick={() => isClickable && goToStep(index)}
                disabled={!isClickable}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && !isCompleted && 'bg-primary/20 text-primary border-2 border-primary',
                  !isCurrent && !isCompleted && 'bg-muted text-muted-foreground',
                  isClickable && 'cursor-pointer hover:scale-105'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 flex-1 my-2 min-h-[40px]',
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
            <div className={cn('pb-8', index === steps.length - 1 && 'pb-0')}>
              <h4
                className={cn(
                  'text-sm font-medium',
                  isCurrent && 'text-foreground',
                  !isCurrent && 'text-muted-foreground'
                )}
              >
                {step.title}
                {step.isOptional && (
                  <span className="ml-2 text-xs text-muted-foreground">(Opcional)</span>
                )}
              </h4>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Step Content with Animation
export function WizardContent({ className }: { className?: string }) {
  const { currentStep, currentStepIndex, errors } = useWizard();
  const error = errors[currentStep.id];

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {currentStep.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Navigation Buttons
interface WizardNavigationProps {
  nextLabel?: string;
  prevLabel?: string;
  completeLabel?: string;
  showSkip?: boolean;
  className?: string;
}

export function WizardNavigation({
  nextLabel = 'Próximo',
  prevLabel = 'Anterior',
  completeLabel = 'Concluir',
  showSkip = false,
  className,
}: WizardNavigationProps) {
  const { isFirstStep, isLastStep, nextStep, prevStep, isLoading, currentStep } = useWizard();

  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <Button
        variant="outline"
        onClick={prevStep}
        disabled={isFirstStep || isLoading}
        className={cn(isFirstStep && 'invisible')}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        {prevLabel}
      </Button>

      <div className="flex gap-2">
        {showSkip && currentStep.isOptional && !isLastStep && (
          <Button variant="ghost" onClick={nextStep} disabled={isLoading}>
            Pular
          </Button>
        )}
        <Button onClick={nextStep} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          {isLastStep ? completeLabel : nextLabel}
          {!isLastStep && !isLoading && <ChevronRight className="w-4 h-4 ml-1" />}
        </Button>
      </div>
    </div>
  );
}

// Complete Wizard Component
interface WizardProps {
  steps: WizardStep[];
  onComplete?: (data: Record<string, unknown>) => void | Promise<void>;
  variant?: 'card' | 'minimal';
  stepIndicator?: 'dots' | 'numbers' | 'icons' | 'progress' | 'horizontal' | 'vertical';
  className?: string;
}

export function Wizard({
  steps,
  onComplete,
  variant = 'card',
  stepIndicator = 'dots',
  className,
}: WizardProps) {
  const content = (
    <>
      {stepIndicator === 'horizontal' ? (
        <HorizontalStepper className="mb-8" />
      ) : stepIndicator === 'vertical' ? (
        <div className="flex gap-6">
          <VerticalStepper className="w-48 shrink-0" />
          <div className="flex-1">
            <WizardContent className="mb-6" />
            <WizardNavigation />
          </div>
        </div>
      ) : (
        <>
          <StepIndicator variant={stepIndicator as 'dots' | 'numbers' | 'icons' | 'progress'} className="mb-6" />
          <WizardContent className="mb-6" />
          <WizardNavigation />
        </>
      )}
    </>
  );

  if (stepIndicator === 'vertical') {
    return (
      <WizardProvider steps={steps} onComplete={onComplete}>
        <div className={className}>{content}</div>
      </WizardProvider>
    );
  }

  if (variant === 'card') {
    return (
      <WizardProvider steps={steps} onComplete={onComplete}>
        <Card className={className}>
          <CardHeader>
            <CardTitle>
              <WizardStepTitle />
            </CardTitle>
            <CardDescription>
              <WizardStepDescription />
            </CardDescription>
          </CardHeader>
          <CardContent>{content}</CardContent>
        </Card>
      </WizardProvider>
    );
  }

  return (
    <WizardProvider steps={steps} onComplete={onComplete}>
      <div className={className}>{content}</div>
    </WizardProvider>
  );
}

// Helper Components
function WizardStepTitle() {
  const { currentStep } = useWizard();
  return <>{currentStep.title}</>;
}

function WizardStepDescription() {
  const { currentStep } = useWizard();
  return <>{currentStep.description}</>;
}

// Hook for step data
export function useStepData<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const { data, setData } = useWizard();
  const value = (data[key] as T) ?? defaultValue;
  const setValue = useCallback((newValue: T) => setData(key, newValue), [key, setData]);
  return [value, setValue];
}
