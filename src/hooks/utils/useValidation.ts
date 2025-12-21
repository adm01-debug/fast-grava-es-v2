import { useState, useCallback } from 'react';

type ValidationRule<T> = { validate: (value: T) => boolean; message: string; };

export function useValidation<T>(value: T, rules: ValidationRule<T>[]) {
  const [errors, setErrors] = useState<string[]>([]);

  const validate = useCallback(() => {
    const newErrors = rules.filter(rule => !rule.validate(value)).map(rule => rule.message);
    setErrors(newErrors);
    return newErrors.length === 0;
  }, [value, rules]);

  const isValid = errors.length === 0;
  const firstError = errors[0] || null;

  return { errors, isValid, firstError, validate };
}
