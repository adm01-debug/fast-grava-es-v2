import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  FileQuestion, 
  Search, 
  Plus, 
  Upload, 
  RefreshCw, 
  AlertCircle,
  Calendar,
  Package,
  Users,
  Bell,
  BarChart3,
  Wrench,
  ClipboardList,
  FolderOpen,
  Zap,
  LucideIcon
} from 'lucide-react';

// Illustration components for different empty states
const EmptyIllustrations = {
  noData: () => (
    <svg className="w-32 h-32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="80" className="fill-muted/30" />
      <rect x="60" y="70" width="80" height="60" rx="8" className="fill-muted stroke-border" strokeWidth="2" />
      <path d="M70 90h60M70 100h40M70 110h50" className="stroke-muted-foreground/40" strokeWidth="2" strokeLinecap="round" />
      <circle cx="140" cy="130" r="25" className="fill-background stroke-primary" strokeWidth="2" />
      <path d="M132 130l5 5 10-10" className="stroke-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  noSearch: () => (
    <svg className="w-32 h-32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="90" cy="90" r="50" className="fill-muted/30 stroke-muted-foreground/30" strokeWidth="3" />
      <line x1="125" y1="125" x2="160" y2="160" className="stroke-muted-foreground/30" strokeWidth="6" strokeLinecap="round" />
      <path d="M75 85a15 15 0 0130 0" className="stroke-muted-foreground/50" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="78" cy="80" r="4" className="fill-muted-foreground/50" />
      <circle cx="102" cy="80" r="4" className="fill-muted-foreground/50" />
    </svg>
  ),
  noJobs: () => (
    <svg className="w-32 h-32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="50" width="120" height="100" rx="10" className="fill-muted/30 stroke-border" strokeWidth="2" />
      <rect x="55" y="70" width="90" height="15" rx="4" className="fill-muted" />
      <rect x="55" y="95" width="70" height="10" rx="3" className="fill-muted/60" />
      <rect x="55" y="115" width="50" height="10" rx="3" className="fill-muted/40" />
      <circle cx="150" cy="50" r="25" className="fill-primary/20 stroke-primary" strokeWidth="2" />
      <path d="M150 40v20M140 50h20" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  noAlerts: () => (
    <svg className="w-32 h-32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="60" className="fill-success/10" />
      <path d="M100 60v50" className="stroke-success" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="125" r="4" className="fill-success" />
      <path d="M60 140c20-30 60-30 80 0" className="stroke-success/50" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="100" cy="100" r="55" className="stroke-success/30" strokeWidth="2" fill="none" />
    </svg>
  ),
  noOperators: () => (
    <svg className="w-32 h-32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="80" r="30" className="fill-muted/40 stroke-border" strokeWidth="2" />
      <path d="M55 160c0-25 20-45 45-45s45 20 45 45" className="fill-muted/30 stroke-border" strokeWidth="2" />
      <circle cx="150" cy="60" r="20" className="fill-primary/20 stroke-primary" strokeWidth="2" />
      <path d="M150 50v20M140 60h20" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  error: () => (
    <svg className="w-32 h-32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="60" className="fill-destructive/10 stroke-destructive/30" strokeWidth="2" />
      <path d="M80 80l40 40M120 80l-40 40" className="stroke-destructive" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="100" r="70" className="stroke-destructive/20" strokeWidth="2" fill="none" strokeDasharray="10 5" />
    </svg>
  ),
  offline: () => (
    <svg className="w-32 h-32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 120c0-30 25-50 50-50s50 20 50 50" className="fill-muted/30 stroke-muted-foreground/30" strokeWidth="3" />
      <rect x="70" y="110" width="60" height="40" rx="5" className="fill-muted stroke-border" strokeWidth="2" />
      <path d="M85 125h30M85 135h20" className="stroke-muted-foreground/50" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 30l140 140" className="stroke-destructive" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
};

type IllustrationType = keyof typeof EmptyIllustrations;

interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'outline' | 'ghost' | 'gradient';
}

interface EmptyStateAdvancedProps {
  type?: IllustrationType;
  icon?: LucideIcon;
  title: string;
  description: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  helpLink?: {
    label: string;
    href: string;
  };
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyStateAdvanced({
  type = 'noData',
  icon: CustomIcon,
  title,
  description,
  primaryAction,
  secondaryAction,
  helpLink,
  compact = false,
  className,
  children,
}: EmptyStateAdvancedProps) {
  const Illustration = EmptyIllustrations[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8 px-4' : 'py-16 px-6',
        className
      )}
    >
      {/* Illustration or Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="mb-6"
      >
        {CustomIcon ? (
          <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center">
            <CustomIcon className="w-10 h-10 text-muted-foreground/60" />
          </div>
        ) : (
          <Illustration />
        )}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className={cn(
          'font-display font-semibold text-foreground',
          compact ? 'text-lg' : 'text-xl'
        )}
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className={cn(
          'text-muted-foreground mt-2 max-w-md',
          compact ? 'text-sm' : 'text-base'
        )}
      >
        {description}
      </motion.p>

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 mt-6"
        >
          {primaryAction && (
            <Button
              variant={primaryAction.variant || 'default'}
              onClick={primaryAction.onClick}
              asChild={!!primaryAction.href}
              className="gap-2"
            >
              {primaryAction.href ? (
                <a href={primaryAction.href}>
                  {primaryAction.icon && <primaryAction.icon className="h-4 w-4" />}
                  {primaryAction.label}
                </a>
              ) : (
                <>
                  {primaryAction.icon && <primaryAction.icon className="h-4 w-4" />}
                  {primaryAction.label}
                </>
              )}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || 'outline'}
              onClick={secondaryAction.onClick}
              asChild={!!secondaryAction.href}
              className="gap-2"
            >
              {secondaryAction.href ? (
                <a href={secondaryAction.href}>
                  {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4" />}
                  {secondaryAction.label}
                </a>
              ) : (
                <>
                  {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4" />}
                  {secondaryAction.label}
                </>
              )}
            </Button>
          )}
        </motion.div>
      )}

      {/* Help Link */}
      {helpLink && (
        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          href={helpLink.href}
          className="mt-4 text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          <Zap className="h-3 w-3" />
          {helpLink.label}
        </motion.a>
      )}

      {/* Custom children */}
      {children && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="mt-6"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

// Preset empty states for common use cases
export function EmptyJobsState({ onCreateJob }: { onCreateJob?: () => void }) {
  return (
    <EmptyStateAdvanced
      type="noJobs"
      title="Nenhum job encontrado"
      description="Comece criando seu primeiro job de produção ou importe dados existentes."
      primaryAction={{
        label: 'Criar Novo Job',
        onClick: onCreateJob,
        icon: Plus,
      }}
      secondaryAction={{
        label: 'Importar Dados',
        icon: Upload,
        href: '/settings?tab=import',
      }}
      helpLink={{
        label: 'Como criar jobs?',
        href: '/knowledge?topic=jobs',
      }}
    />
  );
}

export function EmptyAlertsState() {
  return (
    <EmptyStateAdvanced
      type="noAlerts"
      title="Tudo em ordem! 🎉"
      description="Não há alertas pendentes. Continue assim!"
      primaryAction={{
        label: 'Ver Dashboard',
        href: '/',
        icon: BarChart3,
        variant: 'outline',
      }}
    />
  );
}

export function EmptySearchState({ query, onClear }: { query: string; onClear?: () => void }) {
  return (
    <EmptyStateAdvanced
      type="noSearch"
      title={`Nenhum resultado para "${query}"`}
      description="Tente ajustar os termos de busca ou limpar os filtros."
      primaryAction={{
        label: 'Limpar Busca',
        onClick: onClear,
        icon: RefreshCw,
        variant: 'outline',
      }}
    />
  );
}

export function EmptyOperatorsState({ onAddOperator }: { onAddOperator?: () => void }) {
  return (
    <EmptyStateAdvanced
      type="noOperators"
      title="Nenhum operador cadastrado"
      description="Adicione operadores para gerenciar a produção da sua equipe."
      primaryAction={{
        label: 'Adicionar Operador',
        onClick: onAddOperator,
        icon: Plus,
      }}
      helpLink={{
        label: 'Como gerenciar operadores?',
        href: '/knowledge?topic=operators',
      }}
    />
  );
}

export function EmptyMaintenanceState() {
  return (
    <EmptyStateAdvanced
      icon={Wrench}
      title="Nenhuma manutenção agendada"
      description="Configure o calendário de manutenção preventiva para suas máquinas."
      primaryAction={{
        label: 'Configurar Manutenção',
        href: '/tpm',
        icon: Calendar,
      }}
    />
  );
}

export function EmptyTraceabilityState() {
  return (
    <EmptyStateAdvanced
      icon={Package}
      title="Nenhum lote registrado"
      description="Inicie o rastreamento de lotes a partir dos jobs de produção."
      primaryAction={{
        label: 'Ver Jobs',
        href: '/kanban',
        icon: ClipboardList,
      }}
    />
  );
}

export function EmptyDocumentsState({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyStateAdvanced
      icon={FolderOpen}
      title="Nenhum documento encontrado"
      description="Faça upload de documentos técnicos, fichas ou manuais."
      primaryAction={{
        label: 'Upload de Documento',
        onClick: onUpload,
        icon: Upload,
      }}
    />
  );
}

export function ErrorState({ 
  title = 'Algo deu errado',
  description = 'Ocorreu um erro ao carregar os dados.',
  onRetry 
}: { 
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyStateAdvanced
      type="error"
      title={title}
      description={description}
      primaryAction={{
        label: 'Tentar Novamente',
        onClick: onRetry,
        icon: RefreshCw,
      }}
      secondaryAction={{
        label: 'Reportar Problema',
        href: '/settings?tab=support',
        icon: AlertCircle,
        variant: 'ghost',
      }}
    />
  );
}

export function OfflineState() {
  return (
    <EmptyStateAdvanced
      type="offline"
      title="Você está offline"
      description="Verifique sua conexão com a internet e tente novamente."
      primaryAction={{
        label: 'Tentar Novamente',
        onClick: () => window.location.reload(),
        icon: RefreshCw,
      }}
    />
  );
}

export default EmptyStateAdvanced;
