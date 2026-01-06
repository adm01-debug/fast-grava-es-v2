import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  Shield,
  LogOut,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Session {
  id: string;
  device: string;
  deviceType: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  location?: string;
  ip: string;
  lastActive: Date;
  createdAt: Date;
  isCurrent: boolean;
}

interface SessionManagementProps {
  sessions: Session[];
  onTerminateSession: (sessionId: string) => Promise<void>;
  onTerminateAllOther: () => Promise<void>;
}

const deviceIcons: Record<string, React.ReactNode> = {
  desktop: <Monitor className="h-5 w-5" />,
  mobile: <Smartphone className="h-5 w-5" />,
  tablet: <Tablet className="h-5 w-5" />,
};

export function SessionManagement({
  sessions,
  onTerminateSession,
  onTerminateAllOther,
}: SessionManagementProps) {
  const [selectedSession, setSelectedSession] = React.useState<Session | null>(null);
  const [showTerminateAll, setShowTerminateAll] = React.useState(false);
  const [isTerminating, setIsTerminating] = React.useState(false);

  const handleTerminate = async (sessionId: string) => {
    setIsTerminating(true);
    try {
      await onTerminateSession(sessionId);
      setSelectedSession(null);
    } finally {
      setIsTerminating(false);
    }
  };

  const handleTerminateAll = async () => {
    setIsTerminating(true);
    try {
      await onTerminateAllOther();
      setShowTerminateAll(false);
    } finally {
      setIsTerminating(false);
    }
  };

  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Sessões Ativas</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os dispositivos conectados à sua conta
          </p>
        </div>
        {otherSessions.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTerminateAll(true)}
            className="text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Encerrar outras sessões
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-lg border ${
                session.isCurrent ? "border-primary/30 bg-primary/5" : ""
              }`}
            >
              {/* Device icon */}
              <div className="flex-shrink-0 p-3 rounded-full bg-muted">
                {deviceIcons[session.deviceType]}
              </div>

              {/* Session info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">
                    {session.browser} em {session.os}
                  </p>
                  {session.isCurrent && (
                    <Badge variant="default" className="flex-shrink-0">
                      Sessão atual
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  {session.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {session.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(session.lastActive, {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {!session.isCurrent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSession(session)}
                  className="flex-shrink-0 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Session details dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-warning" />
              Encerrar Sessão
            </DialogTitle>
            <DialogDescription>
              Esta ação irá desconectar o dispositivo da sua conta.
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="p-3 rounded-full bg-muted">
                  {deviceIcons[selectedSession.deviceType]}
                </div>
                <div>
                  <p className="font-medium">
                    {selectedSession.browser} em {selectedSession.os}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    IP: {selectedSession.ip}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Primeira conexão</p>
                  <p className="font-medium">
                    {format(selectedSession.createdAt, "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Última atividade</p>
                  <p className="font-medium">
                    {formatDistanceToNow(selectedSession.lastActive, {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSession(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedSession && handleTerminate(selectedSession.id)}
              disabled={isTerminating}
            >
              {isTerminating ? "Encerrando..." : "Encerrar Sessão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terminate all dialog */}
      <AlertDialog open={showTerminateAll} onOpenChange={setShowTerminateAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Encerrar Todas as Outras Sessões?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá desconectar {otherSessions.length} dispositivo(s) da sua conta.
              Você precisará fazer login novamente nesses dispositivos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTerminateAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isTerminating ? "Encerrando..." : "Encerrar Todas"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Confirmation dialog component for sensitive actions
interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void | Promise<void>;
  requireTyping?: string; // Require user to type something to confirm
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "default",
  onConfirm,
  requireTyping,
}: ConfirmationDialogProps) {
  const [typedValue, setTypedValue] = React.useState("");
  const [isConfirming, setIsConfirming] = React.useState(false);

  const canConfirm = !requireTyping || typedValue === requireTyping;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onOpenChange(false);
      setTypedValue("");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {requireTyping && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Para confirmar, digite{" "}
              <span className="font-mono font-bold text-foreground">
                {requireTyping}
              </span>{" "}
              abaixo:
            </p>
            <input
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder={`Digite "${requireTyping}"`}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setTypedValue("")}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canConfirm || isConfirming}
            className={
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
          >
            {isConfirming ? "Confirmando..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
