// Utilitários de validação

// Validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validar CPF
export function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF[10])) return false;
  
  return true;
}

// Validar CNPJ
export function isValidCNPJ(cnpj: string): boolean {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights1[i];
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleanCNPJ[12])) return false;
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights2[i];
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleanCNPJ[13])) return false;
  
  return true;
}

// Validar telefone brasileiro
export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 10 || cleanPhone.length === 11;
}

// Validar CEP
export function isValidCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8;
}

// Validar data
export function isValidDate(date: string, format: 'BR' | 'ISO' = 'BR'): boolean {
  if (format === 'BR') {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = date.match(regex);
    if (!match) return false;
    
    const [, day, month, year] = match;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return d.getDate() === parseInt(day) &&
           d.getMonth() === parseInt(month) - 1 &&
           d.getFullYear() === parseInt(year);
  }
  
  const d = new Date(date);
  return !isNaN(d.getTime());
}

// Validar URL
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validar cartão de crédito (Luhn algorithm)
export function isValidCreditCard(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

// Detectar bandeira do cartão
export function getCardBrand(cardNumber: string): string | null {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  const patterns: { brand: string; regex: RegExp }[] = [
    { brand: 'visa', regex: /^4/ },
    { brand: 'mastercard', regex: /^5[1-5]|^2[2-7]/ },
    { brand: 'amex', regex: /^3[47]/ },
    { brand: 'diners', regex: /^3(?:0[0-5]|[68])/ },
    { brand: 'discover', regex: /^6(?:011|5)/ },
    { brand: 'jcb', regex: /^(?:2131|1800|35)/ },
    { brand: 'elo', regex: /^(?:636368|438935|504175|451416|509|636297)/ },
    { brand: 'hipercard', regex: /^(?:606282|3841)/ },
  ];
  
  for (const { brand, regex } of patterns) {
    if (regex.test(cleanNumber)) return brand;
  }
  
  return null;
}

// Validar senha forte
export function isStrongPassword(
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecial?: boolean;
  } = {}
): { valid: boolean; errors: string[] } {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecial = true,
  } = options;

  const errors: string[] = [];

  if (password.length < minLength) {
    errors.push(`Mínimo de ${minLength} caracteres`);
  }
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Deve conter letra maiúscula');
  }
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Deve conter letra minúscula');
  }
  if (requireNumbers && !/\d/.test(password)) {
    errors.push('Deve conter número');
  }
  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Deve conter caractere especial');
  }

  return { valid: errors.length === 0, errors };
}

// Calcular força da senha
export function getPasswordStrength(password: string): {
  score: number;
  label: 'weak' | 'fair' | 'good' | 'strong';
} {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  if (password.length >= 16) score += 1;

  const labels: Array<'weak' | 'fair' | 'good' | 'strong'> = ['weak', 'weak', 'fair', 'fair', 'good', 'good', 'strong'];
  
  return { score, label: labels[Math.min(score, 6)] };
}

// Validar idade mínima
export function isMinAge(birthDate: Date | string, minAge: number): boolean {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= minAge;
  }
  
  return age >= minAge;
}

// Validar placa de veículo
export function isValidPlate(plate: string): boolean {
  const cleanPlate = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Formato antigo: ABC1234
  const oldFormat = /^[A-Z]{3}\d{4}$/.test(cleanPlate);
  // Formato Mercosul: ABC1D23
  const mercosulFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/.test(cleanPlate);
  
  return oldFormat || mercosulFormat;
}

// Validar RG (formato básico - varia por estado)
export function isValidRG(rg: string): boolean {
  const cleanRG = rg.replace(/\D/g, '');
  return cleanRG.length >= 7 && cleanRG.length <= 9;
}

// Validar PIS/PASEP
export function isValidPIS(pis: string): boolean {
  const cleanPIS = pis.replace(/\D/g, '');
  
  if (cleanPIS.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanPIS)) return false;
  
  const weights = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanPIS[i]) * weights[i];
  }
  
  const remainder = sum % 11;
  const digit = remainder < 2 ? 0 : 11 - remainder;
  
  return digit === parseInt(cleanPIS[10]);
}

// Criar validador customizado
export function createValidator<T>(
  rules: Array<{
    test: (value: T) => boolean;
    message: string;
  }>
) {
  return (value: T): { valid: boolean; errors: string[] } => {
    const errors = rules.filter((rule) => !rule.test(value)).map((rule) => rule.message);
    return { valid: errors.length === 0, errors };
  };
}

// Validações prontas para uso com react-hook-form ou similares
export const validators = {
  required: (message = 'Campo obrigatório') => ({
    validate: (value: unknown) => !!value,
    message,
  }),
  
  email: (message = 'Email inválido') => ({
    validate: (value: string) => isValidEmail(value),
    message,
  }),
  
  cpf: (message = 'CPF inválido') => ({
    validate: (value: string) => isValidCPF(value),
    message,
  }),
  
  cnpj: (message = 'CNPJ inválido') => ({
    validate: (value: string) => isValidCNPJ(value),
    message,
  }),
  
  phone: (message = 'Telefone inválido') => ({
    validate: (value: string) => isValidPhone(value),
    message,
  }),
  
  cep: (message = 'CEP inválido') => ({
    validate: (value: string) => isValidCEP(value),
    message,
  }),
  
  minLength: (length: number, message?: string) => ({
    validate: (value: string) => value.length >= length,
    message: message || `Mínimo de ${length} caracteres`,
  }),
  
  maxLength: (length: number, message?: string) => ({
    validate: (value: string) => value.length <= length,
    message: message || `Máximo de ${length} caracteres`,
  }),
  
  min: (min: number, message?: string) => ({
    validate: (value: number) => value >= min,
    message: message || `Valor mínimo: ${min}`,
  }),
  
  max: (max: number, message?: string) => ({
    validate: (value: number) => value <= max,
    message: message || `Valor máximo: ${max}`,
  }),
  
  pattern: (regex: RegExp, message: string) => ({
    validate: (value: string) => regex.test(value),
    message,
  }),
  
  url: (message = 'URL inválida') => ({
    validate: (value: string) => isValidURL(value),
    message,
  }),
  
  match: (fieldName: string, message?: string) => ({
    validate: (value: unknown, formValues?: Record<string, unknown>) => 
      formValues ? value === formValues[fieldName] : true,
    message: message || `Os campos não conferem`,
  }),
};
