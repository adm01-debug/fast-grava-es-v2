import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'section' | 'component';
  showDetails?: boolean;
  resetKeys?: unknown[];
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundaryAdvanced extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error
    console.error('Error Boundary caught:', error, errorInfo);
    
    // Call custom handler
    this.props.onError?.(error, errorInfo);
    
    // Report to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, { extra: errorInfo });
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state if resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const keysChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      if (keysChanged) {
        this.reset();
      }
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  copyError = async () => {
    const errorText = `
Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
    `.trim();
    
    await navigator.clipboard.writeText(errorText);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'page', showDetails = import.meta.env.DEV } = this.props;
      const { error, errorInfo, copied } = this.state;

      // Component-level error (inline)
      if (level === 'component') {
        return (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
            <AlertTriangle className="h-6 w-6 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive font-medium">Erro ao carregar componente</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={this.reset}
              className="mt-2 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Tentar novamente
            </Button>
          </div>
        );
      }

      // Section-level error
      if (level === 'section') {
        return (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
              <h3 className="font-medium text-lg mb-1">Algo deu errado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Não foi possível carregar esta seção.
              </p>
              <Button onClick={this.reset} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        );
      }

      // Page-level error (full page)
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg"
          >
            <Card className="border-destructive/30">
              <CardHeader className="text-center pb-2">
                <motion.div
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4"
                >
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </motion.div>
                <CardTitle className="text-xl">Ops! Algo deu errado</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground">
                  Ocorreu um erro inesperado. Nossa equipe foi notificada.
                </p>
                
                {/* Error details (dev only) */}
                {showDetails && error && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <Bug className="h-4 w-4" />
                          Detalhes técnicos
                        </span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 p-3 rounded-lg bg-muted font-mono text-xs space-y-2 max-h-48 overflow-auto">
                        <p className="text-destructive font-medium">{error.message}</p>
                        {error.stack && (
                          <pre className="text-muted-foreground whitespace-pre-wrap">
                            {error.stack.split('\n').slice(0, 5).join('\n')}
                          </pre>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={this.copyError}
                        className="mt-2 w-full text-xs"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            Copiar erro
                          </>
                        )}
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CardContent>
              
              <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={this.reset} 
                  className="w-full sm:w-auto"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'} 
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ir para Dashboard
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper with hooks support
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<Props, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundaryAdvanced {...options}>
        <Component {...props} />
      </ErrorBoundaryAdvanced>
    );
  };
}

// Simple error fallback for lazy components
export function ErrorFallback({ 
  error, 
  resetError 
}: { 
  error?: Error; 
  resetError?: () => void;
}) {
  return (
    <div className="p-6 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
      <h3 className="font-medium mb-1">Erro ao carregar</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {error?.message || 'Algo deu errado'}
      </p>
      {resetError && (
        <Button onClick={resetError} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

export default ErrorBoundaryAdvanced;
