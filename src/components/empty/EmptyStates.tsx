import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  FileText, Search, AlertCircle, Inbox, Users, 
  Calendar, Settings, Image, FolderOpen, Plus 
} from 'lucide-react';

// #41 - Empty States Reutilizáveis

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md'
}: EmptyStateProps) {
  const sizeClasses = {
    sm: 'py-6',
    md: 'py-12',
    lg: 'py-20'
  };

  const iconSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      sizeClasses[size],
      className
    )}>
      {icon && (
        <div className={cn(
          'text-muted-foreground mb-4',
          iconSizes[size]
        )}>
          {icon}
        </div>
      )}
      <h3 className={cn(
        'font-semibold text-foreground',
        size === 'sm' && 'text-sm',
        size === 'md' && 'text-base',
        size === 'lg' && 'text-lg'
      )}>
        {title}
      </h3>
      {description && (
        <p className={cn(
          'text-muted-foreground mt-1 max-w-sm',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base'
        )}>
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex gap-2 mt-4">
          {action && (
            <Button onClick={action.onClick} size={size === 'sm' ? 'sm' : 'default'}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button 
              variant="outline" 
              onClick={secondaryAction.onClick}
              size={size === 'sm' ? 'sm' : 'default'}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Preset Empty States
export function NoDataEmpty({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<Inbox className="h-12 w-12" />}
      title="Nenhum dado encontrado"
      description="Não há dados para exibir no momento."
      action={onAction ? { label: 'Adicionar', onClick: onAction } : undefined}
    />
  );
}

export function NoSearchResultsEmpty({ query, onClear }: { query?: string; onClear?: () => void }) {
  return (
    <EmptyState
      icon={<Search className="h-12 w-12" />}
      title="Nenhum resultado encontrado"
      description={query ? `Nenhum resultado para "${query}"` : 'Tente ajustar seus filtros de busca.'}
      action={onClear ? { label: 'Limpar busca', onClick: onClear } : undefined}
    />
  );
}

export function NoDocumentsEmpty({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="h-12 w-12" />}
      title="Nenhum documento"
      description="Você ainda não tem documentos. Faça upload do primeiro."
      action={onUpload ? { label: 'Upload de documento', onClick: onUpload } : undefined}
    />
  );
}

export function NoUsersEmpty({ onInvite }: { onInvite?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12" />}
      title="Nenhum usuário"
      description="Convide membros para colaborar com você."
      action={onInvite ? { label: 'Convidar usuário', onClick: onInvite } : undefined}
    />
  );
}

export function NoEventsEmpty({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<Calendar className="h-12 w-12" />}
      title="Nenhum evento"
      description="Você não tem eventos agendados."
      action={onCreate ? { label: 'Criar evento', onClick: onCreate } : undefined}
    />
  );
}

export function NoImagesEmpty({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={<Image className="h-12 w-12" />}
      title="Nenhuma imagem"
      description="Faça upload de imagens para visualizar aqui."
      action={onUpload ? { label: 'Upload de imagem', onClick: onUpload } : undefined}
    />
  );
}

export function EmptyFolderState({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<FolderOpen className="h-12 w-12" />}
      title="Pasta vazia"
      description="Esta pasta não contém itens."
      action={onCreate ? { label: 'Adicionar item', onClick: onCreate } : undefined}
    />
  );
}

export function ErrorState({ 
  message, 
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void 
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-12 w-12 text-destructive" />}
      title="Erro ao carregar"
      description={message || 'Ocorreu um erro. Tente novamente.'}
      action={onRetry ? { label: 'Tentar novamente', onClick: onRetry } : undefined}
    />
  );
}

export function ConfigurationNeededState({ onConfigure }: { onConfigure?: () => void }) {
  return (
    <EmptyState
      icon={<Settings className="h-12 w-12" />}
      title="Configuração necessária"
      description="Configure as opções antes de continuar."
      action={onConfigure ? { label: 'Configurar', onClick: onConfigure } : undefined}
    />
  );
}

// Empty State with illustration
export function IllustratedEmptyState({
  illustration,
  title,
  description,
  action,
  className
}: {
  illustration: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16', className)}>
      <div className="mb-6">{illustration}</div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-2 max-w-md text-center">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          <Plus className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
}
