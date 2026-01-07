import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { format, formatDistanceToNow, formatRelative, Locale } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';

// Locale mapping for date-fns
const dateLocales: Record<string, Locale> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es': es,
};

// i18n utilities hook
export function useI18nUtils() {
  const { t, i18n } = useTranslation();

  // Get current locale for date-fns
  const getDateLocale = useCallback((): Locale => {
    return dateLocales[i18n.language] || ptBR;
  }, [i18n.language]);

  // Format date with current locale
  const formatDate = useCallback((date: Date | string | number, formatStr = 'PPP'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, formatStr, { locale: getDateLocale() });
  }, [getDateLocale]);

  // Format relative time
  const formatRelativeTime = useCallback((date: Date | string | number): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return formatDistanceToNow(d, { addSuffix: true, locale: getDateLocale() });
  }, [getDateLocale]);

  // Format relative to now
  const formatRelativeDate = useCallback((date: Date | string | number): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return formatRelative(d, new Date(), { locale: getDateLocale() });
  }, [getDateLocale]);

  // Format number with current locale
  const formatNumber = useCallback((value: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat(i18n.language, options).format(value);
  }, [i18n.language]);

  // Format currency with current locale
  const formatCurrency = useCallback((value: number, currency = 'BRL'): string => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
    }).format(value);
  }, [i18n.language]);

  // Format percentage
  const formatPercent = useCallback((value: number, decimals = 1): string => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  }, [i18n.language]);

  // Pluralization helper
  const plural = useCallback((count: number, key: string): string => {
    return t(key, { count });
  }, [t]);

  // List formatting
  const formatList = useCallback((items: string[]): string => {
    return items.join(', ');
  }, []);

  // Get ordinal (1º, 2º, 3º)
  const formatOrdinal = useCallback((n: number): string => {
    if (i18n.language.startsWith('pt')) {
      return `${n}º`;
    }
    if (i18n.language.startsWith('en')) {
      const suffixes = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
    }
    return `${n}°`;
  }, [i18n.language]);

  return {
    t,
    i18n,
    language: i18n.language,
    changeLanguage: i18n.changeLanguage,
    formatDate,
    formatRelativeTime,
    formatRelativeDate,
    formatNumber,
    formatCurrency,
    formatPercent,
    plural,
    formatList,
    formatOrdinal,
  };
}

// Translation namespace loader
export function useNamespaceTranslation(namespace: string) {
  const { t: originalT, ...rest } = useTranslation(namespace);

  const t = useCallback((key: string, options?: Record<string, any>) => {
    return originalT(key, options);
  }, [originalT]);

  return { t, ...rest };
}

// Language detection helpers
export function getBrowserLanguage(): string {
  const lang = navigator.language || 'pt-BR';
  // Map common variants
  if (lang.startsWith('pt')) return 'pt-BR';
  if (lang.startsWith('en')) return 'en-US';
  if (lang.startsWith('es')) return 'es';
  return 'pt-BR';
}

// RTL detection
export function isRTL(language: string): boolean {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.some(rtl => language.startsWith(rtl));
}

// Language metadata
interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const supportedLanguages: LanguageInfo[] = [
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en-US', name: 'English (US)', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
];

export function getLanguageInfo(code: string): LanguageInfo | undefined {
  return supportedLanguages.find(lang => lang.code === code);
}

// Common translation keys type safety helper
export type TranslationKeys = 
  | 'common.save'
  | 'common.cancel'
  | 'common.delete'
  | 'common.edit'
  | 'common.create'
  | 'common.search'
  | 'common.filter'
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.confirm'
  | 'common.back'
  | 'common.next'
  | 'common.previous'
  | 'common.submit'
  | 'common.reset'
  | 'common.close'
  | 'common.open'
  | 'common.yes'
  | 'common.no'
  | 'common.all'
  | 'common.none'
  | 'common.select'
  | 'common.selected'
  | 'common.noResults'
  | 'common.noData'
  | 'common.required'
  | 'common.optional'
  | 'errors.generic'
  | 'errors.network'
  | 'errors.unauthorized'
  | 'errors.notFound'
  | 'errors.validation'
  | 'success.saved'
  | 'success.created'
  | 'success.updated'
  | 'success.deleted';

// Type-safe translation function
export function createTypedT(t: (key: string, options?: Record<string, any>) => string) {
  return (key: TranslationKeys, options?: Record<string, any>) => t(key, options);
}

// Interpolation helper
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(values[key] ?? `{{${key}}}`));
}

// Missing translation handler
export function handleMissingKey(key: string, language: string): string {
  console.warn(`Missing translation: ${key} for language: ${language}`);
  // Return the key in a readable format
  return key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || key;
}
