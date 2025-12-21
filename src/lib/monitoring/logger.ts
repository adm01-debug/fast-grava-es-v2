// Structured Logger
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = import.meta.env.DEV ? 'debug' : 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatEntry(entry: LogEntry): string {
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
}

function createEntry(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    error,
  };
}

export const logger = {
  debug(message: string, context?: Record<string, any>) {
    if (shouldLog('debug')) {
      const entry = createEntry('debug', message, context);
      console.debug(formatEntry(entry), context || '');
    }
  },

  info(message: string, context?: Record<string, any>) {
    if (shouldLog('info')) {
      const entry = createEntry('info', message, context);
      console.info(formatEntry(entry), context || '');
    }
  },

  warn(message: string, context?: Record<string, any>) {
    if (shouldLog('warn')) {
      const entry = createEntry('warn', message, context);
      console.warn(formatEntry(entry), context || '');
    }
  },

  error(message: string, error?: Error, context?: Record<string, any>) {
    if (shouldLog('error')) {
      const entry = createEntry('error', message, context, error);
      console.error(formatEntry(entry), error, context || '');
    }
  },
};
