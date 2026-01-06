import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Info, Lightbulb, AlertTriangle, CheckCircle, HelpCircle, Keyboard, Zap } from "lucide-react";

// ============================================================================
// MELHORIA #13: TOOLTIPS INTELIGENTES E CONTEXTUAIS
// Tooltips que se adaptam ao contexto e fornecem informações relevantes
// ============================================================================

interface SmartTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  type?: "info" | "tip" | "warning" | "success" | "help" | "shortcut" | "action";
  shortcut?: string[];
  delay?: number;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  showArrow?: boolean;
  maxWidth?: number;
  interactive?: boolean;
  onAction?: () => void;
  actionLabel?: string;
}

const tooltipStyles = {
  info: {
    icon: Info,
    bgClass: "bg-blue-500/10 border-blue-500/20",
    iconClass: "text-blue-500",
  },
  tip: {
    icon: Lightbulb,
    bgClass: "bg-yellow-500/10 border-yellow-500/20",
    iconClass: "text-yellow-500",
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-orange-500/10 border-orange-500/20",
    iconClass: "text-orange-500",
  },
  success: {
    icon: CheckCircle,
    bgClass: "bg-green-500/10 border-green-500/20",
    iconClass: "text-green-500",
  },
  help: {
    icon: HelpCircle,
    bgClass: "bg-purple-500/10 border-purple-500/20",
    iconClass: "text-purple-500",
  },
  shortcut: {
    icon: Keyboard,
    bgClass: "bg-muted border-border",
    iconClass: "text-muted-foreground",
  },
  action: {
    icon: Zap,
    bgClass: "bg-primary/10 border-primary/20",
    iconClass: "text-primary",
  },
};

export function SmartTooltip({
  children,
  content,
  type = "info",
  shortcut,
  delay = 300,
  side = "top",
  align = "center",
  showArrow = true,
  maxWidth = 300,
  interactive = false,
  onAction,
  actionLabel,
}: SmartTooltipProps) {
  const style = tooltipStyles[type];
  const Icon = style.icon;

  return (
    <TooltipProvider delayDuration={delay}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            "p-0 border shadow-lg",
            style.bgClass,
            interactive && "pointer-events-auto"
          )}
          style={{ maxWidth }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3"
          >
            <div className="flex items-start gap-2">
              <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", style.iconClass)} />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground">{content}</div>
                
                {shortcut && shortcut.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {shortcut.map((key, i) => (
                      <React.Fragment key={i}>
                        <kbd className="px-1.5 py-0.5 text-xs bg-background/50 border border-border rounded font-mono">
                          {key}
                        </kbd>
                        {i < shortcut.length - 1 && (
                          <span className="text-muted-foreground text-xs">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
                
                {onAction && actionLabel && (
                  <button
                    onClick={onAction}
                    className="mt-2 text-xs font-medium text-primary hover:underline"
                  >
                    {actionLabel} →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Tooltip com progresso
interface ProgressTooltipProps {
  children: React.ReactNode;
  title: string;
  progress: number;
  total: number;
  unit?: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function ProgressTooltip({
  children,
  title,
  progress,
  total,
  unit = "",
  side = "top",
}: ProgressTooltipProps) {
  const percentage = Math.round((progress / total) * 100);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className="p-3 min-w-[200px]">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{title}</span>
              <span className="text-xs text-muted-foreground">
                {progress}{unit} / {total}{unit}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="text-xs text-center mt-1 text-muted-foreground">
              {percentage}% concluído
            </div>
          </motion.div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Tooltip com lista de ações
interface ActionTooltipProps {
  children: React.ReactNode;
  actions: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive";
  }[];
  side?: "top" | "right" | "bottom" | "left";
}

export function ActionTooltip({
  children,
  actions,
  side = "top",
}: ActionTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className="p-1 min-w-[150px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-0.5"
          >
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                  action.variant === "destructive"
                    ? "text-destructive hover:bg-destructive/10"
                    : "hover:bg-muted"
                )}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </motion.div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Tooltip com preview de imagem
interface ImagePreviewTooltipProps {
  children: React.ReactNode;
  src: string;
  alt?: string;
  title?: string;
  description?: string;
  side?: "top" | "right" | "bottom" | "left";
}

export function ImagePreviewTooltip({
  children,
  src,
  alt = "",
  title,
  description,
  side = "right",
}: ImagePreviewTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className="p-0 overflow-hidden max-w-[300px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img
              src={src}
              alt={alt}
              className="w-full h-40 object-cover"
            />
            {(title || description) && (
              <div className="p-3">
                {title && <h4 className="font-medium text-sm">{title}</h4>}
                {description && (
                  <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
              </div>
            )}
          </motion.div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Tooltip com estatísticas
interface StatsTooltipProps {
  children: React.ReactNode;
  title: string;
  stats: {
    label: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
  }[];
  side?: "top" | "right" | "bottom" | "left";
}

export function StatsTooltip({
  children,
  title,
  stats,
  side = "top",
}: StatsTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className="p-3 min-w-[220px]">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h4 className="font-medium text-sm mb-3">{title}</h4>
            <div className="space-y-2">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{stat.value}</span>
                    {stat.change !== undefined && (
                      <span
                        className={cn(
                          "text-xs",
                          stat.change >= 0 ? "text-green-500" : "text-red-500"
                        )}
                      >
                        {stat.change >= 0 ? "+" : ""}{stat.change}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Tooltip contextual baseado em primeiro uso
interface FirstTimeTooltipProps {
  children: React.ReactNode;
  id: string;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

export function FirstTimeTooltip({
  children,
  id,
  content,
  side = "top",
}: FirstTimeTooltipProps) {
  const [hasSeenTooltip, setHasSeenTooltip] = React.useState(() => {
    return localStorage.getItem(`tooltip-seen-${id}`) === "true";
  });
  const [isOpen, setIsOpen] = React.useState(!hasSeenTooltip);

  const handleDismiss = () => {
    setIsOpen(false);
    setHasSeenTooltip(true);
    localStorage.setItem(`tooltip-seen-${id}`, "true");
  };

  if (hasSeenTooltip) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip open={isOpen}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          className="p-3 bg-primary text-primary-foreground border-primary"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm">{content}</div>
                <button
                  onClick={handleDismiss}
                  className="mt-2 text-xs opacity-80 hover:opacity-100 underline"
                >
                  Entendi!
                </button>
              </div>
            </div>
          </motion.div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Hook para tooltip contextual
export function useContextualTooltip(context: string) {
  const tips: Record<string, { content: string; type: SmartTooltipProps["type"] }> = {
    "job-status": {
      content: "Clique para ver detalhes ou alterar o status do trabalho",
      type: "tip",
    },
    "machine-health": {
      content: "Indicador de saúde da máquina baseado em manutenções e performance",
      type: "info",
    },
    "production-chart": {
      content: "Arraste para selecionar um período específico",
      type: "tip",
    },
    "quick-action": {
      content: "Use atalhos de teclado para ações rápidas",
      type: "shortcut",
    },
  };

  return tips[context] || { content: "", type: "info" as const };
}
