import { useState, useCallback } from 'react';

export function useForm<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(v => ({ ...v, [field]: value }));
  }, []);

  const handleBlur = useCallback(<K extends keyof T>(field: K) => {
    setTouched(t => ({ ...t, [field]: true }));
  }, []);

  const setFieldError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors(e => ({ ...e, [field]: error }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  return { values, errors, touched, handleChange, handleBlur, setFieldError, reset, isValid, isDirty, setValues };
}
