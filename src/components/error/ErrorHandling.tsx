import React, { Component, ErrorInfo, ReactNode, useState, useCallback } from 'react';
import { AlertTriangle, RefreshCw, Home, Copy, Check, ChevronDown, ChevronUp, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// ============================================
// ERROR BOUNDARY
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error!, this.reset);
        }
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error!}
          errorInfo={this.state.errorInfo}
          onReset={this.reset}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

// ============================================
// ERROR FALLBACK
// ============================================

interface ErrorFallbackProps {
  error: Error;
  errorInfo?: ErrorInfo | null;
  onReset?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function ErrorFallback({
  error,
  errorInfo,
  onReset,
  showDetails = true,
  className
}: ErrorFallbackProps) {
  const [showStack, setShowStack] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const errorText = `
Error: ${error.message}
Stack: ${error.stack}
Component Stack: ${errorInfo?.componentStack || 'N/A'}
    `.trim();
    
    await navigator.clipboard.writeText(errorText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <Card className={cn("max-w-lg mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <CardTitle>Algo deu errado</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Ocorreu um erro inesperado
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <Bug className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription className="font-mono text-sm">
            {error.message}
          </AlertDescription>
        </Alert>

        {showDetails && error.stack && (
          <div>
            <button
              onClick={() => setShowStack(!showStack)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              {showStack ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Detalhes técnicos
            </button>

            {showStack && (
              <div className="mt-2 p-3 bg-muted rounded-lg overflow-auto max-h-48">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {error.stack}
                </pre>
                {errorInfo?.componentStack && (
                  <>
                    <hr className="my-2 border-border" />
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        {onReset && (
          <Button onClick={onReset} variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        )}
        <Button onClick={handleReload} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Recarregar página
        </Button>
        <Button onClick={handleGoHome} variant="outline">
          <Home className="h-4 w-4 mr-2" />
          Ir para início
        </Button>
        {showDetails && (
          <Button onClick={handleCopy} variant="ghost" size="sm">
            {copied ? (
              <Check className="h-4 w-4 mr-2 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? 'Copiado!' : 'Copiar erro'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// ============================================
// INLINE ERROR
// ============================================

interface InlineErrorProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}

export function InlineError({ error, onRetry, className }: InlineErrorProps) {
  const message = typeof error === 'string' ? error : error.message;

  return (
    <div className={cn(
      "flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg",
      className
    )}>
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="text-sm flex-1">{message}</span>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="text-destructive hover:text-destructive"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-4">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ============================================
// NOT FOUND
// ============================================

interface NotFoundProps {
  title?: string;
  description?: string;
  backLink?: string;
  backLabel?: string;
  className?: string;
}

export function NotFound({
  title = "Página não encontrada",
  description = "A página que você está procurando não existe ou foi movida.",
  backLink = "/",
  backLabel = "Voltar ao início",
  className
}: NotFoundProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] px-4 text-center",
      className
    )}>
      <div className="text-8xl font-bold text-muted-foreground/20 mb-4">
        404
      </div>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      <Button asChild>
        <a href={backLink}>
          <Home className="h-4 w-4 mr-2" />
          {backLabel}
        </a>
      </Button>
    </div>
  );
}

// ============================================
// HOOK: useErrorHandler
// ============================================

export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof Error) {
      setError(err);
    } else if (typeof err === 'string') {
      setError(new Error(err));
    } else {
      setError(new Error('An unknown error occurred'));
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandler = useCallback(<T,>(
    fn: () => Promise<T>
  ): Promise<T | undefined> => {
    return fn().catch(err => {
      handleError(err);
      return undefined;
    });
  }, [handleError]);

  return {
    error,
    setError,
    handleError,
    clearError,
    withErrorHandler,
    hasError: error !== null
  };
}

// ============================================
// HOOK: useAsyncError
// ============================================

export function useAsyncError<T, Args extends unknown[]>(
  asyncFn: (...args: Args) => Promise<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (...args: Args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    error,
    loading,
    execute,
    reset,
    isSuccess: data !== null && error === null,
    isError: error !== null
  };
}

// ============================================
// RETRY WRAPPER
// ============================================

interface RetryWrapperProps {
  children: ReactNode;
  error: Error | null;
  onRetry: () => void;
  loading?: boolean;
  maxRetries?: number;
  retryCount?: number;
}

export function RetryWrapper({
  children,
  error,
  onRetry,
  loading = false,
  maxRetries = 3,
  retryCount = 0
}: RetryWrapperProps) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Erro ao carregar</h3>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        {retryCount < maxRetries ? (
          <Button onClick={onRetry} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Tentando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente ({maxRetries - retryCount} restantes)
              </>
            )}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Número máximo de tentativas atingido. Por favor, recarregue a página.
          </p>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
