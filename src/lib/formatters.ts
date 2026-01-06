import * as React from "react";
import { format, formatDistanceToNow, formatRelative, isToday, isYesterday, isThisWeek, isThisYear } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import { useTranslation } from "react-i18next";

// Get locale from i18n language
const localeMap: Record<string, Locale> = {
  "pt-BR": ptBR,
  "pt": ptBR,
  "en": enUS,
  "en-US": enUS,
  "es": es,
  "es-ES": es,
};

export function useLocale() {
  const { i18n } = useTranslation();
  return localeMap[i18n.language] || ptBR;
}

// Format number with locale
export function useNumberFormat() {
  const { i18n } = useTranslation();

  return React.useMemo(() => {
    const locale = i18n.language || "pt-BR";

    return {
      format: (value: number, options?: Intl.NumberFormatOptions) =>
        new Intl.NumberFormat(locale, options).format(value),

      currency: (value: number, currency = "BRL") =>
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
        }).format(value),

      percent: (value: number, decimals = 1) =>
        new Intl.NumberFormat(locale, {
          style: "percent",
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value / 100),

      compact: (value: number) =>
        new Intl.NumberFormat(locale, {
          notation: "compact",
          compactDisplay: "short",
        }).format(value),

      unit: (value: number, unit: string) =>
        new Intl.NumberFormat(locale, {
          style: "unit",
          unit,
          unitDisplay: "short",
        }).format(value),
    };
  }, [i18n.language]);
}

// Format date with locale
export function useDateFormat() {
  const locale = useLocale();
  const { t } = useTranslation();

  return React.useMemo(
    () => ({
      // Full date: "1 de janeiro de 2024"
      full: (date: Date) => format(date, "PPP", { locale }),

      // Short date: "01/01/2024"
      short: (date: Date) => format(date, "P", { locale }),

      // Time: "14:30"
      time: (date: Date) => format(date, "p", { locale }),

      // Date and time: "01/01/2024 14:30"
      dateTime: (date: Date) => format(date, "Pp", { locale }),

      // Relative: "há 5 minutos"
      relative: (date: Date) =>
        formatDistanceToNow(date, { addSuffix: true, locale }),

      // Smart relative (today, yesterday, etc.)
      smart: (date: Date) => {
        if (isToday(date)) {
          return `${t("common.today")} ${format(date, "p", { locale })}`;
        }
        if (isYesterday(date)) {
          return `${t("common.yesterday")} ${format(date, "p", { locale })}`;
        }
        if (isThisWeek(date)) {
          return format(date, "EEEE 'às' p", { locale });
        }
        if (isThisYear(date)) {
          return format(date, "d 'de' MMMM", { locale });
        }
        return format(date, "P", { locale });
      },

      // Month and year: "Janeiro 2024"
      monthYear: (date: Date) => format(date, "MMMM yyyy", { locale }),

      // Day of week: "Segunda-feira"
      dayOfWeek: (date: Date) => format(date, "EEEE", { locale }),

      // ISO format for APIs
      iso: (date: Date) => date.toISOString(),
    }),
    [locale, t]
  );
}

// Format list (and, or)
export function useListFormat() {
  const { i18n } = useTranslation();

  return React.useMemo(() => {
    const locale = i18n.language || "pt-BR";

    return {
      and: (items: string[]) =>
        new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(items),

      or: (items: string[]) =>
        new Intl.ListFormat(locale, { style: "long", type: "disjunction" }).format(items),

      unit: (items: string[]) =>
        new Intl.ListFormat(locale, { style: "narrow", type: "unit" }).format(items),
    };
  }, [i18n.language]);
}

// Pluralization
export function usePlural() {
  const { i18n } = useTranslation();

  return React.useCallback(
    (count: number, singular: string, plural: string) => {
      const rules = new Intl.PluralRules(i18n.language);
      const form = rules.select(count);
      return form === "one" ? singular : plural;
    },
    [i18n.language]
  );
}

// Format file size
export function useFileSizeFormat() {
  const { i18n } = useTranslation();

  return React.useCallback(
    (bytes: number) => {
      const units = ["B", "KB", "MB", "GB", "TB"];
      let unitIndex = 0;
      let size = bytes;

      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }

      return new Intl.NumberFormat(i18n.language, {
        maximumFractionDigits: 1,
      }).format(size) + " " + units[unitIndex];
    },
    [i18n.language]
  );
}

// Format duration
export function useDurationFormat() {
  const { t } = useTranslation();

  return React.useCallback(
    (minutes: number) => {
      if (minutes < 60) {
        return `${minutes} ${t("common.minutes")}`;
      }

      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      if (mins === 0) {
        return `${hours}h`;
      }

      return `${hours}h ${mins}min`;
    },
    [t]
  );
}

// Formatted text components
interface FormattedNumberProps {
  value: number;
  type?: "number" | "currency" | "percent" | "compact";
  currency?: string;
  decimals?: number;
}

export function FormattedNumber({ value, type = "number", currency, decimals }: FormattedNumberProps) {
  const format = useNumberFormat();

  switch (type) {
    case "currency":
      return <>{format.currency(value, currency)}</>;
    case "percent":
      return <>{format.percent(value, decimals)}</>;
    case "compact":
      return <>{format.compact(value)}</>;
    default:
      return <>{format.format(value)}</>;
  }
}

interface FormattedDateProps {
  value: Date | string | number;
  type?: "full" | "short" | "time" | "dateTime" | "relative" | "smart";
}

export function FormattedDate({ value, type = "short" }: FormattedDateProps) {
  const formatFns = useDateFormat();
  const date = value instanceof Date ? value : new Date(value);
  return formatFns[type](date);
}

export function formatPhoneNumber(phone: string, country = "BR"): string {
  const cleaned = phone.replace(/\D/g, "");
  if (country === "BR") {
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
  }
  return phone;
}

export function formatDocument(doc: string): string {
  const cleaned = doc.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }
  return doc;
}
}

// Auto-detect and format phone numbers
export function formatPhoneNumber(phone: string, country = "BR"): string {
  const cleaned = phone.replace(/\D/g, "");

  if (country === "BR") {
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
  }

  return phone;
}

// Format CPF/CNPJ
export function formatDocument(doc: string): string {
  const cleaned = doc.replace(/\D/g, "");

  if (cleaned.length === 11) {
    // CPF
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }

  if (cleaned.length === 14) {
    // CNPJ
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }

  return doc;
}
