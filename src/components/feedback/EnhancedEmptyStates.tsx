import React from 'react';
import { motion } from 'framer-motion';
import { 
  Inbox, 
  Search, 
  FileText, 
  Users, 
  Calendar, 
  Settings, 
  AlertCircle,
  Plus,
  RefreshCw,
  Filter,
  ArrowRight,
  Sparkles,
  FolderOpen,
  ClipboardList,
  BarChart3,
  Wrench,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  type: 'no-data' | 'no-results' | 'error' | 'no-access' | 'first-time';
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  suggestions?: string[];
  className?: string;
}

// Animated illustration components
const FloatingIllustration: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    animate={{ 
      y: [0, -10, 0],
    }}
    transition={{ 
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }}
    className="relative"
  >
    {children}
    <motion.div
      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl -z-10"
    />
  </motion.div>
);

// Pre-built empty state illustrations
const illustrations = {
  inbox: (
    <div className="relative w-24 h-24">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="w-20 h-16 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/30" />
      </motion.div>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute -top-2 left-1/2 -translate-x-1/2"
      >
        <Inbox className="w-8 h-8 text-muted-foreground" />
      </motion.div>
    </div>
  ),
  search: (
    <div className="relative w-24 h-24">
      <motion.div
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex items-center justify-center"
      >
        <Search className="w-16 h-16 text-muted-foreground" />
      </motion.div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        className="absolute top-0 right-0"
      >
        <div className="w-4 h-4 rounded-full bg-primary/50" />
      </motion.div>
    </div>
  ),
  error: (
    <div className="relative w-24 h-24">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="flex items-center justify-center"
      >
        <AlertCircle className="w-16 h-16 text-destructive" />
      </motion.div>
    </div>
  ),
  folder: (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <motion.div
        animate={{ rotateY: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <FolderOpen className="w-16 h-16 text-muted-foreground" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -5, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute top-2"
      >
        <FileText className="w-6 h-6 text-primary" />
      </motion.div>
    </div>
  ),
};

export const EnhancedEmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  icon,
  action,
  secondaryAction,
  suggestions,
  className,
}) => {
  const getDefaultIcon = () => {
    switch (type) {
      case 'no-data':
        return illustrations.inbox;
      case 'no-results':
        return illustrations.search;
      case 'error':
        return illustrations.error;
      case 'no-access':
        return <Settings className="w-16 h-16 text-muted-foreground" />;
      case 'first-time':
        return illustrations.folder;
      default:
        return illustrations.inbox;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
    >
      <FloatingIllustration>
        {icon || getDefaultIcon()}
      </FloatingIllustration>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-xl font-semibold"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-2 text-sm text-muted-foreground max-w-md"
      >
        {description}
      </motion.p>

      {suggestions && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 space-y-1"
        >
          <p className="text-xs text-muted-foreground font-medium">Sugestões:</p>
          <ul className="text-xs text-muted-foreground">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-center gap-1">
                <span className="text-primary">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex flex-col sm:flex-row gap-3"
      >
        {action && (
          <Button onClick={action.onClick} className="gap-2">
            {action.icon || <Plus className="w-4 h-4" />}
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
};

// Pre-configured empty states for common scenarios
export const EmptyStatePresets = {
  NoJobs: ({ onCreateJob }: { onCreateJob: () => void }) => (
    <EnhancedEmptyState
      type="no-data"
      title="Nenhum job encontrado"
      description="Comece criando seu primeiro job de produção. É rápido e fácil!"
      icon={<ClipboardList className="w-16 h-16 text-muted-foreground" />}
      action={{
        label: 'Criar Primeiro Job',
        onClick: onCreateJob,
        icon: <Plus className="w-4 h-4" />,
      }}
      suggestions={[
        'Jobs são ordens de produção',
        'Você pode importar de planilhas',
        'Use templates para agilizar',
      ]}
    />
  ),

  NoSearchResults: ({ query, onClear }: { query: string; onClear: () => void }) => (
    <EnhancedEmptyState
      type="no-results"
      title="Nenhum resultado encontrado"
      description={`Não encontramos nada para "${query}". Tente termos diferentes.`}
      action={{
        label: 'Limpar Busca',
        onClick: onClear,
        icon: <RefreshCw className="w-4 h-4" />,
      }}
      suggestions={[
        'Verifique a ortografia',
        'Use termos mais gerais',
        'Remova filtros aplicados',
      ]}
    />
  ),

  NoMachines: ({ onAdd }: { onAdd: () => void }) => (
    <EnhancedEmptyState
      type="first-time"
      title="Cadastre suas máquinas"
      description="Adicione as máquinas do seu parque industrial para começar a monitorar a produção."
      icon={<Wrench className="w-16 h-16 text-muted-foreground" />}
      action={{
        label: 'Adicionar Máquina',
        onClick: onAdd,
        icon: <Plus className="w-4 h-4" />,
      }}
    />
  ),

  NoReports: ({ onGenerate }: { onGenerate: () => void }) => (
    <EnhancedEmptyState
      type="no-data"
      title="Nenhum relatório disponível"
      description="Gere seu primeiro relatório para visualizar insights sobre sua produção."
      icon={<BarChart3 className="w-16 h-16 text-muted-foreground" />}
      action={{
        label: 'Gerar Relatório',
        onClick: onGenerate,
        icon: <Sparkles className="w-4 h-4" />,
      }}
    />
  ),

  NoInventory: ({ onAdd }: { onAdd: () => void }) => (
    <EnhancedEmptyState
      type="first-time"
      title="Estoque vazio"
      description="Cadastre seus materiais e insumos para controlar o estoque."
      icon={<Package className="w-16 h-16 text-muted-foreground" />}
      action={{
        label: 'Adicionar Item',
        onClick: onAdd,
        icon: <Plus className="w-4 h-4" />,
      }}
    />
  ),

  ErrorState: ({ onRetry }: { onRetry: () => void }) => (
    <EnhancedEmptyState
      type="error"
      title="Algo deu errado"
      description="Não foi possível carregar os dados. Por favor, tente novamente."
      action={{
        label: 'Tentar Novamente',
        onClick: onRetry,
        icon: <RefreshCw className="w-4 h-4" />,
      }}
    />
  ),

  FilteredEmpty: ({ onClearFilters }: { onClearFilters: () => void }) => (
    <EnhancedEmptyState
      type="no-results"
      title="Nenhum item com esses filtros"
      description="Tente ajustar os filtros para ver mais resultados."
      icon={<Filter className="w-16 h-16 text-muted-foreground" />}
      action={{
        label: 'Limpar Filtros',
        onClick: onClearFilters,
        icon: <RefreshCw className="w-4 h-4" />,
      }}
    />
  ),
};

export default EnhancedEmptyState;
