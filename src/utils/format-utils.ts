// Utilitários avançados de formatação

// Formatar número com precisão
export function formatNumber(
  value: number,
  options: {
    decimals?: number;
    locale?: string;
    compact?: boolean;
    prefix?: string;
    suffix?: string;
  } = {}
): string {
  const { 
    decimals = 2, 
    locale = 'pt-BR', 
    compact = false,
    prefix = '',
    suffix = ''
  } = options;

  let formatted: string;

  if (compact) {
    formatted = new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: decimals,
    }).format(value);
  } else {
    formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  return `${prefix}${formatted}${suffix}`;
}

// Formatar porcentagem
export function formatPercentage(
  value: number,
  options: { decimals?: number; locale?: string; showSign?: boolean } = {}
): string {
  const { decimals = 1, locale = 'pt-BR', showSign = false } = options;

  const formatted = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);

  if (showSign && value > 0) {
    return `+${formatted}`;
  }

  return formatted;
}

// Formatar moeda
export function formatCurrency(
  value: number,
  options: { currency?: string; locale?: string; compact?: boolean } = {}
): string {
  const { currency = 'BRL', locale = 'pt-BR', compact = false } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
  }).format(value);
}

// Formatar bytes
export function formatBytes(
  bytes: number,
  options: { decimals?: number; binary?: boolean } = {}
): string {
  const { decimals = 2, binary = true } = options;

  if (bytes === 0) return '0 Bytes';

  const k = binary ? 1024 : 1000;
  const sizes = binary 
    ? ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
    : ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${value.toFixed(decimals)} ${sizes[i]}`;
}

// Formatar duração
export function formatDuration(
  seconds: number,
  options: { format?: 'short' | 'long' | 'digital' } = {}
): string {
  const { format = 'short' } = options;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (format === 'digital') {
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  const parts: string[] = [];

  if (format === 'long') {
    if (hours > 0) parts.push(`${hours} hora${hours !== 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} segundo${secs !== 1 ? 's' : ''}`);
  } else {
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  }

  return parts.join(' ');
}

// Formatar tempo relativo
export function formatRelativeTime(
  date: Date | string | number,
  options: { locale?: string; style?: 'long' | 'short' | 'narrow' } = {}
): string {
  const { locale = 'pt-BR', style = 'long' } = options;

  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffWeeks = Math.round(diffDays / 7);
  const diffMonths = Math.round(diffDays / 30);
  const diffYears = Math.round(diffDays / 365);

  const rtf = new Intl.RelativeTimeFormat(locale, { style });

  if (Math.abs(diffSecs) < 60) return rtf.format(diffSecs, 'second');
  if (Math.abs(diffMins) < 60) return rtf.format(diffMins, 'minute');
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
  if (Math.abs(diffDays) < 7) return rtf.format(diffDays, 'day');
  if (Math.abs(diffWeeks) < 4) return rtf.format(diffWeeks, 'week');
  if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, 'month');
  return rtf.format(diffYears, 'year');
}

// Formatar lista
export function formatList(
  items: string[],
  options: { type?: 'conjunction' | 'disjunction'; locale?: string } = {}
): string {
  const { type = 'conjunction', locale = 'pt-BR' } = options;

  // Fallback para browsers sem suporte a ListFormat
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) {
    const connector = type === 'conjunction' ? ' e ' : ' ou ';
    return items.join(connector);
  }
  
  const connector = type === 'conjunction' ? ' e ' : ' ou ';
  return items.slice(0, -1).join(', ') + connector + items[items.length - 1];
}

// Formatar range de números
export function formatRange(
  start: number,
  end: number,
  options: { locale?: string } = {}
): string {
  const { locale = 'pt-BR' } = options;
  const formatter = new Intl.NumberFormat(locale);
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

// Truncar texto
export function truncate(
  text: string,
  options: { length?: number; suffix?: string; wordBoundary?: boolean } = {}
): string {
  const { length = 100, suffix = '...', wordBoundary = true } = options;

  if (text.length <= length) return text;

  let truncated = text.slice(0, length - suffix.length);

  if (wordBoundary) {
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      truncated = truncated.slice(0, lastSpace);
    }
  }

  return truncated + suffix;
}

// Formatar nome (capitalização)
export function formatName(name: string): string {
  const exceptions = ['de', 'da', 'do', 'dos', 'das', 'e'];
  
  return name
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index !== 0 && exceptions.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Formatar CPF
export function formatCPF(cpf: string): string {
  const numbers = cpf.replace(/\D/g, '');
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Formatar CNPJ
export function formatCNPJ(cnpj: string): string {
  const numbers = cnpj.replace(/\D/g, '');
  return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

// Formatar telefone brasileiro
export function formatPhone(phone: string): string {
  const numbers = phone.replace(/\D/g, '');
  
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

// Formatar CEP
export function formatCEP(cep: string): string {
  const numbers = cep.replace(/\D/g, '');
  return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// Formatar placa de veículo (Mercosul e antiga)
export function formatPlate(plate: string): string {
  const cleaned = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  if (cleaned.length === 7) {
    // Formato Mercosul: ABC1D23
    if (/^[A-Z]{3}\d[A-Z]\d{2}$/.test(cleaned)) {
      return cleaned;
    }
    // Formato antigo: ABC-1234
    return cleaned.replace(/([A-Z]{3})(\d{4})/, '$1-$2');
  }
  
  return plate;
}

// Formatar número de cartão de crédito
export function formatCreditCard(number: string): string {
  const digits = number.replace(/\D/g, '');
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

// Mascarar dados sensíveis
export function maskSensitive(
  value: string,
  options: { showFirst?: number; showLast?: number; maskChar?: string } = {}
): string {
  const { showFirst = 2, showLast = 2, maskChar = '*' } = options;

  if (value.length <= showFirst + showLast) {
    return maskChar.repeat(value.length);
  }

  const first = value.slice(0, showFirst);
  const last = value.slice(-showLast);
  const middle = maskChar.repeat(value.length - showFirst - showLast);

  return `${first}${middle}${last}`;
}

// Mascarar email
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  
  const maskedLocal = maskSensitive(local, { showFirst: 2, showLast: 1 });
  return `${maskedLocal}@${domain}`;
}

// Pluralização simples
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
}

// Ordinal
export function ordinal(n: number): string {
  return `${n}º`;
}

// Formatar data em português
export function formatDateBR(
  date: Date | string | number,
  options: { format?: 'short' | 'long' | 'full' } = {}
): string {
  const { format = 'short' } = options;
  const d = new Date(date);

  const formatOptionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  };

  return d.toLocaleDateString('pt-BR', formatOptionsMap[format]);
}

// Formatar hora
export function formatTime(
  date: Date | string | number,
  options: { seconds?: boolean } = {}
): string {
  const { seconds = false } = options;
  const d = new Date(date);

  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    ...(seconds && { second: '2-digit' }),
  });
}

// Sanitizar HTML
export function sanitizeHtml(html: string): string {
  const element = document.createElement('div');
  element.textContent = html;
  return element.innerHTML;
}

// Converter para snake_case
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
    .replace(/^_/, '');
}

// Converter para camelCase
export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s](.)/g, (_, char) => char.toUpperCase())
    .replace(/^(.)/, (_, char) => char.toLowerCase());
}

// Converter para PascalCase
export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s](.)/g, (_, char) => char.toUpperCase())
    .replace(/^(.)/, (_, char) => char.toUpperCase());
}

// Converter para kebab-case
export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .replace(/^-/, '');
}

// Converter para Title Case
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
}
