import React, { useState, useCallback, createContext, useContext } from 'react';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// ============================================
// WIZARD CONTEXT
// ============================================

interface WizardContextType {
  currentStep: number;
  totalSteps: number;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  setCanGoNext: (can: boolean) => void;
  data: Record<string, unknown>;
  setData: (key: string, value: unknown) => void;
  updateData: (newData: Record<string, unknown>) => void;
}

const WizardContext = createContext<WizardContextType | null>(null);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a FormWizard');
  }
  return context;
}

// ============================================
// WIZARD STEP
// ============================================

interface WizardStepProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onValidate?: () => boolean | Promise<boolean>;
}

export function WizardStep({ children }: WizardStepProps) {
  return <>{children}</>;
}

// ============================================
// FORM WIZARD
// ============================================

interface FormWizardProps {
  children: React.ReactElement<WizardStepProps>[];
  onComplete: (data: Record<string, unknown>) => void | Promise<void>;
  initialData?: Record<string, unknown>;
  showProgress?: boolean;
  showStepIndicator?: boolean;
  allowSkip?: boolean;
  className?: string;
}

export function FormWizard({
  children,
  onComplete,
  initialData = {},
  showProgress = true,
  showStepIndicator = true,
  allowSkip = false,
  className
}: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [canGoNext, setCanGoNext] = useState(true);
  const [data, setDataState] = useState<Record<string, unknown>>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps = React.Children.toArray(children) as React.ReactElement<WizardStepProps>[];
  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const currentStepElement = steps[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const setData = useCallback((key: string, value: unknown) => {
    setDataState(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateData = useCallback((newData: Record<string, unknown>) => {
    setDataState(prev => ({ ...prev, ...newData }));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const nextStep = useCallback(async () => {
    const stepProps = currentStepElement.props;
    
    if (stepProps.onValidate) {
      const isValid = await stepProps.onValidate();
      if (!isValid) return;
    }

    setCompletedSteps(prev => new Set([...prev, currentStep]));

    if (isLastStep) {
      setIsSubmitting(true);
      try {
        await onComplete(data);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, currentStepElement, data, isLastStep, onComplete]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  }, [isFirstStep]);

  const contextValue: WizardContextType = {
    currentStep,
    totalSteps,
    goToStep,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep,
    canGoNext,
    setCanGoNext,
    data,
    setData,
    updateData
  };

  return (
    <WizardContext.Provider value={contextValue}>
      <Card className={cn("w-full max-w-2xl mx-auto", className)}>
        {showStepIndicator && (
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const isCompleted = completedSteps.has(index);
                const isCurrent = index === currentStep;
                const isClickable = isCompleted || index <= currentStep;

                return (
                  <React.Fragment key={index}>
                    <button
                      onClick={() => isClickable && goToStep(index)}
                      disabled={!isClickable}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                        isCompleted && "bg-primary border-primary text-primary-foreground",
                        isCurrent && !isCompleted && "border-primary text-primary",
                        !isCurrent && !isCompleted && "border-muted text-muted-foreground",
                        isClickable && "cursor-pointer hover:opacity-80"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.props.icon || <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </button>
                    {index < totalSteps - 1 && (
                      <div className={cn(
                        "flex-1 h-0.5 mx-2",
                        isCompleted ? "bg-primary" : "bg-muted"
                      )} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <CardTitle>{currentStepElement.props.title}</CardTitle>
            {currentStepElement.props.description && (
              <CardDescription>{currentStepElement.props.description}</CardDescription>
            )}

            {showProgress && (
              <Progress value={progress} className="mt-4" />
            )}
          </CardHeader>
        )}

        <CardContent className="min-h-[300px]">
          {currentStepElement}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={isFirstStep || isSubmitting}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Passo {currentStep + 1} de {totalSteps}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {allowSkip && !isLastStep && (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={isSubmitting}
              >
                Pular
              </Button>
            )}
            <Button
              onClick={nextStep}
              disabled={!canGoNext || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : isLastStep ? (
                'Concluir'
              ) : (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </WizardContext.Provider>
  );
}

// ============================================
// SIMPLE STEPPER
// ============================================

interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  status?: 'pending' | 'current' | 'completed' | 'error';
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  onStepClick?: (index: number) => void;
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  orientation = 'horizontal',
  onStepClick,
  className
}: StepperProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={cn(
      "flex",
      isHorizontal ? "items-center" : "flex-col",
      className
    )}>
      {steps.map((step, index) => {
        const status = step.status || (
          index < currentStep ? 'completed' :
          index === currentStep ? 'current' : 'pending'
        );

        const isLast = index === steps.length - 1;
        const isClickable = onStepClick && (status === 'completed' || index <= currentStep);

        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex",
                isHorizontal ? "flex-col items-center" : "items-start gap-4",
                isClickable && "cursor-pointer"
              )}
              onClick={() => isClickable && onStepClick?.(index)}
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                status === 'completed' && "bg-primary border-primary text-primary-foreground",
                status === 'current' && "border-primary text-primary bg-primary/10",
                status === 'pending' && "border-muted text-muted-foreground",
                status === 'error' && "border-destructive text-destructive bg-destructive/10"
              )}>
                {status === 'completed' ? (
                  <Check className="h-5 w-5" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              <div className={cn(
                isHorizontal ? "text-center mt-2" : "",
                "min-w-0"
              )}>
                <p className={cn(
                  "text-sm font-medium",
                  status === 'current' && "text-primary",
                  status === 'pending' && "text-muted-foreground"
                )}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[150px]">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {!isLast && (
              <div className={cn(
                isHorizontal
                  ? "flex-1 h-0.5 mx-4"
                  : "w-0.5 h-8 ml-5",
                index < currentStep ? "bg-primary" : "bg-muted"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================
// HOOK: useFormWizard
// ============================================

interface UseFormWizardOptions<T> {
  steps: string[];
  initialData?: Partial<T>;
  onStepChange?: (step: number, data: T) => void;
  validateStep?: (step: number, data: T) => boolean | string[];
}

export function useFormWizard<T extends Record<string, unknown>>({
  steps,
  initialData = {} as Partial<T>,
  onStepChange,
  validateStep
}: UseFormWizardOptions<T>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<T>(initialData as T);
  const [errors, setErrors] = useState<string[]>([]);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));

  const totalSteps = steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  }, []);

  const updateFields = useCallback((fields: Partial<T>) => {
    setData(prev => ({ ...prev, ...fields }));
    setErrors([]);
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
      setVisitedSteps(prev => new Set([...prev, step]));
      onStepChange?.(step, data);
    }
  }, [totalSteps, data, onStepChange]);

  const nextStep = useCallback(() => {
    if (validateStep) {
      const result = validateStep(currentStep, data);
      if (result !== true) {
        setErrors(Array.isArray(result) ? result : []);
        return false;
      }
    }
    
    if (!isLastStep) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setVisitedSteps(prev => new Set([...prev, next]));
      onStepChange?.(next, data);
    }
    return true;
  }, [currentStep, data, isLastStep, validateStep, onStepChange]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      onStepChange?.(prev, data);
    }
  }, [currentStep, isFirstStep, data, onStepChange]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setData(initialData as T);
    setErrors([]);
    setVisitedSteps(new Set([0]));
  }, [initialData]);

  return {
    currentStep,
    totalSteps,
    steps,
    currentStepName: steps[currentStep],
    isFirstStep,
    isLastStep,
    progress,
    data,
    errors,
    visitedSteps,
    updateField,
    updateFields,
    goToStep,
    nextStep,
    prevStep,
    reset,
    canGoBack: !isFirstStep,
    canGoForward: !isLastStep
  };
}
