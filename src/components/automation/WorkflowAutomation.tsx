import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Clock,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed" | "error" | "skipped";
  duration?: number;
  estimatedDuration?: number;
  data?: Record<string, any>;
}

interface WorkflowAutomationProps {
  title: string;
  description?: string;
  steps: WorkflowStep[];
  onStepComplete?: (stepId: string, data?: any) => void;
  onWorkflowComplete?: () => void;
  onRetry?: (stepId: string) => void;
  isRunning?: boolean;
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
}

const statusConfig = {
  pending: { color: "text-muted-foreground", bg: "bg-muted", icon: Clock },
  in_progress: { color: "text-primary", bg: "bg-primary/10", icon: Zap },
  completed: { color: "text-success", bg: "bg-success/10", icon: CheckCircle },
  error: { color: "text-destructive", bg: "bg-destructive/10", icon: AlertCircle },
  skipped: { color: "text-muted-foreground", bg: "bg-muted", icon: ChevronRight },
};

export function WorkflowAutomation({
  title,
  description,
  steps,
  onStepComplete,
  onWorkflowComplete,
  onRetry,
  isRunning = false,
  onStart,
  onPause,
  onReset,
}: WorkflowAutomationProps) {
  const completedSteps = steps.filter((s) => s.status === "completed").length;
  const progress = (completedSteps / steps.length) * 100;
  const currentStep = steps.find((s) => s.status === "in_progress");

  // Total estimated time
  const totalEstimated = steps.reduce((acc, s) => acc + (s.estimatedDuration || 0), 0);
  const totalElapsed = steps.reduce((acc, s) => acc + (s.duration || 0), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isRunning ? (
            <Button variant="outline" size="sm" onClick={onPause}>
              <Pause className="h-4 w-4 mr-1" />
              Pausar
            </Button>
          ) : (
            <Button size="sm" onClick={onStart} disabled={progress === 100}>
              <Play className="h-4 w-4 mr-1" />
              {progress > 0 ? "Continuar" : "Iniciar"}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Progresso: {completedSteps} de {steps.length} etapas
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {totalEstimated > 0 && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Estimado: {formatDuration(totalEstimated)}
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Decorrido: {formatDuration(totalElapsed)}
              </span>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {steps.map((step, index) => {
            const config = statusConfig[step.status];
            const Icon = config.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg border transition-colors",
                  step.status === "in_progress" && "border-primary bg-primary/5"
                )}
              >
                {/* Step number and icon */}
                <div
                  className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium",
                    config.bg,
                    config.color
                  )}
                >
                  {step.status === "completed" || step.status === "error" ? (
                    <Icon className="h-4 w-4" />
                  ) : step.status === "in_progress" ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("font-medium text-sm", config.color)}>
                      {step.title}
                    </p>
                    {step.status === "in_progress" && (
                      <Badge variant="secondary" className="text-xs">
                        Em andamento
                      </Badge>
                    )}
                  </div>
                  {step.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {step.description}
                    </p>
                  )}
                </div>

                {/* Duration */}
                {step.duration !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(step.duration)}
                  </span>
                )}

                {/* Retry button for errors */}
                {step.status === "error" && onRetry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onRetry(step.id)}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Tentar novamente
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Completion message */}
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20"
          >
            <CheckCircle className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium text-success">Workflow concluído!</p>
              <p className="text-sm text-muted-foreground">
                Todas as etapas foram executadas com sucesso.
              </p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
}

// Simple automation trigger button
interface AutomationTriggerProps {
  label: string;
  description?: string;
  isRunning?: boolean;
  onTrigger: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
}

export function AutomationTrigger({
  label,
  description,
  isRunning,
  onTrigger,
  icon,
  variant = "default",
}: AutomationTriggerProps) {
  return (
    <Button
      variant={variant}
      className="h-auto py-3 px-4 flex-col items-start gap-1"
      onClick={onTrigger}
      disabled={isRunning}
    >
      <div className="flex items-center gap-2">
        {isRunning ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Zap className="h-4 w-4" />
          </motion.div>
        ) : (
          icon || <Zap className="h-4 w-4" />
        )}
        <span className="font-medium">{label}</span>
      </div>
      {description && (
        <span className="text-xs text-muted-foreground font-normal">
          {description}
        </span>
      )}
    </Button>
  );
}
