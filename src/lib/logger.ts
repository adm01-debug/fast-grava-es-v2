/**
 * Structured logger — only logs in development mode.
 * In production, errors go to Sentry (if configured) or are silently discarded.
 * Never logs PII (emails, tokens, passwords).
 */

const isDev = import.meta.env.DEV;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  timestamp: string;
}

function formatEntry(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  return entry.context ? `${prefix} [${entry.context}] ${entry.message}` : `${prefix} ${entry.message}`;
}

function createEntry(level: LogLevel, message: string, context?: string, data?: unknown): LogEntry {
  return {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
  };
}

export const logger = {
  debug(message: string, data?: unknown, context?: string) {
    if (!isDev) return;
    const entry = createEntry('debug', message, context, data);
    console.debug(formatEntry(entry), data ?? '');
  },

  info(message: string, data?: unknown, context?: string) {
    if (!isDev) return;
    const entry = createEntry('info', message, context, data);
    console.info(formatEntry(entry), data ?? '');
  },

  warn(message: string, data?: unknown, context?: string) {
    if (!isDev) return;
    const entry = createEntry('warn', message, context, data);
    console.warn(formatEntry(entry), data ?? '');
  },

  error(message: string, error?: unknown, context?: string) {
    // Errors always log (even in prod for Sentry/error tracking)
    const entry = createEntry('error', message, context, error);
    if (isDev) {
      console.error(formatEntry(entry), error ?? '');
    }
    // In production, Sentry captures via its global handler
  },
};
