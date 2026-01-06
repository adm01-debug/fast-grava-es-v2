import React, { Component, createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ErrorInfo {
  componentStack: string;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: unknown[];
  level?: 'page' | 'section' | 'component';
}

interface ErrorContextValue {
  reportError: (error: Error, context?: Record<string, unknown>) => void;
  errors: ErrorReport[];
  clearErrors: () => void;
}

interface ErrorReport {
  id: string;
  error: Error;
  context?: Record<string, unknown>;
  timestamp: Date;
  url: string;
  userAgent: string;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ErrorContext = createContext<ErrorContextValue | null>(null);

export function useErrorReporting() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorReporting must be used within ErrorReportingProvider');
  }
  return context;
}

// ============================================================================
// ERROR REPORTING PROVIDER
// ============================================================================

export function ErrorReportingProvider({ children }: { children: React.ReactNode }) {
  const [errors, setErrors] = useState<ErrorReport[]>([]);

  const reportError = useCallback((error: Error, context?: Record<string, unknown>) => {
    const report: ErrorReport = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      error,
      context,
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    setErrors(prev => [...prev, report].slice(-50)); // Keep last 50 errors

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🔴 Error Report');
      console.error('Error:', error);
      console.log('Context:', context);
      console.log('URL:', report.url);
      console.log('Timestamp:', report.timestamp);
      console.groupEnd();
    }
  }, []);

  const clearErrors = useCallback(() => setErrors([]), []);

  return (
    <ErrorContext.Provider value={{ reportError, errors, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
}

// ============================================================================
// ERROR BOUNDARY CLASS
// ============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo: errorInfo as ErrorInfo });
    this.props.onError?.(error, errorInfo as ErrorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && this.props.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      if (hasChanged) {
        this.reset();
      }
    }
  }

  reset = () => {
    this.props.onReset?.();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.reset);
        }
        return this.props.fallback;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          reset={this.reset}
          level={this.props.level || 'page'}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// DEFAULT ERROR FALLBACK
// ============================================================================

interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
  reset: () => void;
  level: 'page' | 'section' | 'component';
}

function DefaultErrorFallback({
  error,
  errorInfo,
  errorId,
  reset,
  level,
}: DefaultErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyErrorReport = async () => {
    const report = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (level === 'component') {
    return (
      <div className="flex items-center gap-2 p-2 rounded-md bg-destructive/10 text-destructive text-sm">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">Erro no componente</span>
        <Button variant="ghost" size="sm" onClick={reset} className="h-6 px-2">
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  if (level === 'section') {
    return (
      <Card className="border-destructive/50">
        <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
          <div className="p-3 rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold">Algo deu errado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Não foi possível carregar esta seção
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Page level error
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto p-4 rounded-full bg-destructive/10 w-fit mb-4">
            <Bug className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>Ops! Algo deu errado</CardTitle>
          <CardDescription>
            Ocorreu um erro inesperado. Nossa equipe foi notificada.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorId && (
            <div className="p-3 rounded-lg bg-muted text-center">
              <p className="text-xs text-muted-foreground">ID do erro</p>
              <p className="font-mono text-sm">{errorId}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              <Home className="h-4 w-4 mr-2" />
              Início
            </Button>
          </div>

          <div className="pt-4 border-t">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Detalhes técnicos</span>
              {showDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showDetails && (
              <div className="mt-3 space-y-3">
                <div className="p-3 rounded-lg bg-muted overflow-auto max-h-48">
                  <p className="font-mono text-xs text-destructive break-all">
                    {error.message}
                  </p>
                  {error.stack && (
                    <pre className="mt-2 font-mono text-xs text-muted-foreground whitespace-pre-wrap break-all">
                      {error.stack.split('\n').slice(1, 6).join('\n')}
                    </pre>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyErrorReport}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? 'Copiado!' : 'Copiar relatório de erro'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// SPECIALIZED BOUNDARIES
// ============================================================================

export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary level="page">
      {children}
    </ErrorBoundary>
  );
}

export function SectionErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary level="section">
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary level="component">
      {children}
    </ErrorBoundary>
  );
}

// ============================================================================
// HOC FOR ERROR BOUNDARY
// ============================================================================

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...options}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}

// ============================================================================
// ERROR TRIGGER (for testing)
// ============================================================================

export function ErrorTrigger({ message = 'Test error' }: { message?: string }) {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error(message);
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => setShouldError(true)}
    >
      <Bug className="h-4 w-4 mr-2" />
      Trigger Error
    </Button>
  );
}

// ============================================================================
// ASYNC ERROR BOUNDARY
// ============================================================================

interface AsyncBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode);
}

export function AsyncBoundary({
  children,
  fallback,
  errorFallback,
}: AsyncBoundaryProps) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <React.Suspense fallback={fallback || <DefaultSuspenseFallback />}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
}

function DefaultSuspenseFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

export default ErrorBoundary;
