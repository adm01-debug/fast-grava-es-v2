// Forms Types
export interface FormField<T = string> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date' | 'time' | 'datetime';
  placeholder?: string;
  defaultValue?: T;
  required?: boolean;
  disabled?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
}

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface JobFormData {
  title: string;
  description: string;
  machineId: string;
  operatorId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  quantity: number;
}

export interface OperatorFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  shift: 'morning' | 'afternoon' | 'night';
  skills: string[];
}
