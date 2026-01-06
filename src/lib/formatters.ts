import * as React from "react";
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, isThisYear } from "date-fns";
import { ptBR, enUS, es, Locale } from "date-fns/locale";
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

      currency: (value: number, curr = "BRL") =>
        new Intl.NumberFormat(locale, {
          style: "currency",
          currency: curr,
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
    };
  }, [i18n.language]);
}

// Format date with locale
export function useDateFormat() {
  const locale = useLocale();

  return React.useMemo(
    () => ({
      full: (date: Date) => format(date, "PPP", { locale }),
      short: (date: Date) => format(date, "P", { locale }),
      time: (date: Date) => format(date, "p", { locale }),
      dateTime: (date: Date) => format(date, "Pp", { locale }),
      relative: (date: Date) => formatDistanceToNow(date, { addSuffix: true, locale }),
      smart: (date: Date) => {
        if (isToday(date)) {
          return `Hoje ${format(date, "p", { locale })}`;
        }
        if (isYesterday(date)) {
          return `Ontem ${format(date, "p", { locale })}`;
        }
        if (isThisWeek(date)) {
          return format(date, "EEEE 'às' p", { locale });
        }
        if (isThisYear(date)) {
          return format(date, "d 'de' MMMM", { locale });
        }
        return format(date, "P", { locale });
      },
      monthYear: (date: Date) => format(date, "MMMM yyyy", { locale }),
      dayOfWeek: (date: Date) => format(date, "EEEE", { locale }),
      iso: (date: Date) => date.toISOString(),
    }),
    [locale]
  );
}

// Format list (and, or)
export function useListFormat() {
  const { i18n } = useTranslation();

  return React.useMemo(() => {
    const locale = i18n.language || "pt-BR";

    return {
      and: (items: string[]) => items.join(", ").replace(/, ([^,]*)$/, " e $1"),
      or: (items: string[]) => items.join(", ").replace(/, ([^,]*)$/, " ou $1"),
      unit: (items: string[]) => items.join(" "),
    };
  }, [i18n.language]);
}

// Pluralization
export function usePlural() {
  const { i18n } = useTranslation();

  return React.useCallback(
    (count: number, singular: string, plural: string) => {
      return count === 1 ? singular : plural;
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
  return React.useCallback((minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${mins}min`;
  }, []);
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
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }

  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }

  return doc;
}
