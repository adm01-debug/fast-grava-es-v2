import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  FileSearch, 
  FolderOpen, 
  Inbox, 
  Search, 
  AlertCircle,
  WifiOff,
  Lock,
  FileX,
  Database,
  Filter,
  Calendar,
  Bell,
  Users,
  Settings,
  Package,
  ClipboardList,
  BarChart3,
  LucideIcon,
} from 'lucide-react';

// ============= EMPTY STATE ILLUSTRATIONS =============

type EmptyStateVariant = 
  | 'default'
  | 'search'
  | 'filter'
  | 'noData'
  | 'noResults'
  | 'empty'
  | 'offline'
  | 'error'
  | 'unauthorized'
  | 'noNotifications'
  | 'noUsers'
  | 'noSettings'
  | 'noJobs'
  | 'noSchedule'
  | 'noReports';

interface EmptyStateConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

const EMPTY_STATE_CONFIGS: Record<EmptyStateVariant, EmptyStateConfig> = {
  default: {
    icon: Inbox,
    title: 'Nada aqui ainda',
    description: 'Comece adicionando seu primeiro item.',
    gradient: 'from-muted-foreground/20 to-muted-foreground/5',
  },
  search: {
    icon: Search,
    title: 'Nenhum resultado encontrado',
    description: 'Tente ajustar os termos da sua busca.',
    gradient: 'from-primary/20 to-primary/5',
  },
  filter: {
    icon: Filter,
    title: 'Nenhum item corresponde aos filtros',
    description: 'Tente remover alguns filtros para ver mais resultados.',
    gradient: 'from-info/20 to-info/5',
  },
  noData: {
    icon: Database,
    title: 'Sem dados disponíveis',
    description: 'Ainda não há dados para exibir nesta seção.',
    gradient: 'from-muted-foreground/20 to-muted-foreground/5',
  },
  noResults: {
    icon: FileSearch,
    title: 'Nenhum resultado',
    description: 'Não encontramos nada com os critérios selecionados.',
    gradient: 'from-primary/20 to-primary/5',
  },
  empty: {
    icon: FolderOpen,
    title: 'Pasta vazia',
    description: 'Esta pasta ainda não contém nenhum arquivo.',
    gradient: 'from-warning/20 to-warning/5',
  },
  offline: {
    icon: WifiOff,
    title: 'Você está offline',
    description: 'Verifique sua conexão com a internet.',
    gradient: 'from-destructive/20 to-destructive/5',
  },
  error: {
    icon: AlertCircle,
    title: 'Algo deu errado',
    description: 'Ocorreu um erro ao carregar os dados.',
    gradient: 'from-destructive/20 to-destructive/5',
  },
  unauthorized: {
    icon: Lock,
    title: 'Acesso restrito',
    description: 'Você não tem permissão para ver este conteúdo.',
    gradient: 'from-warning/20 to-warning/5',
  },
  noNotifications: {
    icon: Bell,
    title: 'Nenhuma notificação',
    description: 'Você está em dia! Novas notificações aparecerão aqui.',
    gradient: 'from-success/20 to-success/5',
  },
  noUsers: {
    icon: Users,
    title: 'Nenhum usuário encontrado',
    description: 'Convide membros da equipe para começar.',
    gradient: 'from-primary/20 to-primary/5',
  },
  noSettings: {
    icon: Settings,
    title: 'Configurações não disponíveis',
    description: 'As configurações não puderam ser carregadas.',
    gradient: 'from-muted-foreground/20 to-muted-foreground/5',
  },
  noJobs: {
    icon: ClipboardList,
    title: 'Nenhum trabalho encontrado',
    description: 'Crie um novo trabalho para começar.',
    gradient: 'from-primary/20 to-primary/5',
  },
  noSchedule: {
    icon: Calendar,
    title: 'Agenda vazia',
    description: 'Não há eventos agendados para este período.',
    gradient: 'from-info/20 to-info/5',
  },
  noReports: {
    icon: BarChart3,
    title: 'Sem relatórios',
    description: 'Ainda não há relatórios gerados.',
    gradient: 'from-accent/30 to-accent/5',
  },
};

// ============= MAIN COMPONENT =============

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIllustration?: boolean;
  children?: React.ReactNode;
}

export function EmptyState({
  variant = 'default',
  title,
  description,
  icon: CustomIcon,
  action,
  secondaryAction,
  className,
  size = 'md',
  showIllustration = true,
  children,
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIGS[variant];
  const Icon = CustomIcon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  const sizeClasses = {
    sm: {
      container: 'py-6',
      icon: 'h-10 w-10',
      iconBg: 'h-16 w-16',
      title: 'text-sm font-medium',
      description: 'text-xs',
      gap: 'gap-3',
    },
    md: {
      container: 'py-10',
      icon: 'h-12 w-12',
      iconBg: 'h-20 w-20',
      title: 'text-base font-semibold',
      description: 'text-sm',
      gap: 'gap-4',
    },
    lg: {
      container: 'py-16',
      icon: 'h-16 w-16',
      iconBg: 'h-28 w-28',
      title: 'text-lg font-bold',
      description: 'text-base',
      gap: 'gap-5',
    },
  };

  const s = sizeClasses[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        s.container,
        s.gap,
        className
      )}
    >
      {/* Illustration */}
      {showIllustration && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
          className={cn(
            'relative flex items-center justify-center rounded-full',
            `bg-gradient-to-br ${config.gradient}`,
            s.iconBg
          )}
        >
          {/* Decorative rings */}
          <div className="absolute inset-0 rounded-full border border-current opacity-10" />
          <div className="absolute -inset-2 rounded-full border border-current opacity-5" />
          
          <Icon className={cn('text-muted-foreground', s.icon)} strokeWidth={1.5} />
        </motion.div>
      )}

      {/* Text content */}
      <div className="space-y-1.5 max-w-sm">
        <h3 className={cn('text-foreground', s.title)}>{displayTitle}</h3>
        <p className={cn('text-muted-foreground', s.description)}>{displayDescription}</p>
      </div>

      {/* Actions */}
      {(action || secondaryAction || children) && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-2 mt-2"
        >
          {action && (
            <Button 
              onClick={action.onClick} 
              variant={action.variant || 'default'}
              size={size === 'sm' ? 'sm' : 'default'}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button 
              onClick={secondaryAction.onClick} 
              variant="ghost"
              size={size === 'sm' ? 'sm' : 'default'}
            >
              {secondaryAction.label}
            </Button>
          )}
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

// ============= SPECIALIZED VARIANTS =============

// Search empty state with query display
interface SearchEmptyStateProps {
  query: string;
  onClear?: () => void;
  className?: string;
}

export function SearchEmptyState({ query, onClear, className }: SearchEmptyStateProps) {
  return (
    <EmptyState
      variant="search"
      title="Nenhum resultado encontrado"
      description={`Não encontramos resultados para "${query}"`}
      action={onClear ? { label: 'Limpar busca', onClick: onClear, variant: 'outline' } : undefined}
      className={className}
    />
  );
}

// Filter empty state
interface FilterEmptyStateProps {
  onClearFilters?: () => void;
  className?: string;
}

export function FilterEmptyState({ onClearFilters, className }: FilterEmptyStateProps) {
  return (
    <EmptyState
      variant="filter"
      action={onClearFilters ? { label: 'Limpar filtros', onClick: onClearFilters, variant: 'outline' } : undefined}
      className={className}
    />
  );
}

// Error empty state with retry
interface ErrorEmptyStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorEmptyState({ message, onRetry, className }: ErrorEmptyStateProps) {
  return (
    <EmptyState
      variant="error"
      description={message || 'Ocorreu um erro ao carregar os dados.'}
      action={onRetry ? { label: 'Tentar novamente', onClick: onRetry } : undefined}
      className={className}
    />
  );
}

// Table empty state
interface TableEmptyStateProps {
  variant?: 'noData' | 'noResults' | 'filter';
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

export function TableEmptyState({ 
  variant = 'noData', 
  onAction, 
  actionLabel,
  className 
}: TableEmptyStateProps) {
  return (
    <EmptyState
      variant={variant}
      size="md"
      action={onAction && actionLabel ? { label: actionLabel, onClick: onAction } : undefined}
      className={cn('min-h-[200px]', className)}
    />
  );
}

export default {
  EmptyState,
  SearchEmptyState,
  FilterEmptyState,
  ErrorEmptyState,
  TableEmptyState,
};
