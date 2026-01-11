import { useState, useEffect, useCallback, useRef } from 'react';

// Stepper / Wizard Hook
interface Step {
  id: string;
  title: string;
  description?: string;
  isOptional?: boolean;
  isCompleted?: boolean;
  validate?: () => boolean | Promise<boolean>;
}

interface UseStepperOptions {
  steps: Step[];
  initialStep?: number;
  onStepChange?: (step: number, direction: 'next' | 'prev') => void;
  onComplete?: () => void;
}

export function useStepper({
  steps,
  initialStep = 0,
  onStepChange,
  onComplete,
}: UseStepperOptions) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isValidating, setIsValidating] = useState(false);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

  const nextStep = useCallback(async () => {
    if (isLastStep) {
      onComplete?.();
      return;
    }

    const step = steps[currentStep];
    
    if (step.validate) {
      setIsValidating(true);
      try {
        const isValid = await step.validate();
        if (!isValid) {
          setIsValidating(false);
          return;
        }
      } catch {
        setIsValidating(false);
        return;
      }
      setIsValidating(false);
    }

    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    setCurrentStep((prev) => prev + 1);
    onStepChange?.(currentStep + 1, 'next');
  }, [currentStep, isLastStep, steps, onComplete, onStepChange]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
      onStepChange?.(currentStep - 1, 'prev');
    }
  }, [currentStep, isFirstStep, onStepChange]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
  }, []);

  const markCompleted = useCallback((step: number) => {
    setCompletedSteps((prev) => new Set(prev).add(step));
  }, []);

  const isStepCompleted = useCallback((step: number) => {
    return completedSteps.has(step);
  }, [completedSteps]);

  const canGoToStep = useCallback((step: number) => {
    // Can always go back
    if (step < currentStep) return true;
    // Can go forward only if all previous steps are completed
    for (let i = currentStep; i < step; i++) {
      if (!completedSteps.has(i) && !steps[i].isOptional) {
        return false;
      }
    }
    return true;
  }, [currentStep, completedSteps, steps]);

  return {
    currentStep,
    currentStepData,
    steps,
    isFirstStep,
    isLastStep,
    isValidating,
    progress,
    goToStep,
    nextStep,
    prevStep,
    reset,
    markCompleted,
    isStepCompleted,
    canGoToStep,
    completedSteps: Array.from(completedSteps),
  };
}

// Multi-step form hook
interface UseMultiStepFormOptions<T> {
  steps: string[];
  initialData: T;
  onSubmit: (data: T) => Promise<void>;
  validateStep?: (step: number, data: T) => boolean | Promise<boolean>;
}

export function useMultiStepForm<T extends Record<string, unknown>>({
  steps,
  initialData,
  onSubmit,
  validateStep,
}: UseMultiStepFormOptions<T>) {
  const [data, setData] = useState<T>(initialData);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateData = useCallback((updates: Partial<T>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const setFieldValue = useCallback((field: keyof T, value: unknown) => {
    setData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    setErrors((prev) => {
      const { [field as string]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const next = useCallback(async () => {
    if (validateStep) {
      const isValid = await validateStep(currentStep, data);
      if (!isValid) return false;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return true;
    }
    return false;
  }, [currentStep, steps.length, validateStep, data]);

  const prev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goTo = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  }, [data, onSubmit]);

  const reset = useCallback(() => {
    setData(initialData);
    setCurrentStep(0);
    setErrors({});
  }, [initialData]);

  return {
    data,
    currentStep,
    currentStepName: steps[currentStep],
    errors,
    isSubmitting,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    progress: ((currentStep + 1) / steps.length) * 100,
    updateData,
    setFieldValue,
    setFieldError,
    clearErrors,
    next,
    prev,
    goTo,
    submit,
    reset,
  };
}

// Countdown hook
interface UseCountdownOptions {
  initialSeconds: number;
  autoStart?: boolean;
  onComplete?: () => void;
}

export function useCountdown({
  initialSeconds,
  autoStart = false,
  onComplete,
}: UseCountdownOptions) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newSeconds?: number) => {
    setSeconds(newSeconds ?? initialSeconds);
    setIsRunning(false);
  }, [initialSeconds]);

  const restart = useCallback((newSeconds?: number) => {
    setSeconds(newSeconds ?? initialSeconds);
    setIsRunning(true);
  }, [initialSeconds]);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, seconds, onComplete]);

  const formatted = {
    hours: Math.floor(seconds / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    display: `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`,
  };

  return {
    seconds,
    isRunning,
    isComplete: seconds === 0,
    formatted,
    start,
    pause,
    reset,
    restart,
  };
}

// Timer hook (counts up)
export function useTimer(autoStart = false) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setSeconds(0);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  return {
    seconds,
    isRunning,
    formatted: `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`,
    start,
    pause,
    reset,
  };
}
