import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import {
  FileQuestion,
  Search,
  Inbox,
  FolderOpen,
  Users,
  Calendar,
  AlertCircle,
  Plus,
} from "lucide-react";

type EmptyStateVariant =
  | "default"
  | "search"
  | "no-data"
  | "no-results"
  | "no-access"
  | "empty-folder"
  | "no-users"
  | "no-events"
  | "error";

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
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
  className?: string;
  size?: "sm" | "md" | "lg";
}

const variantConfig: Record<
  EmptyStateVariant,
  { icon: React.ReactNode; title: string; description: string }
> = {
  default: {
    icon: <Inbox className="h-12 w-12" />,
    title: "Nada aqui ainda",
    description: "Comece adicionando seu primeiro item.",
  },
  search: {
    icon: <Search className="h-12 w-12" />,
    title: "Nenhum resultado encontrado",
    description: "Tente ajustar os filtros ou termos de busca.",
  },
  "no-data": {
    icon: <FileQuestion className="h-12 w-12" />,
    title: "Sem dados disponíveis",
    description: "Os dados aparecerão aqui quando estiverem disponíveis.",
  },
  "no-results": {
    icon: <Search className="h-12 w-12" />,
    title: "Sem resultados",
    description: "Não encontramos nada com os critérios atuais.",
  },
  "no-access": {
    icon: <AlertCircle className="h-12 w-12" />,
    title: "Acesso restrito",
    description: "Você não tem permissão para visualizar este conteúdo.",
  },
  "empty-folder": {
    icon: <FolderOpen className="h-12 w-12" />,
    title: "Pasta vazia",
    description: "Esta pasta não contém arquivos.",
  },
  "no-users": {
    icon: <Users className="h-12 w-12" />,
    title: "Nenhum usuário",
    description: "Adicione usuários para começar.",
  },
  "no-events": {
    icon: <Calendar className="h-12 w-12" />,
    title: "Sem eventos",
    description: "Não há eventos programados para este período.",
  },
  error: {
    icon: <AlertCircle className="h-12 w-12" />,
    title: "Algo deu errado",
    description: "Ocorreu um erro ao carregar os dados. Tente novamente.",
  },
};

const sizeClasses = {
  sm: {
    container: "py-8",
    icon: "h-10 w-10",
    title: "text-base",
    description: "text-sm",
  },
  md: {
    container: "py-12",
    icon: "h-12 w-12",
    title: "text-lg",
    description: "text-sm",
  },
  lg: {
    container: "py-16",
    icon: "h-16 w-16",
    title: "text-xl",
    description: "text-base",
  },
};

export function EmptyState({
  variant = "default",
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
  size = "md",
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const sizes = sizeClasses[size];

  const displayIcon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizes.container,
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", damping: 15 }}
        className="mb-4 text-muted-foreground/50"
      >
        {React.cloneElement(displayIcon as React.ReactElement, {
          className: cn(sizes.icon, "text-muted-foreground/50"),
        })}
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn("font-semibold text-foreground mb-1", sizes.title)}
      >
        {displayTitle}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={cn("text-muted-foreground max-w-md", sizes.description)}
      >
        {displayDescription}
      </motion.p>

      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-wrap items-center gap-3"
        >
          {action && (
            <Button onClick={action.onClick} className="gap-2">
              {action.icon || <Plus className="h-4 w-4" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// Preset empty states for common use cases
export const EmptyStates = {
  NoJobs: () => (
    <EmptyState
      variant="no-data"
      title="Nenhuma ordem de produção"
      description="Crie sua primeira ordem de produção para começar."
      action={{
        label: "Nova Ordem",
        onClick: () => (window.location.href = "/new-job"),
      }}
    />
  ),

  NoOperators: () => (
    <EmptyState
      variant="no-users"
      title="Nenhum operador cadastrado"
      description="Adicione operadores para gerenciar sua equipe."
      action={{
        label: "Adicionar Operador",
        onClick: () => (window.location.href = "/operators"),
      }}
    />
  ),

  NoSearchResults: ({ query }: { query: string }) => (
    <EmptyState
      variant="search"
      title="Nenhum resultado encontrado"
      description={`Não encontramos resultados para "${query}". Tente outros termos.`}
    />
  ),

  NoNotifications: () => (
    <EmptyState
      variant="default"
      icon={<Inbox className="h-12 w-12" />}
      title="Tudo em dia!"
      description="Você não tem notificações pendentes."
    />
  ),

  NoMachines: () => (
    <EmptyState
      variant="no-data"
      title="Nenhuma máquina cadastrada"
      description="Cadastre suas máquinas para gerenciar a produção."
      action={{
        label: "Adicionar Máquina",
        onClick: () => (window.location.href = "/machines"),
      }}
    />
  ),
};
