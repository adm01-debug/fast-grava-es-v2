import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  MessageCircle, 
  Copy, 
  ChevronDown,
  ChevronUp,
  Bug,
  Wifi,
  Server,
  Lock,
  FileQuestion
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// Error types
type ErrorType = 'network' | 'server' | 'auth' | 'notfound' | 'unknown';

interface ErrorDetails {
  type: ErrorType;
  title: string;
  description: string;
  icon: ReactNode;
  suggestions: string[];
  canRetry: boolean;
}

const getErrorDetails = (error: Error): ErrorDetails => {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return {
      type: 'network',
      title: 'Problema de Conexão',
      description: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
      icon: <Wifi className="w-12 h-12" />,
      suggestions: [
        'Verifique sua conexão WiFi ou dados móveis',
        'Tente recarregar a página',
        'Aguarde alguns minutos e tente novamente',
      ],
      canRetry: true,
    };
  }

  if (message.includes('500') || message.includes('server') || name.includes('server')) {
    return {
      type: 'server',
      title: 'Erro no Servidor',
      description: 'Nosso servidor está com dificuldades. Nossa equipe já foi notificada.',
      icon: <Server className="w-12 h-12" />,
      suggestions: [
        'Isso geralmente é temporário',
        'Tente novamente em alguns minutos',
        'Se persistir, entre em contato conosco',
      ],
      canRetry: true,
    };
  }

  if (message.includes('401') || message.includes('403') || message.includes('unauthorized') || message.includes('forbidden')) {
    return {
      type: 'auth',
      title: 'Acesso Negado',
      description: 'Você não tem permissão para acessar este recurso.',
      icon: <Lock className="w-12 h-12" />,
      suggestions: [
        'Faça login novamente',
        'Verifique suas permissões',
        'Contate o administrador se precisar de acesso',
      ],
      canRetry: false,
    };
  }

  if (message.includes('404') || message.includes('not found')) {
    return {
      type: 'notfound',
      title: 'Não Encontrado',
      description: 'O recurso que você procura não existe ou foi movido.',
      icon: <FileQuestion className="w-12 h-12" />,
      suggestions: [
        'Verifique se o endereço está correto',
        'O item pode ter sido removido',
        'Tente buscar novamente',
      ],
      canRetry: false,
    };
  }

  return {
    type: 'unknown',
    title: 'Algo deu errado',
    description: 'Ocorreu um erro inesperado. Estamos trabalhando para resolver.',
    icon: <Bug className="w-12 h-12" />,
    suggestions: [
      'Tente recarregar a página',
      'Limpe o cache do navegador',
      'Se o problema persistir, entre em contato',
    ],
    canRetry: true,
  };
};

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class HumanizedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    
    // Log to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleCopyError = async () => {
    const { error, errorInfo } = this.state;
    const errorText = `
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy error:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      const { error, showDetails, copied } = this.state;
      const details = error ? getErrorDetails(error) : getErrorDetails(new Error('Unknown error'));

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg"
          >
            <Card className="p-8 text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className={cn(
                  'mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6',
                  details.type === 'network' && 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
                  details.type === 'server' && 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                  details.type === 'auth' && 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
                  details.type === 'notfound' && 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                  details.type === 'unknown' && 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                )}
              >
                {details.icon}
              </motion.div>

              {/* Title & Description */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold mb-2"
              >
                {details.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground mb-6"
              >
                {details.description}
              </motion.p>

              {/* Suggestions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-muted/50 rounded-lg p-4 mb-6 text-left"
              >
                <p className="text-sm font-medium mb-2">O que você pode tentar:</p>
                <ul className="space-y-1">
                  {details.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 justify-center"
              >
                {details.canRetry && (
                  <Button onClick={this.handleRetry} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Tentar Novamente
                  </Button>
                )}
                <Button variant="outline" onClick={this.handleGoHome} className="gap-2">
                  <Home className="w-4 h-4" />
                  Ir para Início
                </Button>
              </motion.div>

              {/* Technical Details (collapsible) */}
              {error && (
                <Collapsible
                  open={showDetails}
                  onOpenChange={(open) => this.setState({ showDetails: open })}
                  className="mt-6"
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                      {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      Detalhes Técnicos
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-4 p-4 bg-muted rounded-lg text-left">
                      <div className="flex justify-between items-start mb-2">
                        <code className="text-xs text-destructive">{error.name}: {error.message}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={this.handleCopyError}
                          className="h-6 px-2"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {copied ? 'Copiado!' : 'Copiar'}
                        </Button>
                      </div>
                      <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
                        {error.stack}
                      </pre>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Support Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 pt-4 border-t"
              >
                <Button variant="link" size="sm" className="gap-2 text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  Precisa de ajuda? Entre em contato
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Inline error for form fields and smaller components
export const InlineError: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    className="flex items-center gap-2 text-destructive text-sm py-2"
  >
    <AlertTriangle className="w-4 h-4 shrink-0" />
    <span className="flex-1">{message}</span>
    {onRetry && (
      <Button variant="ghost" size="sm" onClick={onRetry} className="h-6 px-2">
        <RefreshCw className="w-3 h-3" />
      </Button>
    )}
  </motion.div>
);

export default HumanizedErrorBoundary;
