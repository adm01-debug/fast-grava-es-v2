/**
 * Structured logger — handles logging levels and production error capture.
 * Never logs PII (emails, tokens, passwords).
 */

const isDev = import.meta.env.DEV;

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  timestamp: string;
  severity?: number; // 0-4 scale for monitoring
}

const SEVERITY_MAP: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  critical: 4,
};

// Error monitoring history (limited to 50 entries in memory for internal dashboard)
const errorHistory: LogEntry[] = [];
const MAX_HISTORY = 50;

function formatEntry(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  return entry.context ? `${prefix} [${entry.context}] ${entry.message}` : `${prefix} ${entry.message}`;
}

function createEntry(level: LogLevel, message: string, context?: string, data?: any): LogEntry {
  const entry = {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
    severity: SEVERITY_MAP[level],
  };

  if (level === 'error' || level === 'critical' || level === 'warn') {
    errorHistory.unshift(entry);
    if (errorHistory.length > MAX_HISTORY) {
      errorHistory.pop();
    }
  }

  return entry;
}

export const logger = {
  debug(message: string, data?: any, context?: string) {
    if (!isDev) return;
    const entry = createEntry('debug', message, context, data);
    console.debug(formatEntry(entry), data ?? '');
  },

  info(message: string, data?: any, context?: string) {
    if (!isDev) return;
    const entry = createEntry('info', message, context, data);
    console.info(formatEntry(entry), data ?? '');
  },

  warn(message: string, data?: any, context?: string) {
    const entry = createEntry('warn', message, context, data);
    if (isDev) {
      console.warn(formatEntry(entry), data ?? '');
    }
  },

  error(message: string, error?: any, context?: string) {
    const entry = createEntry('error', message, context, error);
    if (isDev) {
      console.error(formatEntry(entry), error ?? '');
    } else {
      console.error(`[FATAL] ${entry.timestamp} ${message}`);
    }
  },

  critical(message: string, error?: any, context?: string) {
    const entry = createEntry('critical', message, context, error);
    console.error(`[CRITICAL] ${formatEntry(entry)}`, error ?? '');
    
    // Disparar Webhook de Alerta (Configurado para o time técnico)
    const WEBHOOK_URL = 'https://n8n.fastgravacoes.com.br/webhook/alerts';
    if (!isDev) {
      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'CRITICAL_ERROR',
          message,
          error: error instanceof Error ? error.message : String(error),
          context,
          timestamp: entry.timestamp,
          system: 'FAST_GRAVAÇÕES_PROD'
        })
      }).catch(err => console.error('Falha ao enviar webhook de alerta', err));
    }
  },

  getErrorHistory(): LogEntry[] {
    return [...errorHistory];
  },

  clearHistory() {
    errorHistory.length = 0;
  }
};
