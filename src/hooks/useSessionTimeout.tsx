import * as React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Clock, LogOut, RefreshCw } from "lucide-react";

// ============================================
// SESSION TIMEOUT HANDLER
// Gerenciamento de sessão com warning
// ============================================

interface SessionTimeoutConfig {
  /**
   * Tempo de inatividade antes do warning (em minutos)
   * @default 25
   */
  warningTimeout?: number;
  
  /**
   * Tempo após warning antes do logout (em minutos)
   * @default 5
   */
  logoutTimeout?: number;
  
  /**
   * Callback quando a sessão expirar
   */
  onSessionExpired?: () => void;
  
  /**
   * Callback quando a sessão for renovada
   */
  onSessionRenewed?: () => void;
}

interface SessionTimeoutState {
  showWarning: boolean;
  remainingTime: number;
  isActive: boolean;
}

export function useSessionTimeout({
  warningTimeout = 25,
  logoutTimeout = 5,
  onSessionExpired,
  onSessionRenewed,
}: SessionTimeoutConfig = {}) {
  const navigate = useNavigate();
  const [state, setState] = React.useState<SessionTimeoutState>({
    showWarning: false,
    remainingTime: logoutTimeout * 60,
    isActive: true,
  });

  const warningTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = React.useRef<number>(Date.now());

  // Reset all timers
  const resetTimers = React.useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    setState((prev) => ({
      ...prev,
      showWarning: false,
      remainingTime: logoutTimeout * 60,
    }));

    // Set warning timer
    warningTimerRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, showWarning: true }));
      startCountdown();
    }, warningTimeout * 60 * 1000);

    lastActivityRef.current = Date.now();
  }, [warningTimeout, logoutTimeout]);

  // Start countdown when warning is shown
  const startCountdown = React.useCallback(() => {
    let remaining = logoutTimeout * 60;

    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setState((prev) => ({ ...prev, remainingTime: remaining }));

      if (remaining <= 0) {
        handleLogout();
      }
    }, 1000);

    // Set logout timer as backup
    logoutTimerRef.current = setTimeout(() => {
      handleLogout();
    }, logoutTimeout * 60 * 1000);
  }, [logoutTimeout]);

  // Handle logout
  const handleLogout = React.useCallback(async () => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    setState({ showWarning: false, remainingTime: 0, isActive: false });

    try {
      await supabase.auth.signOut();
      onSessionExpired?.();
      toast.info("Sessão expirada", {
        description: "Você foi desconectado por inatividade.",
      });
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [navigate, onSessionExpired]);

  // Extend session
  const extendSession = React.useCallback(() => {
    resetTimers();
    onSessionRenewed?.();
    toast.success("Sessão renovada", {
      description: "Sua sessão foi estendida com sucesso.",
    });
  }, [resetTimers, onSessionRenewed]);

  // Activity detection
  React.useEffect(() => {
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];

    const handleActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      // Only reset if more than 1 minute since last activity (debounce)
      if (timeSinceLastActivity > 60000 && !state.showWarning) {
        resetTimers();
      }

      lastActivityRef.current = now;
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timer setup
    resetTimers();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [resetTimers, state.showWarning]);

  return {
    ...state,
    extendSession,
    logout: handleLogout,
  };
}

// ============================================
// SESSION TIMEOUT DIALOG
// ============================================

interface SessionTimeoutDialogProps {
  config?: SessionTimeoutConfig;
}

export function SessionTimeoutDialog({ config }: SessionTimeoutDialogProps) {
  const { showWarning, remainingTime, extendSession, logout } = useSessionTimeout(config);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <AlertDialogTitle>Sessão expirando</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              Sua sessão irá expirar em breve por inatividade. Deseja continuar
              conectado?
            </p>
            <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
              <span className="text-3xl font-mono font-bold text-warning">
                {formatTime(remainingTime)}
              </span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair agora
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={extendSession}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Continuar conectado
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================
// SESSION PROVIDER
// ============================================

interface SessionProviderProps {
  children: React.ReactNode;
  config?: SessionTimeoutConfig;
  enabled?: boolean;
}

export function SessionProvider({ children, config, enabled = true }: SessionProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {children}
      {enabled && isAuthenticated && <SessionTimeoutDialog config={config} />}
    </>
  );
}
