import React, { Component, ReactNode, ErrorInfo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showStack: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showStack: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null, showStack: false });
  };

  handleCopyError = (): void => {
    const { error, errorInfo } = this.state;
    const errorText = `
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
    `.trim();
    
    navigator.clipboard.writeText(errorText);
  };

  toggleStack = (): void => {
    this.setState((prev) => ({ showStack: !prev.showStack }));
  };

  render(): ReactNode {
    const { hasError, error, errorInfo, showStack } = this.state;
    const { children, fallback, showDetails = true, className } = this.props;

    if (hasError && error) {
      // Custom fallback
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.handleReset);
        }
        return fallback;
      }

      // Default error UI
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex flex-col items-center justify-center min-h-[400px] p-8 text-center",
            className
          )}
        >
          <div className="p-4 rounded-full bg-destructive/10 mb-6">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-2">
            Algo deu errado
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Ocorreu um erro inesperado. Tente recarregar a página ou voltar ao início.
          </p>

          <div className="flex items-center gap-3 mb-6">
            <Button onClick={this.handleReset} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button
              onClick={() => (window.location.href = '/')}
              variant="outline"
            >
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>

          {showDetails && (
            <div className="w-full max-w-lg">
              <button
                onClick={this.toggleStack}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto mb-3"
              >
                <Bug className="h-4 w-4" />
                Detalhes técnicos
                {showStack ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showStack && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-muted rounded-lg p-4 text-left overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      ERRO
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs"
                      onClick={this.handleCopyError}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </Button>
                  </div>
                  <p className="text-sm font-mono text-destructive mb-4">
                    {error.message}
                  </p>
                  
                  {error.stack && (
                    <pre className="text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap max-h-40">
                      {error.stack}
                    </pre>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      );
    }

    return children;
  }
}

// Functional wrapper with hooks support
interface ErrorBoundaryWrapperProps extends Omit<ErrorBoundaryProps, 'onError'> {
  onError?: (error: Error) => void;
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: ErrorBoundaryWrapperProps
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Page-level error boundary with different styling
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      className="min-h-screen"
      fallback={(error, reset) => (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md text-center"
          >
            <div className="p-6 rounded-2xl bg-card border border-border shadow-lg">
              <div className="p-4 rounded-full bg-destructive/10 inline-flex mb-6">
                <AlertTriangle className="h-10 w-10 text-destructive" />
              </div>
              
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Oops! Erro na página
              </h1>
              <p className="text-muted-foreground mb-6">
                {error.message || 'Ocorreu um erro inesperado'}
              </p>
              
              <div className="flex flex-col gap-2">
                <Button onClick={reset} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recarregar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = '/')}
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ir para o Início
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// Section-level error boundary (less intrusive)
export function SectionErrorBoundary({
  children,
  fallbackMessage = 'Esta seção não pôde ser carregada',
}: {
  children: ReactNode;
  fallbackMessage?: string;
}) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="p-6 rounded-lg border border-destructive/20 bg-destructive/5 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <p className="text-sm text-destructive mb-3">{fallbackMessage}</p>
          <Button size="sm" variant="outline" onClick={reset}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Tentar novamente
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// Suspense-like error boundary for async components
export function AsyncBoundary({
  children,
  loadingFallback,
  errorFallback,
}: {
  children: ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
}) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <React.Suspense fallback={loadingFallback || <DefaultLoadingFallback />}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
}

function DefaultLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
