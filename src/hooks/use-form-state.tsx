import { useState, useCallback, useRef, useEffect } from 'react';

// Tipos para validação
export type ValidationRule<T> = {
  validate: (value: T, formValues?: Record<string, unknown>) => boolean;
  message: string;
};

export type FieldConfig<T> = {
  initialValue: T;
  rules?: ValidationRule<T>[];
  transform?: (value: T) => T;
};

export type FormConfig<T extends Record<string, unknown>> = {
  [K in keyof T]: FieldConfig<T[K]>;
};

export type FormErrors<T> = {
  [K in keyof T]?: string[];
};

export type FormTouched<T> = {
  [K in keyof T]?: boolean;
};

// Hook principal de formulário
export function useFormState<T extends Record<string, unknown>>(config: FormConfig<T>) {
  const initialValues = Object.keys(config).reduce((acc, key) => {
    acc[key as keyof T] = config[key as keyof T].initialValue;
    return acc;
  }, {} as T);

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]): string[] => {
      const fieldConfig = config[name];
      if (!fieldConfig.rules) return [];

      return fieldConfig.rules
        .filter((rule) => !rule.validate(value, values))
        .map((rule) => rule.message);
    },
    [config, values]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;

    Object.keys(config).forEach((key) => {
      const fieldErrors = validateField(key as keyof T, values[key as keyof T]);
      if (fieldErrors.length > 0) {
        newErrors[key as keyof T] = fieldErrors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [config, values, validateField]);

  const setFieldValue = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      const fieldConfig = config[name];
      const transformedValue = fieldConfig.transform ? fieldConfig.transform(value) : value;

      setValues((prev) => ({ ...prev, [name]: transformedValue }));
      setIsDirty(true);

      // Validar ao mudar se campo já foi tocado
      if (touched[name]) {
        const fieldErrors = validateField(name, transformedValue);
        setErrors((prev) => ({ ...prev, [name]: fieldErrors.length > 0 ? fieldErrors : undefined }));
      }
    },
    [config, touched, validateField]
  );

  const setFieldTouched = useCallback((name: keyof T, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [name]: isTouched }));

    if (isTouched) {
      const fieldErrors = validateField(name, values[name]);
      setErrors((prev) => ({ ...prev, [name]: fieldErrors.length > 0 ? fieldErrors : undefined }));
    }
  }, [validateField, values]);

  const handleChange = useCallback(
    (name: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFieldValue(name, e.target.value as T[keyof T]);
    },
    [setFieldValue]
  );

  const handleBlur = useCallback(
    (name: keyof T) => () => {
      setFieldTouched(name, true);
    },
    [setFieldTouched]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) => async (e?: React.FormEvent) => {
      e?.preventDefault();

      // Marcar todos os campos como tocados
      const allTouched = Object.keys(config).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as FormTouched<T>);
      setTouched(allTouched);

      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [config, validateForm, values]
  );

  const getFieldProps = useCallback(
    (name: keyof T) => ({
      value: values[name],
      onChange: handleChange(name),
      onBlur: handleBlur(name),
      error: touched[name] ? errors[name]?.[0] : undefined,
    }),
    [values, handleChange, handleBlur, touched, errors]
  );

  const isValid = Object.keys(errors).every((key) => !errors[key as keyof T]?.length);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    isValid,
    setFieldValue,
    setFieldTouched,
    validateField,
    validateForm,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    getFieldProps,
  };
}

// Hook para campo controlado individual
export function useField<T>(
  initialValue: T,
  options: {
    validate?: (value: T) => string | null;
    transform?: (value: T) => T;
  } = {}
) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validate = useCallback(() => {
    if (options.validate) {
      const err = options.validate(value);
      setError(err);
      return !err;
    }
    return true;
  }, [value, options]);

  const handleChange = useCallback(
    (newValue: T) => {
      const transformed = options.transform ? options.transform(newValue) : newValue;
      setValue(transformed);
      if (touched && options.validate) {
        setError(options.validate(transformed));
      }
    },
    [options, touched]
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    validate();
  }, [validate]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setTouched(false);
  }, [initialValue]);

  return {
    value,
    error,
    touched,
    setValue: handleChange,
    setTouched,
    validate,
    handleBlur,
    reset,
    inputProps: {
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value as unknown as T),
      onBlur: handleBlur,
    },
  };
}

// Hook para arrays de formulário (ex: campos dinâmicos)
export function useFieldArray<T>(initialItems: T[] = []) {
  const [items, setItems] = useState(initialItems);

  const append = useCallback((item: T) => {
    setItems((prev) => [...prev, item]);
  }, []);

  const prepend = useCallback((item: T) => {
    setItems((prev) => [item, ...prev]);
  }, []);

  const insert = useCallback((index: number, item: T) => {
    setItems((prev) => [...prev.slice(0, index), item, ...prev.slice(index)]);
  }, []);

  const remove = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const move = useCallback((from: number, to: number) => {
    setItems((prev) => {
      const result = [...prev];
      const [removed] = result.splice(from, 1);
      result.splice(to, 0, removed);
      return result;
    });
  }, []);

  const swap = useCallback((indexA: number, indexB: number) => {
    setItems((prev) => {
      const result = [...prev];
      [result[indexA], result[indexB]] = [result[indexB], result[indexA]];
      return result;
    });
  }, []);

  const update = useCallback((index: number, item: T) => {
    setItems((prev) => prev.map((p, i) => (i === index ? item : p)));
  }, []);

  const replace = useCallback((newItems: T[]) => {
    setItems(newItems);
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    append,
    prepend,
    insert,
    remove,
    move,
    swap,
    update,
    replace,
    clear,
    length: items.length,
  };
}

// Hook para input com máscara
export function useMaskedInput(
  mask: string,
  options: { placeholder?: string } = {}
) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const applyMask = useCallback(
    (inputValue: string): string => {
      const cleanValue = inputValue.replace(/\D/g, '');
      let maskedValue = '';
      let valueIndex = 0;

      for (let i = 0; i < mask.length && valueIndex < cleanValue.length; i++) {
        if (mask[i] === '9') {
          maskedValue += cleanValue[valueIndex];
          valueIndex++;
        } else {
          maskedValue += mask[i];
          if (mask[i] === cleanValue[valueIndex]) {
            valueIndex++;
          }
        }
      }

      return maskedValue;
    },
    [mask]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = applyMask(e.target.value);
      setValue(newValue);
    },
    [applyMask]
  );

  const getRawValue = useCallback(() => {
    return value.replace(/\D/g, '');
  }, [value]);

  return {
    value,
    rawValue: getRawValue(),
    onChange: handleChange,
    inputRef,
    inputProps: {
      ref: inputRef,
      value,
      onChange: handleChange,
      placeholder: options.placeholder || mask.replace(/9/g, '_'),
    },
  };
}

// Hook para debounced input
export function useDebouncedInput(
  initialValue: string = '',
  delay: number = 300
) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  return {
    value,
    debouncedValue,
    setValue,
    handleChange,
    inputProps: {
      value,
      onChange: handleChange,
    },
  };
}

// Hook para form com steps
export function useMultiStepForm<T extends Record<string, unknown>>(
  steps: Array<{
    id: string;
    fields: (keyof T)[];
    validate?: (values: Partial<T>) => boolean;
  }>,
  initialValues: T
) {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<T>(initialValues);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepConfig = steps[currentStep];

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

  const nextStep = useCallback(() => {
    if (!isLastStep) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, isLastStep]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const canProceed = useCallback(() => {
    if (currentStepConfig.validate) {
      const stepValues: Partial<T> = {};
      currentStepConfig.fields.forEach((field) => {
        stepValues[field] = values[field];
      });
      return currentStepConfig.validate(stepValues);
    }
    return true;
  }, [currentStepConfig, values]);

  const getStepValues = useCallback(() => {
    const stepValues: Partial<T> = {};
    currentStepConfig.fields.forEach((field) => {
      stepValues[field] = values[field];
    });
    return stepValues;
  }, [currentStepConfig, values]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setValues(initialValues);
    setCompletedSteps(new Set());
  }, [initialValues]);

  return {
    currentStep,
    currentStepConfig,
    values,
    isFirstStep,
    isLastStep,
    completedSteps,
    totalSteps: steps.length,
    progress: ((currentStep + 1) / steps.length) * 100,
    goToStep,
    nextStep,
    prevStep,
    setFieldValue,
    canProceed,
    getStepValues,
    reset,
  };
}
